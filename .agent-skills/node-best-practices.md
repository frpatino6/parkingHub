# Node.js Best Practices — Reference Manual

> **Scope**: This manual is the Single Source of Truth for all server-side code in `backend/`.
> **Runtime**: Node.js 20+ LTS | **Framework**: Express.js 5

---

## 1. Project Architecture (Clean Architecture Layers)

```
backend/src/
├── domain/                    # Enterprise business rules
│   ├── entities/              # Core entities (pure classes, no framework deps)
│   ├── value-objects/         # Immutable value types
│   ├── enums/
│   ├── errors/                # Domain-specific error classes
│   └── ports/                 # Interfaces (repository contracts, service contracts)
├── application/               # Application business rules
│   ├── use-cases/             # One class per use case
│   ├── dtos/                  # Input/output data transfer objects
│   └── interfaces/            # Application-level port interfaces
├── infrastructure/            # Frameworks & drivers
│   ├── database/              # MongoDB connection, Mongoose models
│   │   ├── models/
│   │   ├── repositories/      # Implements domain/ports
│   │   └── connection.ts
│   ├── http/                  # Express setup
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── server.ts
│   ├── services/              # External service adapters (email, payment, etc.)
│   └── config/                # Environment, constants
└── main.ts                    # Composition root (DI wiring)
```

## 2. Dependency Rule

```
domain/ ← application/ ← infrastructure/
  (innermost)                    (outermost)
```

- **domain/** has **ZERO** imports from `application/` or `infrastructure/`
- **application/** imports only from `domain/`
- **infrastructure/** imports from both `domain/` and `application/`
- **Dependency inversion**: infrastructure implements interfaces defined in domain/ports

## 3. Error Handling

### Custom Error Hierarchy
```typescript
// domain/errors/app-error.ts
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly isOperational: boolean;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly isOperational = true;

  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`);
  }
}

export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly isOperational = true;
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly isOperational = true;
}
```

### Centralized Error Middleware
```typescript
// infrastructure/http/middlewares/error-handler.ts
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  logger.error('Unhandled error', { error: err, stack: err.stack });
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
}
```

### Rules
- **Never** use `try/catch` in controllers for business errors — let them propagate to the error middleware
- **Use `express-async-errors`** or wrap route handlers with `asyncHandler()`
- **Distinguish** operational errors (user-facing) from programmer errors (bugs)
- **Log programmer errors** with full stack traces; respond with generic 500
- **Always** handle `unhandledRejection` and `uncaughtException` at process level

## 4. Input Validation (Zod)

```typescript
// application/dtos/create-spot.dto.ts
import { z } from 'zod';

export const CreateSpotSchema = z.object({
  number: z.string().min(1).max(10),
  level: z.number().int().min(-5).max(20),
  type: z.enum(['standard', 'handicapped', 'electric', 'vip']),
  pricePerHour: z.number().positive(),
});

export type CreateSpotDto = z.infer<typeof CreateSpotSchema>;
```

```typescript
// infrastructure/http/middlewares/validate.ts
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(', '));
    }
    req.body = result.data;
    next();
  };
}
```

## 5. Security

```typescript
// infrastructure/http/server.ts
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGINS, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json({ limit: '10kb' }));

### 5.1 Tenant Identification Middleware
```typescript
// infrastructure/http/middlewares/tenant-context.middleware.ts
export function tenantContextMiddleware(req: Request, res: Response, next: NextFunction) {
  const tenantId = req.headers['x-tenant-id'] as string;
  const branchId = req.headers['x-branch-id'] as string; // Sede

  if (!tenantId) throw new UnauthorizedError('Tenant ID missing');
  
  TenantContext.run({ tenantId, branchId }, () => {
    next();
  });
}
```
```

### Rules
- **Always** use `helmet()` for security headers
- **Always** configure CORS explicitly (no wildcard in production)
- **Rate limit** all public endpoints
- **Limit body size** to prevent payload attacks
- **Sanitize** all user inputs
- **Never** expose stack traces in production responses

## 6. Logging (Pino)

```typescript
// infrastructure/config/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  serializers: pino.stdSerializers,
});
```

### Rules
- **Structured JSON logs** in production
- **Pretty print** only in development
- **Log levels**: `fatal`, `error`, `warn`, `info`, `debug`, `trace`
- **Correlation IDs**: attach `requestId` (UUID) to every log via middleware
- **Never** log passwords, tokens, or PII

## 7. Environment Configuration

```typescript
// infrastructure/config/env.ts
import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(32),
  CORS_ORIGINS: z.string().transform(s => s.split(',')),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export const config = envSchema.parse(process.env);
```

### Rules
- **Validate all env vars** at startup with Zod
- **Fail fast** if required vars are missing
- **Never** hardcode secrets — use `.env` (gitignored) + validation

## 8. API Response Format

```typescript
// Success
{ "status": "success", "data": { ... } }

// Error
{ "status": "error", "message": "Human-readable error message" }

// Paginated
{
  "status": "success",
  "data": [...],
  "meta": { "total": 100, "page": 1, "limit": 20, "pages": 5 }
}
```

## 9. Testing

| Type        | Tool      | Location                        |
|-------------|-----------|--------------------------------|
| Unit        | Jest      | `*.spec.ts` colocated          |
| Integration | Jest + Supertest | `*.integration.spec.ts` |
| E2E         | Jest + Supertest | `tests/e2e/`             |

### Unit Test Pattern
```typescript
describe('CreateSpotUseCase', () => {
  let useCase: CreateSpotUseCase;
  let mockRepo: jest.Mocked<SpotRepository>;

  beforeEach(() => {
    mockRepo = { create: jest.fn(), findByNumber: jest.fn() } as any;
    useCase = new CreateSpotUseCase(mockRepo);
  });

  it('should create a parking spot', async () => {
    mockRepo.findByNumber.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue(mockSpot);
    const result = await useCase.execute(validDto);
    expect(result).toEqual(mockSpot);
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining(validDto));
  });
});
```

## 10. Naming Conventions

... (same) ...

## 11. Pricing Engine (Backend Exclusive)

The Pricing Engine is the core of ParkingHub's financial accuracy.

### Rules
- **ZERO Logic on Client**: Fractions, rates, grace periods, and total sums must NEVER be calculated in Angular.
- **Contract**: The backend provides a `calculateFee(ticketId)` endpoint or similar.
- **Precision**: Use integer arithmetic (cents/milavos) or specialized libraries (decimal.js) to avoid floating point errors in COP.

```typescript
// application/use-cases/CalculateTicketFee.UseCase.ts
export class CalculateTicketFeeUseCase {
  async execute(ticketId: string): Promise<number> {
    const ticket = await this.ticketRepo.findById(ticketId);
    const config = await this.branchRepo.getPricingConfig(ticket.branchId);
    
    return PricingEngine.calculate(ticket.checkIn, new Date(), config);
  }
}
```

| Element        | Convention        | Example                       |
|----------------|-------------------|-------------------------------|
| Use Case       | `PascalCase`      | `CreateSpotUseCase`           |
| Repository     | `PascalCase`      | `MongoSpotRepository`         |
| Controller     | `PascalCase`      | `SpotController`              |
| Middleware      | `camelCase`       | `authMiddleware`              |
| Route file     | `kebab-case`      | `spot.routes.ts`              |
| Entity         | `PascalCase`      | `ParkingSpot`                 |
| DTO            | `PascalCase`      | `CreateSpotDto`               |
| File           | `kebab-case`      | `create-spot.use-case.ts`     |
