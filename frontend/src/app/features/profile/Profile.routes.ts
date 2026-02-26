import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/Profile.Page.Component').then((m) => m.ProfilePageComponent),
  },
];
