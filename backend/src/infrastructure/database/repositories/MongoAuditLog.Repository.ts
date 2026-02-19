import { AuditLogRepository } from '../../../domain/ports/AuditLogRepository.Port.js';
import { AuditLog } from '../../../domain/entities/AuditLog.Entity.js';
import { AuditLogModel, AuditLogDoc } from '../models/audit-log.model.js';
import { TenantContext } from '../../config/TenantContext.js';

export class MongoAuditLogRepository implements AuditLogRepository {
  async create(log: AuditLog): Promise<AuditLog> {
    const doc = await AuditLogModel.create({
      tenantId: log.tenantId,
      branchId: log.branchId,
      userId: log.userId,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      metadata: log.metadata,
    });
    return this.toDomain(doc);
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    const docs = await AuditLogModel.find({
      entityType,
      entityId,
      tenantId: TenantContext.tenantId,
    }).sort({ createdAt: -1 });
    return docs.map((d) => this.toDomain(d));
  }

  async findByTenantId(tenantId?: string, limit = 100): Promise<AuditLog[]> {
    const finalTenantId = tenantId ?? TenantContext.tenantId;
    const docs = await AuditLogModel.find({ tenantId: finalTenantId }).sort({ createdAt: -1 }).limit(limit);
    return docs.map((d) => this.toDomain(d));
  }

  private toDomain(doc: AuditLogDoc): AuditLog {
    return new AuditLog({
      id: doc.id as string,
      tenantId: doc.tenantId,
      branchId: doc.branchId,
      userId: doc.userId,
      action: doc.action,
      entityType: doc.entityType,
      entityId: doc.entityId,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
    });
  }
}
