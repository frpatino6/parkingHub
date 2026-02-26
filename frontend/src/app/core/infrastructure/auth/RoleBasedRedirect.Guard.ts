import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './Auth.Service';

export const roleBasedRedirectGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const user = auth.user();

  if (!user) {
    // This guard should only be used after authGuard, 
    // but just in case we let it fall back to login.
    return true;
  }

  // Define landing pages based on role
  if (user.role === 'OPERATOR') {
    router.navigate(['/check-in']);
  } else if (user.role === 'PARKING_ADMIN' || user.role === 'SUPER_ADMIN') {
    router.navigate(['/dashboard']);
  } else {
    router.navigate(['/login']);
  }

  return false;
};
