import { ZONA_HORARIA } from '../config/inicializar-zona-horaria';

/** Fecha/hora actual (instante UTC interno; la zona se aplica al persistir y mostrar). */
export function ahora(): Date {
  return new Date();
}

/** Suma días calendario al instante dado. */
export function sumarDias(dias: number, desde: Date = ahora()): Date {
  const resultado = new Date(desde);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}

/** Suma minutos al instante dado. */
export function sumarMinutos(minutos: number, desde: Date = ahora()): Date {
  return new Date(desde.getTime() + minutos * 60_000);
}

/** Formato legible en Argentina (para logs y mensajes). */
export function formatearFechaArgentina(fecha: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: ZONA_HORARIA,
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(fecha);
}

export { ZONA_HORARIA };
