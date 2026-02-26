import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens/api.config';

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName?: string;
  branchId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface PaginatedAuditLogs {
  items: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(
    page: number,
    limit: number,
    filters: { actions?: string[]; entityType?: string; startDate?: string; endDate?: string } = {},
  ): Observable<PaginatedAuditLogs> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    filters.actions?.forEach((a) => params.append('action', a));
    if (filters.entityType) params.set('entityType', filters.entityType);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    return this.http.get<PaginatedAuditLogs>(`${this.baseUrl}/audit-logs?${params}`);
  }
}
