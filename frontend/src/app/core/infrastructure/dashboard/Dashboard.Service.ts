import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens/api.config';

export interface HourlyBucket {
  hour: number;
  count: number;
  revenueCOP: number;
}

export interface DashboardStats {
  ticketsToday: number;
  revenueToday: number;
  activeTickets: number;
  avgDurationMinutes: number;
  revenueByCash: number;
  revenueByElectronic: number;
  hourlyDistribution: HourlyBucket[];
  totalSpots?: number;
  occupancyPercentage?: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getStats(branchId: string): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard/stats?branchId=${branchId}`);
  }
}
