import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { signal } from '@angular/core';
import { API_BASE_URL } from '../tokens/api.config';
import { setStoredToken, setStoredUser, getStoredToken, getStoredUser, clearStoredToken } from '../http/AuthInterceptor';

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

  private readonly _user = signal<LoginResult['user'] | null>(this.restoreUser());
  readonly user = this._user.asReadonly();

  private restoreUser(): LoginResult['user'] | null {
    const token = getStoredToken();
    const stored = getStoredUser();
    return token && stored ? stored : null;
  }

  login(request: LoginRequest): Observable<LoginResult> {
    return this.http
      .post<LoginResult>(`${this.baseUrl}/auth/login`, request)
      .pipe(
        tap((res) => {
          setStoredToken(res.accessToken);
          setStoredUser(res.user);
          this._user.set(res.user);
        }),
      );
  }

  logout(): void {
    clearStoredToken();
    this._user.set(null);
  }

  hasRole(allowedRoles: string[]): boolean {
    const user = this.user();
    return user ? allowedRoles.includes(user.role) : false;
  }
}
