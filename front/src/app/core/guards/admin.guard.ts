import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/** Solo permite acceso a rutas reservadas al dueño (rol admin). */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.usuario()?.rol === 'admin') {
    return true;
  }

  return router.createUrlTree(['/panel']);
};
