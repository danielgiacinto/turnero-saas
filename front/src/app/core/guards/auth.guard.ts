import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { obtenerDetalleEmailNoVerificado } from '../utils/error-auth.util';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true;
  }

  if (authService.tieneToken()) {
    return authService.restaurarSesion().pipe(
      map(() => true),
      catchError((err) => {
        const detalle = obtenerDetalleEmailNoVerificado(err);
        if (detalle) {
          authService.cerrarSesion();
          return of(
            router.createUrlTree(['/auth/verificar-email'], {
              queryParams: { email: detalle.email },
            }),
          );
        }
        authService.cerrarSesion();
        return of(router.createUrlTree(['/auth/login']));
      }),
    );
  }

  return router.createUrlTree(['/auth/login']);
};
