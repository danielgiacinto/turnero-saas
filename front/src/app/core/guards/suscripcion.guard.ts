import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { comercioTieneAccesoActivo } from '../utils/suscripcion.util';

/**
 * Si la suscripción no está vigente, deja entrar al panel pero redirige
 * a la pantalla de aviso (el login ya fue permitido).
 */
export const suscripcionGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const comercio = auth.comercio();

  if (comercioTieneAccesoActivo(comercio)) {
    return true;
  }

  return router.createUrlTree(['/panel/suscripcion']);
};
