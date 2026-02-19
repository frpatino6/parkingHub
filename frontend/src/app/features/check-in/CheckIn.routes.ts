import { Routes } from '@angular/router';
import { authGuard } from '../../core/infrastructure/auth/auth.guard';

export const CHECK_IN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/CheckIn.Page.Component').then((m) => m.CheckInPageComponent),
    canActivate: [authGuard],
  },
];
