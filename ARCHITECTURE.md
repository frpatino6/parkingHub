# ParkingHub — Resumen Técnico de Arquitectura

> **Fecha:** Febrero 2026
> **Stack:** Angular 19 + Node.js/Express 5 · TypeScript strict · MongoDB Atlas · Clean Architecture
> **Tipo:** SaaS multitenant para gestión de parqueaderos en Colombia

---

## 1. Árbol de carpetas (`src/`)

### Backend

```
backend/src/
├── domain/                              # Capa 1 — Zero deps
│   ├── entities/
│   │   ├── Ticket.Entity.ts
│   │   ├── CashCut.Entity.ts
│   │   ├── PricingConfig.Entity.ts
│   │   ├── User.Entity.ts
│   │   ├── Branch.Entity.ts
│   │   ├── Tenant.Entity.ts
│   │   └── AuditLog.Entity.ts
│   ├── value-objects/
│   │   └── money.value-object.ts        # COP integer, sin float
│   ├── enums/
│   │   ├── vehicle-type.enum.ts         # CAR | MOTORCYCLE | BICYCLE
│   │   ├── ticket-status.enum.ts        # OPEN | PAID | CANCELLED
│   │   ├── pricing-mode.enum.ts         # MINUTE | FRACTION | BLOCK
│   │   ├── payment-method.enum.ts
│   │   ├── user-role.enum.ts            # SUPER_ADMIN | PARKING_ADMIN | OPERATOR
│   │   └── audit-action.enum.ts
│   ├── errors/
│   │   └── domain-errors.ts
│   └── ports/                           # Interfaces (DI)
│       ├── TicketRepository.Port.ts
│       ├── CashCutRepository.Port.ts
│       ├── PricingConfigRepository.Port.ts
│       ├── UserRepository.Port.ts
│       ├── BranchRepository.Port.ts
│       ├── TenantRepository.Port.ts
│       └── AuditLogRepository.Port.ts
│
├── application/                         # Capa 2 — Solo importa Domain
│   ├── use-cases/
│   │   ├── ticket/
│   │   │   ├── CheckIn.UseCase.ts
│   │   │   ├── CheckOut.UseCase.ts
│   │   │   ├── GetTicketByQr.UseCase.ts
│   │   │   └── CancelTicket.UseCase.ts
│   │   ├── cash-cut/
│   │   │   ├── OpenCashCut.UseCase.ts
│   │   │   ├── CloseCashCut.UseCase.ts
│   │   │   └── GetCurrentCashCut.UseCase.ts
│   │   ├── auth/Login.UseCase.ts
│   │   ├── user/CreateUser.UseCase.ts
│   │   ├── branch/CreateBranch.UseCase.ts
│   │   └── pricing/CreatePricingConfig.UseCase.ts
│   ├── services/
│   │   └── pricing-engine.service.ts    # Motor de tarifas (puro, sin deps de infra)
│   ├── dtos/
│   │   ├── check-in.dto.ts
│   │   ├── check-out.dto.ts
│   │   ├── cancel-ticket.dto.ts
│   │   ├── open-cash-cut.dto.ts
│   │   ├── close-cash-cut.dto.ts
│   │   ├── create-user.dto.ts
│   │   ├── create-branch.dto.ts
│   │   ├── create-pricing-config.dto.ts
│   │   └── login.dto.ts
│   ├── ports/
│   │   ├── hashing.service.port.ts
│   │   ├── token.service.port.ts
│   │   └── qr-code.service.port.ts
│   └── interfaces/
│       └── use-case.interface.ts        # UseCase<TInput, TOutput>
│
├── infrastructure/                      # Capa 3+4 — Frameworks
│   ├── database/
│   │   ├── connection.ts
│   │   ├── models/                      # Mongoose schemas
│   │   │   ├── ticket.model.ts
│   │   │   ├── cash-cut.model.ts
│   │   │   ├── pricing-config.model.ts
│   │   │   ├── user.model.ts
│   │   │   ├── branch.model.ts
│   │   │   ├── tenant.model.ts
│   │   │   └── audit-log.model.ts
│   │   └── repositories/               # Implementan domain/ports
│   │       ├── MongoTicket.Repository.ts
│   │       ├── MongoCashCut.Repository.ts
│   │       ├── MongoPricingConfig.Repository.ts
│   │       ├── MongoUser.Repository.ts
│   │       ├── MongoBranch.Repository.ts
│   │       ├── MongoTenant.Repository.ts
│   │       └── MongoAuditLog.Repository.ts
│   ├── http/
│   │   ├── server.ts                    # Express 5 + Helmet + CORS + rate-limit
│   │   ├── controllers/
│   │   │   ├── Ticket.Controller.ts
│   │   │   ├── CashCut.Controller.ts
│   │   │   ├── Auth.Controller.ts
│   │   │   ├── User.Controller.ts
│   │   │   ├── Branch.Controller.ts
│   │   │   └── PricingConfig.Controller.ts
│   │   ├── routes/
│   │   │   ├── ticket.routes.ts
│   │   │   ├── cash-cut.routes.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── branch.routes.ts
│   │   │   └── pricing-config.routes.ts
│   │   └── middlewares/
│   │       ├── auth.middleware.ts        # JWT verification
│   │       ├── TenantContext.Middleware.ts # AsyncLocalStorage
│   │       ├── validate.middleware.ts    # Zod schema validation
│   │       └── error-handler.middleware.ts
│   ├── services/
│   │   ├── bcrypt-hashing.service.ts
│   │   ├── jwt-token.service.ts
│   │   └── qrcode.service.ts
│   └── config/
│       ├── env.ts                       # Zod env validation
│       ├── TenantContext.ts             # AsyncLocalStorage<{tenantId, branchId}>
│       └── logger.ts                    # Pino structured JSON
│
├── scripts/
│   └── seed.ts                          # Crea: Tenant + Branch + User + PricingConfig
└── main.ts                              # Composition Root (wiring DI manual)
```

### Frontend

```
frontend/src/app/
├── core/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── CheckInResult.model.ts
│   │   │   ├── TicketInfo.model.ts
│   │   │   └── CashCut.model.ts
│   │   ├── enums/
│   │   │   ├── VehicleType.enum.ts
│   │   │   └── PaymentMethod.enum.ts
│   │   └── ports/
│   │       ├── TicketRepository.Port.ts   # abstract class
│   │       └── CashCutRepository.Port.ts
│   └── infrastructure/
│       ├── http/
│       │   ├── HttpTicket.Repository.ts   # Implementa TicketRepository.Port
│       │   ├── HttpCashCut.Repository.ts  # Implementa CashCutRepository.Port
│       │   └── AuthInterceptor.ts         # Añade Bearer token a cada request
│       ├── auth/
│       │   ├── Auth.Service.ts            # Login + token storage
│       │   └── auth.guard.ts              # Functional canActivate guard
│       └── tokens/api.config.ts           # InjectionToken<API_BASE_URL>
│
├── features/
│   ├── auth/
│   │   └── presentation/Login.Page.Component.ts
│   ├── check-in/
│   │   ├── application/CheckIn.Bloc.ts
│   │   ├── presentation/
│   │   │   ├── CheckIn.Page.Component.ts
│   │   │   ├── CheckIn.Page.Component.html
│   │   │   └── CheckIn.Page.Component.scss
│   │   └── CheckIn.routes.ts
│   ├── check-out/
│   │   ├── application/CheckOut.Bloc.ts
│   │   ├── presentation/
│   │   │   ├── CheckOut.Page.Component.ts
│   │   │   ├── CheckOut.Page.Component.html
│   │   │   └── CheckOut.Page.Component.scss
│   │   └── CheckOut.routes.ts
│   └── cash-cut/
│       ├── application/CashCut.Bloc.ts
│       ├── presentation/
│       │   ├── CashCut.Page.Component.ts
│       │   ├── CashCut.Page.Component.html
│       │   └── CashCut.Page.Component.scss
│       └── CashCut.routes.ts
│
├── shared/
│   └── layouts/MainLayout.Component.ts    # Sidebar + router-outlet
│
├── app.config.ts        # DI root: HttpClient, interceptors, port bindings
├── app.routes.ts        # Lazy-loaded feature routes
└── app.component.ts
```

---

## 2. Entidad Ticket (Backend — Domain)

```typescript
// domain/entities/Ticket.Entity.ts

interface TicketProps {
  id?: string;
  tenantId: string;                // Extraído del JWT, nunca del body
  branchId: string;                // Extraído del JWT
  operatorId: string;              // Extraído del JWT
  vehicleType: VehicleType;        // CAR | MOTORCYCLE | BICYCLE
  plate: string;                   // Placa del vehículo (uppercase)
  qrCode: string;                  // UUID único, generado en check-in
  status: TicketStatus;            // OPEN → PAID | CANCELLED
  checkIn: Date;                   // Fecha/hora de ingreso
  checkOut?: Date;                 // Fecha/hora de salida (solo si PAID)
  amount?: Money;                  // Monto cobrado en COP (entero)
  paymentMethod?: PaymentMethod;   // Efectivo | Datáfono
  createdAt?: Date;
  updatedAt?: Date;
}

class Ticket {
  // Factory
  static createNew(params) → status=OPEN, checkIn=now

  // Transiciones de estado
  checkout(amount: Money, paymentMethod) → status=PAID, checkOut=now
  cancel()                               → status=CANCELLED

  // Queries
  isOpen(): boolean
  isPaid(): boolean
  getDurationMinutes(): number  // Math.floor((end - checkIn) / 60_000)
}
```

**Value Object `Money`**: entero no-negativo en COP. Sin decimales ni floats.

**Mongoose Schema** (`ticket.model.ts`):
```
Índices ESR:
  { tenantId: 1, branchId: 1, status: 1 }
  { tenantId: 1, branchId: 1, checkIn: -1 }
  { qrCode: 1 } (unique)
```

---

## 3. Motor de Tarifas (`PricingEngineService`)

Servicio puro de aplicación sin dependencias de infraestructura. **El frontend nunca calcula tarifas.**

```typescript
// application/services/pricing-engine.service.ts

class PricingEngineService {
  calculate(config: PricingConfig, durationMinutes: number): Money {
    // 1. Restar período de gracia
    const billableMinutes = Math.max(0, durationMinutes - config.gracePeriodMinutes);
    if (billableMinutes === 0) return Money.zero();

    // 2. Calcular según modo
    switch (config.mode) {
      case MINUTE:
        // Cobro por minuto exacto
        amount = billableMinutes × ratePerUnit;
        break;

      case FRACTION:
        // Fracción colombiana: bloques de 15 minutos (redondeo hacia arriba)
        fractions = Math.ceil(billableMinutes / 15);
        amount = fractions × ratePerUnit;
        break;

      case BLOCK:
        // Bloques personalizados (ej: cada 30 min)
        blocks = Math.ceil(billableMinutes / blockSizeMinutes);
        amount = blocks × ratePerUnit;
        break;
    }

    // 3. Aplicar tope diario (dayMaxRate) si existe
    if (config.dayMaxRate && amount > dayMaxRate)
      return dayMaxRate;

    return amount;
  }
}
```

**Configuración por defecto (seed):**

| Tipo vehículo | Tarifa/min | Gracia | Tope diario |
|---------------|-----------|--------|-------------|
| CAR           | $100 COP  | 5 min  | $15,000     |
| MOTORCYCLE    | $50 COP   | 5 min  | $8,000      |
| BICYCLE       | $30 COP   | 10 min | $5,000      |

---

## 4. BLoCs — Estados y Eventos

### 4.1 CheckIn.Bloc

```typescript
// features/check-in/application/CheckIn.Bloc.ts

type CheckInStatus = 'idle' | 'submitting' | 'success' | 'error';

interface CheckInState {
  status: CheckInStatus;
  result: CheckInResult | null;
  //  └─ { ticketId, qrCode, qrImageDataUrl, plate, vehicleType, checkIn }
  error: string | null;
  isShiftOpen: boolean;           // Valida CashCut abierto al entrar
}

// Eventos (métodos públicos)
submitCheckIn(plate, vehicleType)  → submitting → success | error
reset()                            → idle
checkShiftStatus()                 → constructor: valida turno abierto
```

**Flujo:**
```
Component.onSubmit()
  → bloc.submitCheckIn(plate, vehicleType)
    → _state = submitting
    → ticketRepo.checkIn(request)          // POST /api/tickets
      → success: _state = { success, result }   // Muestra QR
      → error:   _state = { error, message }
```

### 4.2 CheckOut.Bloc

```typescript
// features/check-out/application/CheckOut.Bloc.ts

type CheckOutStatus = 'idle' | 'searching' | 'preview' | 'submitting' | 'success' | 'error';

interface CheckOutState {
  status: CheckOutStatus;
  ticket: TicketInfo | null;
  //  └─ { id, plate, vehicleType, status, checkIn, durationMinutes, currentAmountCOP, qrCode }
  error: string | null;
  isShiftOpen: boolean;
}

// Eventos (métodos públicos)
searchTicket(qrCode)               → searching → preview | error
confirmCheckOut(paymentMethod)     → submitting → success | error
reset()                            → idle
```

**Flujo:**
```
1. Operador escanea QR o ingresa placa
   → bloc.searchTicket(qrCode)
     → GET /api/tickets/qr/:qrCode     // Backend calcula tarifa actual
     → preview: muestra placa, tiempo, monto

2. Operador elige método de pago y confirma
   → bloc.confirmCheckOut(paymentMethod)
     → POST /api/tickets/checkout       // Backend cierra ticket
     → success: ticket pagado
```

### 4.3 CashCut.Bloc (Arqueo de Caja)

```typescript
// features/cash-cut/application/CashCut.Bloc.ts

type CashCutStatus = 'loading' | 'idle' | 'no-active' | 'submitting' | 'success' | 'error';

interface CashCutState {
  status: CashCutStatus;
  cashCut: CashCut | null;
  //  └─ { id, status, openedAt, closedAt, totalSalesCOP, reportedCashCOP, discrepancyCOP }
  error: string | null;
}

// Eventos (métodos públicos)
loadCurrent()                      → loading → idle | no-active
openCashCut()                      → submitting → idle (turno abierto)
closeCashCut(reportedCash)         → submitting → success (con discrepancia)
```

---

## 5. Diagrama de flujo de datos (todos los BLoCs)

```
┌─────────────────┐      método()      ┌──────────┐     Observable     ┌──────────────────┐
│   Component     │ ──────────────────► │   BLoC   │ ─────────────────► │ RepositoryPort   │
│  (Presentation) │                     │  Signal  │                    │   (abstract)     │
│                 │ ◄────── state() ─── │  State   │ ◄── HTTP result ── │ HttpRepository   │
└─────────────────┘                     └──────────┘                    └──────────────────┘
                                                                              │
                                                                              ▼
                                                                     Backend REST API
```

**Regla fundamental:** los componentes solo leen signals y despachan eventos. Cero lógica de negocio en la capa de presentación.

---

## 6. API Endpoints (Backend)

| Método | Ruta                        | Auth         | Descripción                          |
|--------|-----------------------------|-------------|--------------------------------------|
| POST   | `/api/auth/login`           | Público     | Login → JWT                          |
| POST   | `/api/tickets`              | Operator+   | Check-in (genera QR)                 |
| GET    | `/api/tickets/qr/:qrCode`  | Operator+   | Consultar ticket + tarifa actual     |
| POST   | `/api/tickets/checkout`     | Operator+   | Check-out (cobrar y cerrar)          |
| POST   | `/api/tickets/:id/cancel`   | Operator+   | Cancelar ticket                      |
| GET    | `/api/cash-cuts/current`    | Operator+   | Turno actual del operador            |
| POST   | `/api/cash-cuts/open`       | Operator+   | Abrir turno                          |
| POST   | `/api/cash-cuts/close`      | Operator+   | Cerrar turno (reportar efectivo)     |
| POST   | `/api/users`                | Admin       | Crear usuario                        |
| POST   | `/api/branches`             | Admin       | Crear sede                           |
| POST   | `/api/pricing-configs`      | Admin       | Crear configuración de tarifas       |

**Seguridad:**
- `tenantId` siempre del JWT (nunca del body)
- `TenantContext` (AsyncLocalStorage) propaga tenant/branch a todas las capas
- RBAC: `SUPER_ADMIN` > `PARKING_ADMIN` > `OPERATOR`
- Toda acción crítica → `AuditLog`

---

## 7. Comandos de desarrollo

```bash
# Backend (desde backend/)
npm run dev          # tsx watch + Node 20
npm run seed         # Crear datos iniciales
npm run seed -- --force  # Recrear datos

# Frontend (desde frontend/)
npm start            # ng serve → http://localhost:4200

# Credenciales seed
# Email: admin@parkinghub.local
# Password: Admin123!
```
