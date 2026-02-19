import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens/api.config';

export interface MovementResponse {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: 'SUPPLIES' | 'SERVICES' | 'FUEL' | 'EXTRA_INCOME' | 'OTHER';
  description: string;
  amountCOP: number;
  createdAt: string;
}

export interface CreateMovementRequest {
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
  amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class MovementsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly apiUrl = `${this.baseUrl}/cash-cuts`;

  registerMovement(request: CreateMovementRequest): Observable<MovementResponse> {
    return this.http.post<MovementResponse>(`${this.apiUrl}/movements`, request);
  }

  getMovements(cashCutId: string): Observable<MovementResponse[]> {
    return this.http.get<MovementResponse[]>(`${this.apiUrl}/${cashCutId}/movements`);
  }

  getReport(startDate: string, endDate: string): Observable<MovementResponse[]> {
    return this.http.get<MovementResponse[]>(`${this.apiUrl}/movements/report`, {
      params: { startDate, endDate }
    });
  }
}
