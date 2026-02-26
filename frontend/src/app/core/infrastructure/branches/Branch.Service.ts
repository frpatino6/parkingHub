import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens/api.config';

export interface BranchResponse {
  id: string;
  name: string;
  address: string;
  active: boolean;
  totalSpots?: number;
}

export interface CreateBranchRequest {
  name: string;
  address: string;
  totalSpots?: number;
}

export interface UpdateBranchRequest {
  name?: string;
  address?: string;
  active?: boolean;
  totalSpots?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly apiUrl = `${this.baseUrl}/branches`;

  list(): Observable<BranchResponse[]> {
    return this.http.get<BranchResponse[]>(this.apiUrl);
  }

  create(dto: CreateBranchRequest): Observable<BranchResponse> {
    return this.http.post<BranchResponse>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateBranchRequest): Observable<BranchResponse> {
    return this.http.patch<BranchResponse>(`${this.apiUrl}/${id}`, dto);
  }
}
