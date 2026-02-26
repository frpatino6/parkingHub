import { AuditLog } from '../entities/AuditLog.Entity.js';
import { PaginatedResult } from './TicketRepository.Port.js';

export interface AuditLogFilter {
  actions?: string[];
  entityType?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface AuditLogRepository {
  create(log: AuditLog): Promise<AuditLog>;
  findByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;
  findByTenantId(tenantId?: string, limit?: number): Promise<AuditLog[]>;
  findPaginated(tenantId: string, page: number, limit: number, filter?: AuditLogFilter): Promise<PaginatedResult<AuditLog>>;
}
