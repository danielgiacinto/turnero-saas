import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { ErrorNoAutorizado, ErrorSuscripcionInactiva } from '../utils/error-app';
import { comercioTieneAccesoActivo } from '../utils/suscripcion.util';

/**
 * Bloquea el uso del panel si la suscripción no está vigente.
 * El login y `/me` siguen permitidos; el front muestra la pantalla de aviso.
 */
export async function requerirSuscripcionActiva(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const comercioId = req.usuario?.comercio_id;
    if (!comercioId) {
      next(new ErrorNoAutorizado('El usuario no está asociado a un comercio.'));
      return;
    }

    const comercio = await prisma.comercio.findUnique({
      where: { id: comercioId },
      select: { estado_suscripcion: true, fecha_vencimiento: true },
    });

    if (!comercio) {
      next(new ErrorNoAutorizado('Comercio no encontrado.'));
      return;
    }

    if (!comercioTieneAccesoActivo(comercio)) {
      next(
        new ErrorSuscripcionInactiva(
          'La suscripción de tu comercio no está activa. Regularizá el pago para continuar.',
          {
            estado_suscripcion: comercio.estado_suscripcion,
            fecha_vencimiento: comercio.fecha_vencimiento,
          },
        ),
      );
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}
