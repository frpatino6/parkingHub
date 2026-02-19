import { AuditLog } from '../entities/audit-log.entity.js';

export interface AuditLogRepository {
  create(log: AuditLog): Promise<AuditLog>;
  findByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;
  findByTenantId(tenantId: string, limit?: number): Promise<AuditLog[]>;
}
