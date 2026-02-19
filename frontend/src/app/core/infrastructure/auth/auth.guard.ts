import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { getStoredToken } from '../http/AuthInterceptor';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = getStoredToken();
  if (token) return true;
  router.navigate(['/login']);
  return false;
};
