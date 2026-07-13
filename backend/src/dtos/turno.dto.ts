import { DatosClienteDto } from '../services/cliente.service';

export interface CrearTurnoDto {
  /** Solo lo usa el admin para agendar a otro profesional; el profesional agenda sobre sí mismo. */
  profesional_id?: string;
  servicio_id: string;
  /** Fecha del turno en formato YYYY-MM-DD. */
  fecha: string;
  /** Hora de inicio en formato HH:mm. */
  hora: string;
  cliente: DatosClienteDto;
}
