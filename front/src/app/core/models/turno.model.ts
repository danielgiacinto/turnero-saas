import type { ClienteResumen } from './cliente.model';
import { RolUsuario } from './usuario.model';

export type EstadoTurno =
  | 'pendiente_verificacion'
  | 'pendiente'
  | 'completo'
  | 'cancelado'
  | 'inasistencia';

export type OrigenReserva = 'portal_publico' | 'panel_staff';

export type { ClienteResumen } from './cliente.model';

export interface Turno {
  id: string;
  comercio_id: string;
  cliente_id: string;
  profesional_id: string;
  servicio_id: string;
  link_reunion: string | null;
  estado: EstadoTurno;
  fecha_hora: string;
}

export interface TurnoListado {
  id: string;
  fecha_hora: string;
  estado: EstadoTurno;
  origen_reserva: OrigenReserva;
  duracion_minutos: number;
  servicio: { id: string; nombre: string };
  profesional: { id: string; nombre: string };
  cliente: ClienteResumen;
}

export interface StaffAtencion {
  id: string;
  nombre: string;
  rol: RolUsuario;
}

export interface SlotDisponible {
  hora: string;
}

export interface DatosClienteTurno {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
}

export interface CrearTurno {
  profesional_id?: string;
  servicio_id: string;
  fecha: string;
  hora: string;
  cliente: DatosClienteTurno;
}

export const ETIQUETAS_ESTADO_TURNO: Record<EstadoTurno, string> = {
  pendiente_verificacion: 'Por verificar',
  pendiente: 'Pendiente',
  completo: 'Completo',
  cancelado: 'Cancelado',
  inasistencia: 'Inasistencia',
};

export function claseBadgeTurno(estado: EstadoTurno): string {
  switch (estado) {
    case 'completo':
      return 'badge-estado badge-estado--confirmado';
    case 'cancelado':
    case 'inasistencia':
      return 'badge-estado badge-estado--cancelado';
    default:
      return 'badge-estado badge-estado--pendiente';
  }
}
