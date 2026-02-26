import { Routes } from '@angular/router';
import { authGuard } from './core/infrastructure/auth/auth.guard';
import { roleBasedRedirectGuard } from './core/infrastructure/auth/RoleBasedRedirect.Guard';
import { MainLayoutComponent } from './shared/layouts/MainLayout.Component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/presentation/Login.Page.Component').then((m) => m.LoginPageComponent),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', canActivate: [roleBasedRedirectGuard], children: [] },
      {
        path: 'check-in',
        loadChildren: () =>
          import('./features/check-in/CheckIn.routes').then((m) => m.CHECK_IN_ROUTES),
      },
      {
        path: 'check-out',
        loadChildren: () =>
          import('./features/check-out/CheckOut.routes').then((m) => m.CHECK_OUT_ROUTES),
      },
      {
        path: 'cash-cut',
        loadChildren: () =>
          import('./features/cash-cut/CashCut.routes').then((m) => m.CASH_CUT_ROUTES),
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./features/inventory/presentation/Inventory.Page.Component').then((m) => m.InventoryPageComponent),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./features/history/presentation/History.Page.Component').then((m) => m.HistoryPageComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/presentation/Users.Page.Component').then((m) => m.UsersPageComponent),
      },
      {
        path: 'pricing',
        loadChildren: () =>
          import('./features/pricing/Pricing.routes').then((m) => m.PRICING_ROUTES),
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/Dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'branches',
        loadChildren: () =>
          import('./features/branches/Branches.routes').then((m) => m.BRANCHES_ROUTES),
      },
      {
        path: 'audit-log',
        loadChildren: () =>
          import('./features/audit-log/AuditLog.routes').then((m) => m.AUDIT_LOG_ROUTES),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/profile/Profile.routes').then((m) => m.PROFILE_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
