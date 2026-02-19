import { AuditLogRepository } from '../../../domain/ports/audit-log.repository.port.js';
import { AuditLog } from '../../../domain/entities/audit-log.entity.js';
import { AuditLogModel, AuditLogDoc } from '../models/audit-log.model.js';

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
    const docs = await AuditLogModel.find({ entityType, entityId }).sort({ createdAt: -1 });
    return docs.map((d) => this.toDomain(d));
  }

  async findByTenantId(tenantId: string, limit = 100): Promise<AuditLog[]> {
    const docs = await AuditLogModel.find({ tenantId }).sort({ createdAt: -1 }).limit(limit);
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
