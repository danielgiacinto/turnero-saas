/**
 * Agrega la zona horaria de la sesión PostgreSQL a la URL de conexión.
 * Afecta a now(), CURRENT_TIMESTAMP y cómo se interpretan los timestamptz al consultar.
 */
export function agregarZonaHorariaUrl(url: string, zonaHoraria: string): string {
  if (!url.trim()) {
    return url;
  }
  if (/TimeZone=/i.test(url)) {
    return url;
  }

  const opciones = `-c TimeZone=${zonaHoraria}`;
  const parametro = `options=${encodeURIComponent(opciones)}`;
  return url.includes('?') ? `${url}&${parametro}` : `${url}?${parametro}`;
}
