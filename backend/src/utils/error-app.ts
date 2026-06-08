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
