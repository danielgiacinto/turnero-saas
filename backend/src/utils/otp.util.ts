import { randomInt } from 'crypto';

/** Genera un código numérico aleatorio de la longitud indicada (default 6 dígitos). */
export function generarCodigoOtp(longitud = 6): string {
  const maximo = 10 ** longitud;
  return randomInt(0, maximo).toString().padStart(longitud, '0');
}
