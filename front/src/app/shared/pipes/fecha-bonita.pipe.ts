import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaBonita',
  standalone: true,
})
export class FechaBonitaPipe implements PipeTransform {
  transform(valor: string | Date | null | undefined): string {
    if (!valor) {
      return '';
    }

    const fecha = valor instanceof Date ? valor : new Date(valor);

    if (Number.isNaN(fecha.getTime())) {
      return '';
    }

    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
