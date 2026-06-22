import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'panel',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./views/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'panel',
    canActivate: [authGuard],
    loadChildren: () => import('./views/panel/panel.routes').then((m) => m.PANEL_ROUTES),
  },
];
