import { Routes } from '@angular/router';
import { authGuard } from './core/infrastructure/auth/auth.guard';
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
      { path: '', redirectTo: 'check-in', pathMatch: 'full' },
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
    ],
  },
  { path: '**', redirectTo: 'login' },
];
