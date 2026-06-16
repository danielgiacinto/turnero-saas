"""Genera DiagramaSAAS.drawio.png alineado con backend/prisma/schema.prisma.

Uso: python generar_diagrama.py
Requisito: pip install pillow
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SALIDA = Path(__file__).parent / "DiagramaSAAS.drawio.png"

ANCHO_TABLA = 300
ALTO_FILA = 22
ALTO_HEADER = 30
CANVAS = (2400, 1650)
ESPACIO_ENUM = 12

COLOR_FONDO = (35, 35, 40)
COLOR_HEADER = (0, 0, 0)
COLOR_TITULO = (255, 215, 0)
COLOR_PK = (248, 206, 204)
COLOR_FK = (218, 232, 252)
COLOR_FILA = (55, 55, 60)
COLOR_TEXTO_CLARO = (240, 240, 240)
COLOR_TEXTO_OSCURO = (20, 20, 20)
COLOR_ENUM = (200, 200, 200)
COLOR_BORDE = (120, 120, 120)

# (x, y, nombre, campos, enums, enum_posicion opcional)
# campos: (nombre, tipo, pk|fk|normal)
TABLAS: list[tuple] = [
    (
        30, 30, "Cliente",
        [
            ("id", "UUID", "pk"),
            ("nombre", "varchar", "normal"),
            ("apellido", "varchar", "normal"),
            ("email", "varchar unique", "normal"),
            ("telefono", "varchar", "normal"),
            ("email_verificado", "boolean", "normal"),
            ("telefono_verificado", "boolean", "normal"),
            ("email_verificado_fecha", "timestamp", "normal"),
            ("telefono_verificado_fecha", "timestamp", "normal"),
            ("token_acceso_portal", "varchar", "normal"),
        ],
        None,
    ),
    (
        380, 30, "Servicio",
        [
            ("id", "UUID", "pk"),
            ("comercio_id", "", "fk"),
            ("nombre", "varchar", "normal"),
            ("duracion_minutos", "int", "normal"),
            ("precio", "decimal", "normal"),
            ("modalidad", "enum", "normal"),
        ],
        [("modalidad:", ["presencial", "online"])],
        "abajo",
    ),
    (
        720, 30, "Notificacion",
        [
            ("id", "UUID", "pk"),
            ("comercio_id", "", "fk"),
            ("turno_id", "", "fk"),
            ("cliente_id", "", "fk"),
            ("canal_notificacion", "enum", "normal"),
            ("destinatario", "varchar", "normal"),
            ("plantilla_nombre", "varchar", "normal"),
            ("datos_variables", "JSONB", "normal"),
            ("fecha_programada", "timestamp", "normal"),
            ("estado", "enum", "normal"),
            ("intentos", "int", "normal"),
            ("error_log", "varchar", "normal"),
        ],
        [
            ("canal:", ["whatsapp", "email"]),
            ("estado:", ["pendiente", "enviado", "fallido"]),
        ],
    ),
    (
        1180, 30, "Ficha",
        [
            ("id", "UUID", "pk"),
            ("comercio_id", "", "fk"),
            ("cliente_id", "", "fk"),
            ("profesional_id", "", "fk"),
            ("fecha", "timestamp", "normal"),
            ("datos_dinamicos", "JSONB", "normal"),
            ("visible_cliente", "boolean", "normal"),
            ("titulo_cliente", "varchar", "normal"),
            ("contenido_cliente", "JSONB", "normal"),
            ("publicado_fecha", "timestamp", "normal"),
        ],
        None,
    ),
    (
        30, 360, "Comercio",
        [
            ("id", "UUID", "pk"),
            ("nombre", "varchar", "normal"),
            ("url", "varchar", "normal"),
            ("estado_suscripcion", "enum", "normal"),
            ("direccion", "varchar", "normal"),
            ("barrio", "varchar", "normal"),
            ("rubro", "enum", "normal"),
            ("fecha_vencimiento", "timestamp", "normal"),
            ("created_at", "timestamp", "normal"),
            ("mp_preapproval_id", "varchar", "normal"),
            ("logo_url", "varchar", "normal"),
            ("requiere_confirmacion_asistencia", "boolean", "normal"),
            ("horas_anticipacion_confirmacion", "int", "normal"),
            ("minutos_hold_reserva_sin_verificar", "int", "normal"),
            ("minutos_expiracion_codigo_otp", "int", "normal"),
            ("politica_no_confirmacion", "enum", "normal"),
        ],
        [("politica_no_confirmacion:", ["cancelar", "mantener"])],
        "abajo",
    ),
    (
        430, 360, "Turno",
        [
            ("id", "UUID", "pk"),
            ("comercio_id", "", "fk"),
            ("cliente_id", "", "fk"),
            ("profesional_id", "", "fk"),
            ("servicio_id", "", "fk"),
            ("creado_por_usuario_id", "", "fk"),
            ("link_reunion", "varchar", "normal"),
            ("estado", "enum", "normal"),
            ("origen_reserva", "enum", "normal"),
            ("fecha_hora", "timestamp", "normal"),
            ("reserva_expira_fecha", "timestamp", "normal"),
            ("confirmacion_asistencia", "enum", "normal"),
            ("confirmacion_asistencia_fecha", "timestamp", "normal"),
            ("limite_confirmacion_asistencia", "timestamp", "normal"),
        ],
        [
            ("estado:", ["pendiente_verificacion", "pendiente", "completo", "cancelado", "inasistencia"]),
            ("origen_reserva:", ["portal_publico", "panel_staff"]),
            ("confirmacion_asistencia:", ["no_requerida", "pendiente", "confirmada", "rechazada", "expirada"]),
        ],
    ),
    (
        900, 360, "Invitacion",
        [
            ("id", "UUID", "pk"),
            ("comercio_id", "", "fk"),
            ("email", "varchar", "normal"),
            ("token", "varchar", "normal"),
            ("estado", "enum", "normal"),
            ("usuario_id", "", "fk"),
            ("expiration", "timestamp", "normal"),
            ("created_at", "timestamp", "normal"),
        ],
        [("estado:", ["pendiente", "aceptada", "expirada"])],
    ),
    (
        1280, 360, "Usuario",
        [
            ("id", "UUID", "pk"),
            ("comercio_id", "", "fk"),
            ("nombre", "varchar", "normal"),
            ("email", "varchar", "normal"),
            ("password", "varchar", "normal"),
            ("google_id", "varchar", "normal"),
            ("telefono", "varchar", "normal"),
            ("rol", "enum", "normal"),
            ("matricula_profesional", "varchar", "normal"),
            ("biografia", "varchar", "normal"),
            ("porcentaje_comision", "decimal", "normal"),
            ("activo", "boolean", "normal"),
        ],
        [("rol:", ["super_admin", "admin", "profesional"])],
    ),
    (
        30, 820, "Horario",
        [
            ("id", "UUID", "pk"),
            ("usuario_id", "", "fk"),
            ("dia_semana", "int", "normal"),
            ("hora_inicio", "time", "normal"),
            ("hora_fin", "time", "normal"),
        ],
        None,
    ),
    (
        380, 820, "Movimiento",
        [
            ("id", "UUID", "pk"),
            ("comercio_id", "", "fk"),
            ("turno_id", "", "fk"),
            ("profesional_id", "", "fk"),
            ("tipo", "enum", "normal"),
            ("monto", "decimal", "normal"),
            ("metodo_pago", "enum", "normal"),
            ("concepto", "varchar", "normal"),
            ("monto_comision_profesional", "decimal", "normal"),
            ("fecha", "timestamp", "normal"),
        ],
        [
            ("tipo:", ["ingreso", "egreso"]),
            ("metodo_pago:", ["efectivo", "transferencia"]),
        ],
    ),
    (
        780, 820, "Verificacion",
        [
            ("id", "UUID", "pk"),
            ("cliente_id", "", "fk"),
            ("turno_id", "", "fk"),
            ("email", "varchar", "normal"),
            ("telefono", "varchar", "normal"),
            ("codigo_hash", "varchar", "normal"),
            ("proposito", "enum", "normal"),
            ("canal", "enum", "normal"),
            ("intentos", "int", "normal"),
            ("max_intentos", "int", "normal"),
            ("expira_fecha", "timestamp", "normal"),
            ("usado_fecha", "timestamp", "normal"),
            ("created_at", "timestamp", "normal"),
        ],
        [
            ("proposito:", ["registro_cliente", "acceso_portal", "reenvio_identidad"]),
            ("canal:", ["email", "whatsapp", "sms"]),
        ],
    ),
]


def _parse_tabla(entrada: tuple) -> tuple[int, int, str, list, list | None, str]:
    enum_pos = entrada[5] if len(entrada) > 5 else "derecha"
    return entrada[0], entrada[1], entrada[2], entrada[3], entrada[4], enum_pos


def fuente(tam: int, negrita: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidatos = [
        "C:/Windows/Fonts/consola.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ]
    for ruta in candidatos:
        try:
            return ImageFont.truetype(ruta, tam)
        except OSError:
            continue
    return ImageFont.load_default()


def dibujar_enums(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    alto_tabla: int,
    enums: list[tuple[str, list[str]]],
    posicion: str,
) -> None:
    f_enum = fuente(10)

    if posicion == "abajo":
        ex = x + 6
        ey = y + alto_tabla + 8
    else:
        ex = x + ANCHO_TABLA + 8
        ey = y + ALTO_HEADER

    for titulo, valores in enums:
        draw.text((ex, ey), titulo, fill=COLOR_ENUM, font=f_enum)
        ey += 14
        for v in valores:
            draw.text((ex + 4, ey), v, fill=COLOR_ENUM, font=f_enum)
            ey += 13
        ey += ESPACIO_ENUM


def dibujar_tabla(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    nombre: str,
    campos: list[tuple[str, str, str]],
    enums: list[tuple[str, list[str]]] | None = None,
    enum_posicion: str = "derecha",
) -> None:
    f_header = fuente(14, True)
    f_campo = fuente(11)

    alto = ALTO_HEADER + len(campos) * ALTO_FILA
    draw.rectangle([x, y, x + ANCHO_TABLA, y + alto], fill=COLOR_FILA, outline=COLOR_BORDE, width=1)
    draw.rectangle([x, y, x + ANCHO_TABLA, y + ALTO_HEADER], fill=COLOR_HEADER, outline=COLOR_BORDE, width=1)
    draw.text((x + 8, y + 6), nombre, fill=COLOR_TITULO, font=f_header)

    for i, (campo, tipo, rol) in enumerate(campos):
        fy = y + ALTO_HEADER + i * ALTO_FILA
        bg = COLOR_PK if rol == "pk" else COLOR_FK if rol == "fk" else COLOR_FILA
        fg = COLOR_TEXTO_OSCURO if rol in ("pk", "fk") else COLOR_TEXTO_CLARO
        draw.rectangle([x, fy, x + ANCHO_TABLA, fy + ALTO_FILA], fill=bg, outline=COLOR_BORDE, width=1)
        etiqueta = f"{campo}: {tipo}"
        if rol == "pk":
            etiqueta = f"{campo}: UUID - PK"
        elif rol == "fk":
            etiqueta = f"{campo}: FK"
        draw.text((x + 6, fy + 4), etiqueta, fill=fg, font=f_campo)

    if enums:
        dibujar_enums(draw, x, y, alto, enums, enum_posicion)


def main() -> None:
    img = Image.new("RGB", CANVAS, COLOR_FONDO)
    draw = ImageDraw.Draw(img)

    for entrada in TABLAS:
        x, y, nombre, campos, enums, enum_pos = _parse_tabla(entrada)
        dibujar_tabla(draw, x, y, nombre, campos, enums, enum_pos)

    img.save(SALIDA, "PNG", optimize=True)
    print(f"Diagrama generado: {SALIDA}")


if __name__ == "__main__":
    main()
