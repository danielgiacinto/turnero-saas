import { TipoRubro } from '../models/comercio.model';

/**
 * Icono (Bootstrap Icons) más adecuado para representar los servicios/turnos
 * según el rubro del comercio. Se usa en la navegación y en la vista de servicios
 * para que el panel se sienta propio de cada tipo de negocio.
 */
export function iconoServicioPorRubro(rubro: TipoRubro | null | undefined): string {
  switch (rubro) {
    case 'barberia':
      return 'bi-scissors';
    case 'estetica':
      return 'bi-flower1';
    case 'psicologia':
      return 'bi-chat-heart';
    case 'nutricion':
      return 'bi-egg-fried';
    case 'salud_medicina':
    case 'medicina':
      return 'bi-heart-pulse';
    default:
      return 'bi-tag';
  }
}
