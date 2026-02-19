import { HttpInterceptorFn } from '@angular/common/http';

const TOKEN_KEY = 'parkinghub_token';
const USER_KEY = 'parkinghub_user';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(cloned);
  }
  return next(req);
};

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): { id: string; name: string; email: string; role: string; tenantId: string; branchId?: string } | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { id: string; name: string; email: string; role: string; tenantId: string; branchId?: string };
  } catch {
    return null;
  }
}

export function setStoredUser(user: { id: string; name: string; email: string; role: string; tenantId: string; branchId?: string }): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
