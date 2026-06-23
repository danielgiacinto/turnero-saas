-- Fechas con zona horaria (UTC en almacenamiento; sesión Argentina al consultar).
-- Los valores existentes se interpretan como UTC (comportamiento previo de Prisma con TIMESTAMP).

ALTER TABLE "comercios"
  ALTER COLUMN "fecha_vencimiento" TYPE TIMESTAMPTZ(3) USING "fecha_vencimiento" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "usuarios"
  ALTER COLUMN "email_verificado_fecha" TYPE TIMESTAMPTZ(3) USING "email_verificado_fecha" AT TIME ZONE 'UTC';

ALTER TABLE "clientes"
  ALTER COLUMN "email_verificado_fecha" TYPE TIMESTAMPTZ(3) USING "email_verificado_fecha" AT TIME ZONE 'UTC',
  ALTER COLUMN "telefono_verificado_fecha" TYPE TIMESTAMPTZ(3) USING "telefono_verificado_fecha" AT TIME ZONE 'UTC';

ALTER TABLE "turnos"
  ALTER COLUMN "fecha_hora" TYPE TIMESTAMPTZ(3) USING "fecha_hora" AT TIME ZONE 'UTC',
  ALTER COLUMN "reserva_expira_fecha" TYPE TIMESTAMPTZ(3) USING "reserva_expira_fecha" AT TIME ZONE 'UTC',
  ALTER COLUMN "confirmacion_asistencia_fecha" TYPE TIMESTAMPTZ(3) USING "confirmacion_asistencia_fecha" AT TIME ZONE 'UTC',
  ALTER COLUMN "limite_confirmacion_asistencia" TYPE TIMESTAMPTZ(3) USING "limite_confirmacion_asistencia" AT TIME ZONE 'UTC';

ALTER TABLE "fichas"
  ALTER COLUMN "fecha" TYPE TIMESTAMPTZ(3) USING "fecha" AT TIME ZONE 'UTC',
  ALTER COLUMN "publicado_fecha" TYPE TIMESTAMPTZ(3) USING "publicado_fecha" AT TIME ZONE 'UTC';

ALTER TABLE "movimientos"
  ALTER COLUMN "fecha" TYPE TIMESTAMPTZ(3) USING "fecha" AT TIME ZONE 'UTC';

ALTER TABLE "notificaciones"
  ALTER COLUMN "fecha_programada" TYPE TIMESTAMPTZ(3) USING "fecha_programada" AT TIME ZONE 'UTC';

ALTER TABLE "verificaciones"
  ALTER COLUMN "expira_fecha" TYPE TIMESTAMPTZ(3) USING "expira_fecha" AT TIME ZONE 'UTC',
  ALTER COLUMN "usado_fecha" TYPE TIMESTAMPTZ(3) USING "usado_fecha" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "invitaciones"
  ALTER COLUMN "expiration" TYPE TIMESTAMPTZ(3) USING "expiration" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC';
