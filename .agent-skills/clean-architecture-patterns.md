# Clean Architecture Patterns — Reference Manual

> **Scope**: This manual is the Single Source of Truth for architectural decisions across `frontend/` and `backend/`.
> **Principle**: Dependencies always point inward. No inner layer knows about outer layers.

---

## 1. Layer Definitions

```
┌──────────────────────────────────────────────┐
│              Frameworks & Drivers             │  ← Express, Angular, Mongoose
│  ┌────────────────────────────────────────┐  │
│  │         Interface Adapters             │  │  ← Controllers, Presenters, Gateways
│  │  ┌──────────────────────────────────┐  │  │
│  │  │      Application (Use Cases)     │  │  │  ← Orchestrates business rules
│  │  │  ┌────────────────────────────┐  │  │  │
│  │  │  │     Domain (Entities)      │  │  │  │  ← Core business logic
│  │  │  └────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────┘  │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

## 2. Layer Responsibilities

| Layer                | Contents                                    | Depends On   |
|----------------------|---------------------------------------------|-------------|
| **Domain**           | Entities, Value Objects, Enums, Port Interfaces | Nothing     |
| **Application**      | Use Cases, DTOs, Application Services       | Domain       |
| **Interface Adapters**| Controllers, Presenters, Repository Impls  | Application, Domain |
| **Frameworks**       | Express, Angular, Mongoose, 3rd-party libs  | All inner layers |

## 3. The Dependency Rule

```
INWARD ONLY →
  Frameworks → Interface Adapters → Application → Domain
```

### What This Means
- **Domain** has **zero** imports from any other layer
- **Application** imports only from **Domain**
- **Interface Adapters** import from **Application** and **Domain**
- **Frameworks** can import from any layer

### Dependency Inversion
Use interfaces (ports) defined in **Domain** or **Application**, implemented in **Infrastructure**:

```typescript
// domain/ports/spot-repository.port.ts  ← Interface defined inward
export interface SpotRepository {
  findById(id: string): Promise<ParkingSpot | null>;
  findByLot(lotId: string): Promise<ParkingSpot[]>;
  create(spot: ParkingSpot): Promise<ParkingSpot>;
  update(spot: ParkingSpot): Promise<ParkingSpot>;
  delete(id: string): Promise<void>;
}

// infrastructure/database/repositories/mongo-spot.repository.ts  ← Implemented outward
export class MongoSpotRepository implements SpotRepository {
  async findById(id: string): Promise<ParkingSpot | null> {
    const doc = await ParkingSpotModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }
  // ... other methods
}
```

## 4. Backend Layer Structure

```
backend/src/
├── domain/                          # Layer 1 — Core
│   ├── entities/
│   │   ├── parking-spot.ts          # Pure class, no framework imports
│   │   ├── reservation.ts
│   │   └── user.ts
│   ├── value-objects/
│   │   ├── money.ts
│   │   ├── time-range.ts
│   │   └── license-plate.ts
│   ├── enums/
│   │   ├── spot-status.enum.ts
│   │   └── spot-type.enum.ts
│   ├── errors/
│   │   └── domain-errors.ts
│   └── ports/                       # Contracts (interfaces)
│       ├── spot-repository.port.ts
│       ├── reservation-repository.port.ts
│       └── notification-service.port.ts
│
├── application/                     # Layer 2 — Use Cases
│   ├── use-cases/
│   │   ├── create-spot.use-case.ts
│   │   ├── reserve-spot.use-case.ts
│   │   └── get-available-spots.use-case.ts
│   ├── dtos/
│   │   ├── create-spot.dto.ts
│   │   └── reserve-spot.dto.ts
│   └── interfaces/
│       └── use-case.interface.ts    # Generic UseCase<Input, Output>
│
├── infrastructure/                  # Layer 3+4 — Adapters & Frameworks
│   ├── database/
│   │   ├── models/                  # Mongoose schemas
│   │   ├── repositories/           # Implements domain/ports
│   │   └── connection.ts
│   ├── http/
│   │   ├── controllers/            # Route handlers
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── server.ts
│   └── config/
│
└── main.ts                          # Composition Root
```

## 5. Frontend Layer Structure

```
frontend/src/app/
├── core/
│   ├── domain/                      # Layer 1 — Entities, interfaces
│   │   ├── entities/
│   │   │   ├── parking-spot.model.ts
│   │   │   └── reservation.model.ts
│   │   └── ports/
│   │       ├── spot.repository.ts   # Abstract class / interface
│   │       └── auth.service.ts
│   │
│   ├── application/                 # Layer 2 — Use Cases (Angular services)
│   │   ├── spot.facade.ts           # Orchestrates domain logic
│   │   └── reservation.facade.ts
│   │
│   └── infrastructure/             # Layer 3 — HTTP adapters
│       ├── http-spot.repository.ts  # Implements domain/ports
│       ├── http-auth.service.ts
│       └── interceptors/
│
├── features/                        # Layer 4 — Presentation
│   └── parking/
│       ├── presentation/
│       │   ├── parking-list/
│       │   ├── parking-detail/
│       │   └── parking-form/
│       └── parking.routes.ts
│
└── shared/                          # Cross-cutting UI components
```

## 6. Use Case Pattern

```typescript
// application/interfaces/use-case.interface.ts
export interface UseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}
```

```typescript
// application/use-cases/reserve-spot.use-case.ts
import { SpotRepository } from '../../domain/ports/spot-repository.port';
import { ReservationRepository } from '../../domain/ports/reservation-repository.port';
import { ReserveSpotDto } from '../dtos/reserve-spot.dto';
import { Reservation } from '../../domain/entities/reservation';
import { NotFoundError } from '../../domain/errors/domain-errors';

export class ReserveSpotUseCase implements UseCase<ReserveSpotDto, Reservation> {
  constructor(
    private readonly spotRepo: SpotRepository,
    private readonly reservationRepo: ReservationRepository,
  ) {}

  async execute(dto: ReserveSpotDto): Promise<Reservation> {
    const spot = await this.spotRepo.findById(dto.spotId);
    if (!spot) throw new NotFoundError('ParkingSpot', dto.spotId);
    if (!spot.isAvailable()) throw new ConflictError('Spot is not available');

    const reservation = Reservation.create(dto);
    spot.markOccupied();

    await this.spotRepo.update(spot);
    return this.reservationRepo.create(reservation);
  }
}
```

### Use Case Rules
- **One use case = one business action**
- **Constructor receives only ports** (interfaces) — never concrete implementations
- **No framework imports** — no Express, no Mongoose, no Angular
- **Returns domain entities or DTOs** — never raw DB documents

## 7. Composition Root (DI Wiring)

```typescript
// backend/src/main.ts — The ONLY place where concrete implementations are wired
import { MongoSpotRepository } from './infrastructure/database/repositories/mongo-spot.repository';
import { CreateSpotUseCase } from './application/use-cases/create-spot.use-case';
import { SpotController } from './infrastructure/http/controllers/spot.controller';

// Wire dependencies
const spotRepository = new MongoSpotRepository();
const createSpotUseCase = new CreateSpotUseCase(spotRepository);
const spotController = new SpotController(createSpotUseCase);

// Register routes
app.use('/api/spots', spotController.router);
```

```typescript
// frontend — Angular DI via app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: SpotRepository, useClass: HttpSpotRepository },
    { provide: AuthService, useClass: HttpAuthService },
  ]
};
```

## 8. Forbidden Cross-Layer Imports

```typescript
// ❌ FORBIDDEN — Domain importing from Infrastructure
// domain/entities/parking-spot.ts
import { ParkingSpotModel } from '../../infrastructure/database/models/parking-spot.model';

// ❌ FORBIDDEN — Application importing from HTTP layer
// application/use-cases/create-spot.use-case.ts
import { Request, Response } from 'express';

// ❌ FORBIDDEN — Domain importing from Application
// domain/entities/parking-spot.ts
import { CreateSpotDto } from '../../application/dtos/create-spot.dto';
```

## 9. Naming Conventions

| Element         | Convention        | Example                          |
|-----------------|-------------------|----------------------------------|
| Entity          | `PascalCase`      | `ParkingSpot`                    |
| Value Object    | `PascalCase`      | `Money`, `TimeRange`             |
| Use Case        | `VerbNoun`        | `CreateSpotUseCase`              |
| Port/Interface  | `NounRepository`  | `SpotRepository`                 |
| DTO             | `VerbNounDto`     | `CreateSpotDto`                  |
| Impl            | `PrefixNoun`      | `MongoSpotRepository`            |
| File            | `kebab-case`      | `create-spot.use-case.ts`        |

## 10. Tenant & Branch (Sede) Context Management

### Context Propagation
The Tenant and Branch context must be captured at the **Infrastructure** layer (Express Middleware) and made available to all inner layers without passing it as an argument to every function.

#### Pattern: AsyncLocalStorage (Node.js)
```typescript
// infrastructure/context/tenant-context.ts
import { AsyncLocalStorage } from 'async_hooks';

export class TenantContext {
  private static storage = new AsyncLocalStorage<{ tenantId: string, branchId: string }>();

  static run(context: { tenantId: string, branchId: string }, next: () => void) {
    this.storage.run(context, next);
  }

  static get() {
    return this.storage.getStore();
  }
}
```

#### Layers and Context
1. **Frameworks (HTTP)**: Middleware extracts `tenantId` and `branchId` from JWT/Headers.
2. **Infrastructure (DB)**: Repositories use `TenantContext.get()` to filter queries automatically.
3. **Application (Use Cases)**: Business logic can access context if needed for validation.
4. **Domain**: Entities remain pure, but may contain `tenantId` for persistence.

### Multi-Branch Support
- An entity (like `ParkingSpot`) belongs to exactly one `Branch`.
- A `Branch` belongs to exactly one `Tenant`.
- Queries should default to the **Current Branch** context.

## 11. Testing by Layer

| Layer           | What to Test                        | Dependencies    |
|-----------------|-------------------------------------|-----------------|
| **Domain**      | Entity logic, value object validation | None (pure)     |
| **Application** | Use case orchestration              | Mocked ports     |
| **Infrastructure** | Repository queries, controller routes | Test DB / Supertest |
