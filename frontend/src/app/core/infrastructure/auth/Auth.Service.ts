import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../tokens/api.config';
import { setStoredToken, clearStoredToken } from '../http/AuthInterceptor';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    tenantId: string;
    branchId?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  login(request: LoginRequest): Observable<LoginResult> {
    return this.http
      .post<LoginResult>(`${this.baseUrl}/auth/login`, request)
      .pipe(tap((res) => setStoredToken(res.accessToken)));
  }

  logout(): void {
    clearStoredToken();
  }
}
