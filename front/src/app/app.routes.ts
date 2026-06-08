import { Routes } from '@angular/router';

export const routes: Routes = [
  // Lazy loading — descomentar al crear cada feature:
  // {
  //   path: 'auth',
  //   loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  // },
  // {
  //   path: 'reserva',
  //   loadChildren: () =>
  //     import('./features/public-booking/public-booking.routes').then((m) => m.PUBLIC_BOOKING_ROUTES),
  // },
  // {
  //   path: 'panel',
  //   loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  // },
];
