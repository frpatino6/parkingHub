import { AuditLogRepository, AuditLogFilter } from '../../../domain/ports/AuditLogRepository.Port.js';
import { PaginatedResult } from '../../../domain/ports/TicketRepository.Port.js';
import { AuditLog } from '../../../domain/entities/AuditLog.Entity.js';
import { AuditLogModel, AuditLogDoc } from '../models/audit-log.model.js';
import { TenantContext } from '../../config/TenantContext.js';

export class MongoAuditLogRepository implements AuditLogRepository {
  async create(log: AuditLog): Promise<AuditLog> {
    const doc = await AuditLogModel.create({
      tenantId: log.tenantId,
      branchId: log.branchId,
      branchIds: log.branchIds,
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

  async findPaginated(
    tenantId: string,
    page: number,
    limit: number,
    filter?: AuditLogFilter,
  ): Promise<PaginatedResult<AuditLog>> {
    const query: Record<string, unknown> = { tenantId };
    if (filter?.actions?.length) query['action'] = { $in: filter.actions };
    if (filter?.entityType) query['entityType'] = filter.entityType;
    if (filter?.userId) query['userId'] = filter.userId;
    if (filter?.startDate || filter?.endDate) {
      const createdAtQuery: Record<string, Date> = {};
      if (filter.startDate) createdAtQuery['$gte'] = filter.startDate;
      if (filter.endDate) createdAtQuery['$lte'] = filter.endDate;
      query['createdAt'] = createdAtQuery;
    }

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      AuditLogModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLogModel.countDocuments(query),
    ]);

    return { items: docs.map((d) => this.toDomain(d)), total };
  }

  private toDomain(doc: AuditLogDoc): AuditLog {
    return new AuditLog({
      id: doc.id as string,
      tenantId: doc.tenantId,
      branchId: doc.branchId,
      branchIds: doc.branchIds,
      userId: doc.userId,
      action: doc.action,
      entityType: doc.entityType,
      entityId: doc.entityId,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
    });
  }
}
