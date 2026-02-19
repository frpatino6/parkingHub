import { Routes } from '@angular/router';
import { authGuard } from './core/infrastructure/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/presentation/Login.Page.Component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'check-in',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/check-in/CheckIn.routes').then((m) => m.CHECK_IN_ROUTES),
  },
  { path: '**', redirectTo: 'login' },
];
