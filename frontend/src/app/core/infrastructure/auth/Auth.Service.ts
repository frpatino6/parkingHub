import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { API_BASE_URL } from '../tokens/api.config';
import {
  setStoredToken, setStoredUser, clearStoredToken,
  getStoredUser, setStoredRefreshToken, getStoredRefreshToken, clearStoredRefreshToken,
} from '../http/AuthInterceptor';
import { ContextService } from '../context/Context.Service';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
  branchIds: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly context = inject(ContextService);

  private readonly _user = signal<User | null>(getStoredUser() as unknown as User);
  readonly user = this._user.asReadonly();

  login(credentials: Record<string, unknown>): Observable<unknown> {
    return this.http.post<{ accessToken: string; refreshToken: string; user: User }>(
      `${this.baseUrl}/auth/login`, credentials,
    ).pipe(
      tap((res) => {
        setStoredToken(res.accessToken);
        setStoredRefreshToken(res.refreshToken);
        setStoredUser(res.user);
        this._user.set(res.user);
        this.context.setActiveBranch(null);
      }),
    );
  }

  refreshAccessToken(): Observable<void> {
    const refreshToken = getStoredRefreshToken();
    return from(
      fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('Refresh failed');
          const data = await res.json() as { accessToken: string; refreshToken: string };
          setStoredToken(data.accessToken);
          setStoredRefreshToken(data.refreshToken);
        })
        .catch(() => {
          this.logout();
        }),
    ) as Observable<void>;
  }

  logout(): void {
    clearStoredToken();
    clearStoredRefreshToken();
    this.context.setActiveBranch(null);
    this._user.set(null);
  }

  hasRole(role: string): boolean {
    return this._user()?.role === role;
  }
}
