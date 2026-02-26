export interface GetAuditLogsDto {
  tenantId: string;
  page: number;
  limit: number;
  actions?: string[];
  entityType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogResult {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName?: string;
  branchId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

export interface PaginatedAuditLogs {
  items: AuditLogResult[];
  total: number;
  page: number;
  limit: number;
}
