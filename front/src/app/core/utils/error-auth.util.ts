export interface DetalleEmailNoVerificado {
  codigo: 'email_no_verificado';
  email: string;
}

export function obtenerDetalleEmailNoVerificado(err: unknown): DetalleEmailNoVerificado | null {
  const respuesta = err as { status?: number; error?: { detalle?: DetalleEmailNoVerificado } };
  if (respuesta?.status === 403 && respuesta.error?.detalle?.codigo === 'email_no_verificado') {
    return respuesta.error.detalle;
  }
  return null;
}

export function emailEstaEnmascarado(email: string): boolean {
  return email.includes('***');
}
