import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens/api.config';

export interface PricingConfigResponse {
  id: string;
  vehicleType: 'CAR' | 'MOTORCYCLE' | 'BICYCLE' | 'OTHER';
  mode: 'MINUTE' | 'FRACTION' | 'BLOCK';
  ratePerUnit: number;
  gracePeriodMinutes: number;
  dayMaxRate?: number;
  blockSizeMinutes?: number;
  active: boolean;
}

export interface SimulatePriceRequest {
  branchId: string;
  vehicleType: string;
  durationMinutes: number;
}

export interface SimulatePriceResult {
  amountCOP: number;
  billableMinutes: number;
  mode: string;
  vehicleType: string;
  gracePeriodMinutes: number;
  ratePerUnit: number;
  dayMaxRate?: number;
  blockSizeMinutes?: number;
}

export interface UpdatePricingConfigRequest {
  mode?: 'MINUTE' | 'FRACTION' | 'BLOCK';
  ratePerUnit?: number;
  gracePeriodMinutes?: number;
  dayMaxRate?: number;
  blockSizeMinutes?: number;
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PricingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly apiUrl = `${this.baseUrl}/pricing-configs`;

  getByBranch(branchId: string): Observable<PricingConfigResponse[]> {
    return this.http.get<PricingConfigResponse[]>(this.apiUrl, {
      params: { branchId }
    });
  }

  update(id: string, request: UpdatePricingConfigRequest): Observable<PricingConfigResponse> {
    return this.http.patch<PricingConfigResponse>(`${this.apiUrl}/${id}`, request);
  }

  simulate(request: SimulatePriceRequest): Observable<SimulatePriceResult> {
    return this.http.post<SimulatePriceResult>(`${this.apiUrl}/simulate`, request);
  }
}
