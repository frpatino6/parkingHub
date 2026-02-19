import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'check-in', pathMatch: 'full' },
  {
    path: 'check-in',
    loadChildren: () =>
      import('./features/check-in/CheckIn.routes').then((m) => m.CHECK_IN_ROUTES),
  },
  { path: 'login', loadComponent: () => import('./features/auth/presentation/Login.Page.Component').then((m) => m.LoginPageComponent) },
  { path: '**', redirectTo: 'check-in' },
];
