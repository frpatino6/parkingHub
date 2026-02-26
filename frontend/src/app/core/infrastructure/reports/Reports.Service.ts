import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens/api.config';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly apiUrl = `${this.baseUrl}/reports`;

  exportTickets(branchId?: string, from?: string, to?: string): Observable<Blob> {
    const params = new URLSearchParams();
    if (branchId) params.set('branchId', branchId);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString() ? `?${params}` : '';
    return this.http.get(`${this.apiUrl}/tickets${query}`, { responseType: 'blob' });
  }

  exportCashCuts(branchId?: string, from?: string, to?: string): Observable<Blob> {
    const params = new URLSearchParams();
    if (branchId) params.set('branchId', branchId);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString() ? `?${params}` : '';
    return this.http.get(`${this.apiUrl}/cash-cuts${query}`, { responseType: 'blob' });
  }
}
