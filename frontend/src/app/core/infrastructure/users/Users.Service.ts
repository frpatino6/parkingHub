import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens/api.config';

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  branchIds: string[];
  active: boolean;
}

export interface PaginatedUsers {
  items: UserResponse[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly apiUrl = `${this.baseUrl}/users`;

  getAll(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.apiUrl);
  }

  getPaginated(page: number, limit: number): Observable<PaginatedUsers> {
    return this.http.get<PaginatedUsers>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  create(user: Record<string, unknown>): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.apiUrl, user);
  }

  update(id: string, user: Record<string, unknown>): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, user);
  }

  resetPassword(id: string, password: string): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/${id}/password`, { password });
  }

  changeOwnPassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/me/password`, { currentPassword, newPassword });
  }
}
