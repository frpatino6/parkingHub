# MongoDB Optimization — Reference Manual

> **Scope**: This manual is the Single Source of Truth for all database design, queries, and Mongoose configuration.
> **MongoDB**: 7+ | **Driver**: Mongoose 8+

---

## 1. Schema Design Principles

### Embedding vs Referencing

| Strategy      | When To Use                                                  |
|---------------|--------------------------------------------------------------|
| **Embed**     | 1:1 or 1:few relations, data read together, rarely changes   |
| **Reference** | 1:many or many:many, large or unbounded arrays, independent access |

```typescript
// ✅ Embed — address belongs to parking lot, always read together
const ParkingLotSchema = new Schema({
  name: String,
  address: {
    street: String,
    city: String,
    zipCode: String,
    coordinates: { type: [Number], index: '2dsphere' },
  },
  totalSpots: Number,
});

// ✅ Reference — reservations are many, accessed independently
const ReservationSchema = new Schema({
  spotId: { type: Schema.Types.ObjectId, ref: 'ParkingSpot', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
});
```

### Anti-Patterns
- ❌ **Unbounded arrays**: never push into arrays that can grow indefinitely
- ❌ **Deep nesting**: max 2 levels of nesting
- ❌ **Over-normalization**: don't reference when embedding is simpler
- ❌ **Schemas without validation**: always define `required`, `enum`, `min`, `max`

## 2. Indexing Strategies

### Index Types

| Type         | Use Case                                      | Example                                    |
|--------------|-----------------------------------------------|-------------------------------------------|
| Single field | Exact match / sort on one field               | `{ status: 1 }`                           |
| Compound     | Queries filtering on multiple fields          | `{ lotId: 1, status: 1, startTime: -1 }`  |
| Partial      | Index a subset of documents                   | `{ partialFilterExpression: { status: 'active' } }` |
| TTL          | Auto-expire documents                         | `{ expireAfterSeconds: 86400 }`            |
| Text         | Full-text search                              | `{ name: 'text', description: 'text' }`   |
| 2dsphere     | Geospatial queries                            | `{ 'address.coordinates': '2dsphere' }`    |
| Unique       | Enforce uniqueness                            | `{ email: 1 }, { unique: true }`           |

### Compound Index Rules (ESR Rule)
1. **E**quality fields first (`{ status: 'active' }`)
2. **S**ort fields second (`{ createdAt: -1 }`)
3. **R**ange fields last (`{ price: { $gte: 10, $lte: 50 } }`)

```typescript
// ✅ Follows ESR rule
ReservationSchema.index(
  { status: 1, startTime: -1, spotId: 1 },
  { name: 'idx_status_time_spot' }
);
```

### Index Rules
- **Measure before indexing**: use `.explain('executionStats')` to verify
- **Limit to 5-7 indexes** per collection (write overhead)
- **Name all indexes** explicitly
- **Cover queries** when possible (include projected fields in index)

## 3. Aggregation Pipeline Best Practices

```typescript
// ✅ Efficient pipeline — filter early, limit stages
const revenue = await Reservation.aggregate([
  // Stage 1: Match early to reduce documents
  { $match: { status: 'completed', endTime: { $gte: startOfMonth, $lt: endOfMonth } } },
  // Stage 2: Lookup only when needed
  { $lookup: { from: 'parkingspots', localField: 'spotId', foreignField: '_id', as: 'spot' } },
  { $unwind: '$spot' },
  // Stage 3: Group and compute
  { $group: { _id: '$spot.lotId', totalRevenue: { $sum: '$amount' }, count: { $sum: 1 } } },
  // Stage 4: Sort results
  { $sort: { totalRevenue: -1 } },
]);
```

### Rules
- **`$match` first** to reduce the working set (leverages indexes)
- **`$project` early** to drop unneeded fields
- **Avoid `$lookup`** on large collections without filtering first
- **Use `$facet`** for multiple aggregations in a single query
- **Set `allowDiskUse: true`** for memory-intensive pipelines (>100MB)

## 4. Connection Configuration

```typescript
// infrastructure/database/connection.ts
import mongoose from 'mongoose';
import { config } from '../config/env';
import { logger } from '../config/logger';

const MONGODB_OPTIONS: mongoose.ConnectOptions = {
  maxPoolSize: 10,           // Max connections in pool
  minPoolSize: 2,            // Keep minimum connections alive
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  w: 'majority',
};

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.MONGODB_URI, MONGODB_OPTIONS);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.fatal('MongoDB connection failed', { error });
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
mongoose.connection.on('error', (err) => logger.error('MongoDB error', { error: err }));
```

### Connection Rules
- **Pool size**: 10 connections default, scale with load
- **Retry writes**: always enabled for replica sets
- **Write concern**: `majority` for durability
- **Fail fast on startup**: exit if initial connection fails
- **Graceful shutdown**: close connection on `SIGTERM`/`SIGINT`

## 5. Mongoose Model Patterns

```typescript
// infrastructure/database/models/parking-spot.model.ts
import { Schema, model, Document } from 'mongoose';
import { ParkingSpot as ParkingSpotEntity } from '../../../domain/entities/parking-spot';

export interface ParkingSpotDocument extends Document, Omit<ParkingSpotEntity, 'id'> {}

const ParkingSpotSchema = new Schema<ParkingSpotDocument>(
  {
    number: { type: String, required: true, unique: true, trim: true },
    level: { type: Number, required: true, min: -5, max: 20 },
    type: { type: String, required: true, enum: ['standard', 'handicapped', 'electric', 'vip'] },
    status: { type: String, required: true, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
    pricePerHour: { type: Number, required: true, min: 0 },
    lotId: { type: Schema.Types.ObjectId, ref: 'ParkingLot', required: true, index: true },
  },
  {
    timestamps: true,           // createdAt, updatedAt
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
ParkingSpotSchema.index({ lotId: 1, status: 1 }, { name: 'idx_lot_status' });
ParkingSpotSchema.index({ number: 1 }, { unique: true, name: 'idx_number_unique' });

export const ParkingSpotModel = model<ParkingSpotDocument>('ParkingSpot', ParkingSpotSchema);
```

## 7. Multi-Tenant Isolation (Shared Database)

### Tenant Discriminator Pattern
For ParkingHub, we use a shared database where every document is isolated by a `tenantId`.

```typescript
// infrastructure/database/models/base.schema.ts
export const TenantSchemaFields = {
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true }, // Sede
};
```

### Mandatory Query Filters
Every query **MUST** include the `tenantId` and `branchId`.

```typescript
// ✅ Good: isolated query
const spots = await ParkingSpotModel.find({ 
  tenantId: context.tenantId, 
  branchId: context.branchId,
  status: 'available' 
});

// ❌ Bad: cross-tenant risk
const spots = await ParkingSpotModel.find({ status: 'available' });
```

### Global Query Middlewares
Use Mongoose middleware to prevent accidental cross-tenant leaks.

```typescript
ParkingSpotSchema.pre(/^find/, function(next) {
  const tenantId = TenantContext.getTenantId();
  if (tenantId) {
    this.where({ tenantId });
  }
  next();
});
```

## 8. Multi-Tenant Isolation (Shared Database)

... (same) ...

## 9. Audit Logs (Compliance)

Critical actions must be logged for financial audit.

```typescript
// domain/entities/AuditLog.ts
export class AuditLog {
  constructor(
    public readonly action: string,      // 'MANUAL_OPEN', 'TICKET_CANCEL'
    public readonly operatorId: string,
    public readonly branchId: string,
    public readonly tenantId: string,
    public readonly payload: any,        // Contextual data
    public readonly timestamp: Date = new Date()
  ) {}
}
```

### Audit Rules
- **Never** allow price overrides without an AuditLog.
- **Immutability**: Audit logs should be write-only (no updates or deletes allowed).
- **TTL**: Consider a TTL of 1-3 years depending on local regulations.

```javascript
// Enable profiling in development
db.setProfilingLevel(2, { slowms: 50 });

// Check slow queries
db.system.profile.find({ millis: { $gt: 100 } }).sort({ ts: -1 }).limit(10);
```

### Profiling Rules
- **Always** use `.explain('executionStats')` before deploying new queries
- **Target**: `totalDocsExamined` ≈ `nReturned` (efficient index usage)
- **Watch for**: `COLLSCAN` (full collection scan) — add index
- **Monitor** `executionTimeMillis` — keep under 100ms for user-facing queries
- **Use MongoDB Compass** or Atlas Performance Advisor for visual profiling
