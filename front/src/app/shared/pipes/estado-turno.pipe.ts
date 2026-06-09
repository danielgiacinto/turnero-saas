import { Pipe, PipeTransform } from '@angular/core';
import { EstadoTurno } from '../../core/models/turno.model';

const ETIQUETAS_ESTADO: Record<EstadoTurno, string> = {
  pendiente: 'Pendiente',
  completo: 'Completo',
  cancelado: 'Cancelado',
  inasistencia: 'Inasistencia',
};

@Pipe({
  name: 'estadoTurno',
  standalone: true,
})
export class EstadoTurnoPipe implements PipeTransform {
  transform(estado: EstadoTurno | null | undefined): string {
    if (!estado) {
      return '';
    }

    return ETIQUETAS_ESTADO[estado] ?? estado;
  }
}
