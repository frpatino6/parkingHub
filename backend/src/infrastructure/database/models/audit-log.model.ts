import { Schema, model, HydratedDocument } from 'mongoose';
import { AuditAction } from '../../../domain/enums/audit-action.enum.js';

interface IAuditLogDoc {
  tenantId: string;
  branchId?: string;
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLogDoc>(
  {
    tenantId: { type: String, required: true },
    branchId: { type: String },
    userId: { type: String, required: true },
    action: { type: String, enum: Object.values(AuditAction), required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

auditLogSchema.index({ tenantId: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });

export type AuditLogDoc = HydratedDocument<IAuditLogDoc>;
export const AuditLogModel = model<IAuditLogDoc>('AuditLog', auditLogSchema);
