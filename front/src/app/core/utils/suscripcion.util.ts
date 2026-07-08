import { ComercioSesion } from '../models/usuario.model';

/** Indica si el comercio puede usar el panel (estado + fecha de vencimiento). */
export function comercioTieneAccesoActivo(comercio: ComercioSesion | null | undefined): boolean {
  if (!comercio) {
    return true;
  }

  if (
    comercio.estado_suscripcion === 'suspendida' ||
    comercio.estado_suscripcion === 'cancelada'
  ) {
    return false;
  }

  return new Date(comercio.fecha_vencimiento).getTime() >= Date.now();
}

export function etiquetaEstadoSuscripcion(
  estado: ComercioSesion['estado_suscripcion'] | string | null | undefined,
): string {
  switch (estado) {
    case 'activa':
      return 'Activa';
    case 'pendiente':
      return 'Pendiente';
    case 'suspendida':
      return 'Suspendida';
    case 'cancelada':
      return 'Cancelada';
    default:
      return estado ?? '—';
  }
}

export function claseBadgeSuscripcion(
  estado: ComercioSesion['estado_suscripcion'] | string | null | undefined,
): string {
  switch (estado) {
    case 'activa':
      return 'badge-estado badge-estado--confirmado';
    case 'pendiente':
      return 'badge-estado badge-estado--pendiente';
    case 'suspendida':
    case 'cancelada':
      return 'badge-estado badge-estado--cancelado';
    default:
      return 'badge-estado badge-estado--pendiente';
  }
}

export function mensajeSuscripcionBloqueada(comercio: ComercioSesion): string {
  if (comercio.estado_suscripcion === 'suspendida') {
    return 'La suscripción de tu comercio está suspendida. Regularizá el pago para seguir usando SaTu.';
  }
  if (comercio.estado_suscripcion === 'cancelada') {
    return 'La suscripción de tu comercio está cancelada. Reactivala para volver a usar el panel.';
  }
  return 'La suscripción de tu comercio venció. Renová el plan para seguir usando el panel.';
}
