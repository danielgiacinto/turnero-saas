import type { EstadoTurno, OrigenReserva } from './turno.model';

export interface ClienteResumen {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
}

export interface ClienteListado extends ClienteResumen {
  total_turnos: number;
  ultimo_turno: string | null;
}

export interface TurnoCliente {
  id: string;
  fecha_hora: string;
  estado: EstadoTurno;
  origen_reserva: OrigenReserva;
  duracion_minutos: number;
  servicio: { id: string; nombre: string };
  profesional: { id: string; nombre: string };
}

export interface ClienteDetalle extends ClienteResumen {
  email_verificado: boolean;
  telefono_verificado: boolean;
  total_turnos: number;
  turnos: TurnoCliente[];
}

export interface GuardarCliente {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
}
