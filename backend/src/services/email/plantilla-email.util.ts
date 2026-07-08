/** Colores de marca SaTu (paleta lima). */
const COLOR_FONDO = '#0a0a0a';
const COLOR_ACENTO = '#c8f135';
const COLOR_ACENTO_TEXTO = '#1a2a00';
const COLOR_TEXTO = '#333333';
const COLOR_MUTED = '#666666';
const COLOR_TARJETA = '#ffffff';
const COLOR_BORDE = '#e8e8e4';

export interface OpcionesPlantilla {
  titulo: string;
  preheader?: string;
  cuerpoHtml: string;
}

export function botonPrimario(url: string, texto: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px auto 8px;">
      <tr>
        <td style="border-radius:8px;background:${COLOR_ACENTO};">
          <a href="${url}" target="_blank" rel="noopener noreferrer"
             style="display:inline-block;padding:14px 32px;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
                    font-size:15px;font-weight:600;color:${COLOR_ACENTO_TEXTO};text-decoration:none;border-radius:8px;">
            ${texto}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function codigoOtpDestacado(codigo: string): string {
  return `
    <div style="text-align:center;margin:24px 0;">
      <span style="display:inline-block;padding:16px 28px;font-family:ui-monospace,'Cascadia Code','Segoe UI Mono',monospace;
                   font-size:32px;font-weight:700;letter-spacing:0.35em;color:${COLOR_TEXTO};
                   background:#f7f7f5;border:2px dashed ${COLOR_BORDE};border-radius:12px;">
        ${codigo}
      </span>
    </div>
  `;
}

export function parrafo(texto: string): string {
  return `<p style="margin:0 0 16px;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.6;color:${COLOR_TEXTO};">${texto}</p>`;
}

export function textoSecundario(texto: string): string {
  return `<p style="margin:0 0 8px;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;font-size:13px;line-height:1.5;color:${COLOR_MUTED};">${texto}</p>`;
}

export function armarPlantillaEmail(opciones: OpcionesPlantilla): string {
  const preheader = opciones.preheader ?? opciones.titulo;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${opciones.titulo}</title>
</head>
<body style="margin:0;padding:0;background:#f0f0ec;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f0f0ec;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;">
          <tr>
            <td style="background:${COLOR_FONDO};border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
              <span style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;font-size:28px;font-weight:800;
                           color:${COLOR_ACENTO};letter-spacing:-0.02em;">SaTu</span>
            </td>
          </tr>
          <tr>
            <td style="background:${COLOR_TARJETA};padding:32px;border-left:1px solid ${COLOR_BORDE};border-right:1px solid ${COLOR_BORDE};">
              <h1 style="margin:0 0 20px;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;font-size:22px;font-weight:700;color:${COLOR_TEXTO};">
                ${opciones.titulo}
              </h1>
              ${opciones.cuerpoHtml}
            </td>
          </tr>
          <tr>
            <td style="background:${COLOR_TARJETA};border-radius:0 0 16px 16px;padding:0 32px 28px;border:1px solid ${COLOR_BORDE};border-top:none;">
              ${textoSecundario('Este mensaje fue enviado automáticamente. Si no lo solicitaste, podés ignorarlo.')}
              ${textoSecundario('© SaTu — Gestión de turnos')}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function armarTextoPlano(secciones: string[]): string {
  return secciones.filter(Boolean).join('\n\n');
}
