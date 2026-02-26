import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ContextService } from '../context/Context.Service';

const TOKEN_KEY = 'parkinghub_token';
const REFRESH_TOKEN_KEY = 'parkinghub_refresh_token';
const USER_KEY = 'parkinghub_user';

let isRefreshing = false;

function buildHeaders(req: HttpRequest<unknown>): HttpRequest<unknown> {
  const token = localStorage.getItem(TOKEN_KEY);
  const context = inject(ContextService);
  const activeBranchId = context.activeBranchId();

  let headers = req.headers;
  if (token) headers = headers.set('Authorization', `Bearer ${token}`);
  if (activeBranchId) headers = headers.set('x-branch-id', activeBranchId);
  return req.clone({ headers });
}

function doRefresh(apiBase: string): Promise<{ accessToken: string; refreshToken: string }> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  return fetch(`${apiBase}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  }).then(async (res) => {
    if (!res.ok) throw new Error('Refresh failed');
    return res.json() as Promise<{ accessToken: string; refreshToken: string }>;
  });
}

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const cloned = buildHeaders(req);
  return next(cloned).pipe(
    catchError((err: unknown) => {
      const isAuthUrl = req.url.includes('/auth/');
      const is401 = err instanceof HttpErrorResponse && err.status === 401;

      if (!is401 || isAuthUrl || isRefreshing) {
        return throwError(() => err);
      }

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        clearStoredToken();
        clearStoredRefreshToken();
        window.location.href = '/login';
        return throwError(() => err);
      }

      isRefreshing = true;
      const apiBase = req.url.replace(/\/api\/.*$/, '/api');

      return from(doRefresh(apiBase)).pipe(
        switchMap((tokens) => {
          isRefreshing = false;
          setStoredToken(tokens.accessToken);
          setStoredRefreshToken(tokens.refreshToken);
          return next(buildHeaders(req));
        }),
        catchError((refreshErr: unknown) => {
          isRefreshing = false;
          clearStoredToken();
          clearStoredRefreshToken();
          window.location.href = '/login';
          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function clearStoredRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
  branchIds: string[];
}

export function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
