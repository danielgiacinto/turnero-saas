import { EstadoSuscripcion } from '@prisma/client';
import { ahora } from './fecha.util';

/** Indica si el comercio puede usar el panel (estado + fecha de vencimiento). */
export function comercioTieneAccesoActivo(params: {
  estado_suscripcion: EstadoSuscripcion;
  fecha_vencimiento: Date;
}): boolean {
  if (
    params.estado_suscripcion === EstadoSuscripcion.suspendida ||
    params.estado_suscripcion === EstadoSuscripcion.cancelada
  ) {
    return false;
  }

  return params.fecha_vencimiento.getTime() >= ahora().getTime();
}
