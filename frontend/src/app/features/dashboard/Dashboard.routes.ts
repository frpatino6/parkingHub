import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/Dashboard.Page.Component').then((m) => m.DashboardPageComponent),
  },
];
