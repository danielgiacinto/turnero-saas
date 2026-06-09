-- CreateEnum
CREATE TYPE "TipoRubro" AS ENUM ('estetica', 'barberia', 'salud_medicina', 'psicologia', 'nutricion', 'medicina');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('admin', 'profesional');

-- CreateEnum
CREATE TYPE "EstadoTurno" AS ENUM ('pendiente', 'completo', 'cancelado', 'inasistencia');

-- CreateEnum
CREATE TYPE "EstadoSuscripcion" AS ENUM ('pendiente', 'activa', 'suspendida', 'cancelada');

-- CreateEnum
CREATE TYPE "ModalidadServicio" AS ENUM ('presencial', 'online');

-- CreateEnum
CREATE TYPE "CanalNotificacion" AS ENUM ('whatsapp', 'email');

-- CreateEnum
CREATE TYPE "EstadoNotificacion" AS ENUM ('pendiente', 'enviado', 'fallido');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('ingreso', 'egreso');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('efectivo', 'transferencia');

-- CreateTable
CREATE TABLE "comercios" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "estado_suscripcion" "EstadoSuscripcion" NOT NULL,
    "direccion" TEXT,
    "barrio" TEXT NOT NULL,
    "rubro" "TipoRubro" NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mp_preapproval_id" TEXT,
    "logo_url" TEXT,

    CONSTRAINT "comercios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "comercio_id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "matricula_profesional" TEXT,
    "biografia" TEXT,
    "porcentaje_comision" DECIMAL(10,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "hora_inicio" TIME(0) NOT NULL,
    "hora_fin" TIME(0) NOT NULL,

    CONSTRAINT "horarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicios" (
    "id" UUID NOT NULL,
    "comercio_id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "duracion_minutos" INTEGER NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "modalidad" "ModalidadServicio" NOT NULL,

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnos" (
    "id" UUID NOT NULL,
    "comercio_id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "profesional_id" UUID NOT NULL,
    "servicio_id" UUID NOT NULL,
    "link_reunion" TEXT,
    "estado" "EstadoTurno" NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fichas" (
    "id" UUID NOT NULL,
    "comercio_id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "profesional_id" UUID NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "datos_dinamicos" JSONB NOT NULL,

    CONSTRAINT "fichas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos" (
    "id" UUID NOT NULL,
    "comercio_id" UUID NOT NULL,
    "turno_id" UUID,
    "profesional_id" UUID NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo_pago" "MetodoPago" NOT NULL,
    "concepto" TEXT NOT NULL,
    "monto_comision_profesional" DECIMAL(10,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" UUID NOT NULL,
    "comercio_id" UUID NOT NULL,
    "turno_id" UUID NOT NULL,
    "canal_notificacion" "CanalNotificacion" NOT NULL,
    "destinatario" TEXT NOT NULL,
    "plantilla_nombre" TEXT NOT NULL,
    "datos_variables" JSONB NOT NULL,
    "fecha_programada" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoNotificacion" NOT NULL,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "error_log" TEXT,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comercios_url_key" ON "comercios"("url");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_telefono_key" ON "clientes"("telefono");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_comercio_id_fkey" FOREIGN KEY ("comercio_id") REFERENCES "comercios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios" ADD CONSTRAINT "horarios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicios" ADD CONSTRAINT "servicios_comercio_id_fkey" FOREIGN KEY ("comercio_id") REFERENCES "comercios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_comercio_id_fkey" FOREIGN KEY ("comercio_id") REFERENCES "comercios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fichas" ADD CONSTRAINT "fichas_comercio_id_fkey" FOREIGN KEY ("comercio_id") REFERENCES "comercios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fichas" ADD CONSTRAINT "fichas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fichas" ADD CONSTRAINT "fichas_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos" ADD CONSTRAINT "movimientos_comercio_id_fkey" FOREIGN KEY ("comercio_id") REFERENCES "comercios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos" ADD CONSTRAINT "movimientos_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "turnos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos" ADD CONSTRAINT "movimientos_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_comercio_id_fkey" FOREIGN KEY ("comercio_id") REFERENCES "comercios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "turnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
