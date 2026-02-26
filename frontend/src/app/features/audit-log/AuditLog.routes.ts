import { Routes } from '@angular/router';

export const AUDIT_LOG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/AuditLog.Page.Component').then((m) => m.AuditLogPageComponent),
  },
];
