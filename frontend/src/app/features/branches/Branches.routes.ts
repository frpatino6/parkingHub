import { Routes } from '@angular/router';

export const BRANCHES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/Branches.Page.Component').then((m) => m.BranchesPageComponent),
  },
];
