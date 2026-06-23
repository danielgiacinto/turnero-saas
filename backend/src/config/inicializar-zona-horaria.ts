/** Debe importarse antes que cualquier otro módulo que use fechas. */
export const ZONA_HORARIA = process.env.TZ ?? 'America/Argentina/Buenos_Aires';

process.env.TZ = ZONA_HORARIA;
