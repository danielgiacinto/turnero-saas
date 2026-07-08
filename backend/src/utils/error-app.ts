export class ErrorApp extends Error {
  constructor(
    public readonly mensaje: string,
    public readonly codigoHttp: number = 500,
    public readonly detalle?: unknown,
  ) {
    super(mensaje);
    this.name = 'ErrorApp';
  }
}

export class ErrorNoEncontrado extends ErrorApp {
  constructor(mensaje = 'Recurso no encontrado.') {
    super(mensaje, 404);
    this.name = 'ErrorNoEncontrado';
  }
}

export class ErrorValidacion extends ErrorApp {
  constructor(mensaje = 'Datos inválidos.', detalle?: unknown) {
    super(mensaje, 400, detalle);
    this.name = 'ErrorValidacion';
  }
}

export class ErrorNoAutorizado extends ErrorApp {
  constructor(mensaje = 'No autorizado.') {
    super(mensaje, 401);
    this.name = 'ErrorNoAutorizado';
  }
}

/**
 * Se lanza cuando una cuenta de staff intenta ingresar sin haber verificado su correo.
 * El `detalle.codigo` permite al front redirigir a la pantalla de verificación.
 */
export class ErrorEmailNoVerificado extends ErrorApp {
  constructor(emailEnmascarado: string) {
    super('Tenés que verificar tu correo antes de ingresar.', 403, {
      codigo: 'email_no_verificado',
      email: emailEnmascarado,
    });
    this.name = 'ErrorEmailNoVerificado';
  }
}

/**
 * Se lanza cuando la suscripción del comercio no permite usar el panel.
 * El login sigue permitido; el front muestra la pantalla de aviso.
 */
export class ErrorSuscripcionInactiva extends ErrorApp {
  constructor(
    mensaje = 'La suscripción de tu comercio no está activa.',
    detalle?: { estado_suscripcion: string; fecha_vencimiento: Date },
  ) {
    super(mensaje, 403, {
      codigo: 'suscripcion_inactiva',
      ...detalle,
    });
    this.name = 'ErrorSuscripcionInactiva';
  }
}
