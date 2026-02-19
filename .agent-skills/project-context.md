# Project Context: ParkingHub

> **Vision**: SaaS multitenant system for parking management in Colombia.
> **Key Focus**: Flow control, complex pricing, and financial audit.

---

## 1. Business Vision
- **Multitenancy**: Multiple organizations (Tenants) each with multiple physical locations (Branches).
- **Region**: Colombia (Currency: COP, specific tax/receipt conventions potentially).
- **Core Goal**: Secure, auditable, and efficient vehicle check-in/out.

## 2. Technical Scope (Fase 1: MVP)

### A. Check-in (Ingreso)
- **Inputs**: Plate (Placa), Vehicle Type (Carro, Moto, Bici).
- **Output**: Ticket entity + unique QR code + checkIn ISO Date.
- **Rules**: Instant generation upon entry.

### B. Pricing Engine (Motor de Tarifas)
- **Location**: **BACKEND ONLY**. Never calculate totals on the frontend.
- **Modes**: Minute-based, Fraction-based, or Block-based.
- **GracePeriod**: Initial time where no fee is charged.
- **DayMaxRate**: Maximum daily cap (Hora Plena).

### C. Check-out (Salida)
- **Flow**: Scan QR → Calculate Time/Amount → Register Payment (Efectivo/Datáfono) → Mark Ticket as `PAID`.

### D. Cash Cut (Arqueo de Caja)
- **Entity**: `CashCut`.
- **Scope**: Per Operator, Per Branch.
- **Logic**: Base Amount + Sales vs. Reported Cash. Calculate discrepancies.

## 3. Mandatory Constraints
- **State Management**: **BLoC** (Business Logic Component) on the frontend.
- **Tenancy**: `tenantId` is **ALWAYS** extracted from JWT. Never trust `tenantId` in request bodies.
- **Security**: RBAC with levels: `SUPER_ADMIN`, `PARKING_ADMIN`, `OPERATOR`.
- **Audit**: Every critical action (manual opening, cancellation, price override) must be logged in `AuditLogs`.
- **Decoupling**: Use Case must have ZERO knowledge of MongoDB or Express.

## 4. Entity Blueprint (MVP)
- `Tenant`: Organizational owner.
- `Branch`: Physical parking location.
- `User`: RBAC-enabled accounts.
- `Ticket`: Core transaction entity.
- `CashCut`: Financial audit entity.
- `AuditLog`: Critical action log.
- `PricingConfig`: Rules for the Pricing Engine.
