import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { routes } from './routes';
import { manejadorErrores } from './middlewares/manejador-errores.middleware';
import { rutaNoEncontrada } from './middlewares/ruta-no-encontrada.middleware';

export function crearApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.use('/api', routes);

  app.use(rutaNoEncontrada);
  app.use(manejadorErrores);

  return app;
}
