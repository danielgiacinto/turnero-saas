import nodemailer from 'nodemailer';

import { env, smtpEstaConfigurado } from '../config/env';
import {
  armarPlantillaEmail,
  armarTextoPlano,
  botonPrimario,
  codigoOtpDestacado,
  parrafo,
  textoSecundario,
} from './email/plantilla-email.util';

const OTP_EXPIRACION_MINUTOS = 10;
const NOMBRE_MARCA = 'SaTu';

function crearTransportador() {
  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });
}

async function enviarMail(opciones: {
  destinatario: string;
  asunto: string;
  texto: string;
  html: string;
  contextoLog: string;
}): Promise<void> {
  if (!smtpEstaConfigurado()) {
    if (env.esDesarrollo) {
      console.log(`[Email — sin SMTP] ${opciones.contextoLog} → ${opciones.destinatario}`);
      console.log(opciones.texto);
    }
    return;
  }

  const transportador = crearTransportador();
  await transportador.sendMail({
    from: env.emailFrom,
    to: opciones.destinatario,
    subject: opciones.asunto,
    text: opciones.texto,
    html: opciones.html,
  });

  if (env.esDesarrollo) {
    console.log(`[Email] ${opciones.contextoLog} enviado a ${opciones.destinatario}`);
  }
}

export const emailService = {
  /** OTP de verificación al registrarse (dueño del comercio). */
  async enviarCodigoVerificacionStaff(destinatario: string, codigo: string): Promise<void> {
    const urlVerificar = `${env.frontendUrl}/auth/verificar-email?email=${encodeURIComponent(destinatario)}`;

    const cuerpoHtml = [
      parrafo('¡Gracias por registrarte! Para activar tu cuenta y acceder al panel, ingresá este código:'),
      codigoOtpDestacado(codigo),
      parrafo(`El código vence en <strong>${OTP_EXPIRACION_MINUTOS} minutos</strong>.`),
      botonPrimario(urlVerificar, 'Verificar mi cuenta'),
      textoSecundario('También podés copiar el código e ingresarlo manualmente en la pantalla de verificación.'),
    ].join('');

    const texto = armarTextoPlano([
      `Verificá tu cuenta en ${NOMBRE_MARCA}`,
      `Tu código de verificación es: ${codigo}`,
      `Vence en ${OTP_EXPIRACION_MINUTOS} minutos.`,
      `Ingresá en: ${urlVerificar}`,
      'Si no solicitaste este código, podés ignorar este mensaje.',
    ]);

    await enviarMail({
      destinatario,
      asunto: `Tu código de verificación — ${NOMBRE_MARCA}`,
      texto,
      html: armarPlantillaEmail({
        titulo: 'Verificá tu correo',
        preheader: `Tu código es ${codigo}. Vence en ${OTP_EXPIRACION_MINUTOS} minutos.`,
        cuerpoHtml,
      }),
      contextoLog: 'OTP verificación staff',
    });
  },

  /** Invitación para sumarse como profesional a un comercio. */
  async enviarInvitacionProfesional(opciones: {
    destinatario: string;
    nombreComercio: string;
    link: string;
    diasValidez: number;
  }): Promise<void> {
    const { destinatario, nombreComercio, link, diasValidez } = opciones;

    const cuerpoHtml = [
      parrafo(`Te invitaron a sumarte al equipo de <strong>${nombreComercio}</strong> en ${NOMBRE_MARCA}.`),
      parrafo('Desde el panel vas a poder gestionar turnos, ver tu agenda y colaborar con el resto del equipo.'),
      botonPrimario(link, 'Aceptar invitación'),
      textoSecundario(`Este enlace es personal y vence en ${diasValidez} días.`),
      textoSecundario(`Si el botón no funciona, copiá este enlace en el navegador:<br/><span style="word-break:break-all;color:#444;">${link}</span>`),
    ].join('');

    const texto = armarTextoPlano([
      `Te invitaron a ${nombreComercio} en ${NOMBRE_MARCA}`,
      'Aceptá la invitación desde este enlace:',
      link,
      `Vence en ${diasValidez} días.`,
    ]);

    await enviarMail({
      destinatario,
      asunto: `Te invitaron a ${nombreComercio} — ${NOMBRE_MARCA}`,
      texto,
      html: armarPlantillaEmail({
        titulo: 'Sumate al equipo',
        preheader: `Te invitaron a ${nombreComercio}. Aceptá la invitación.`,
        cuerpoHtml,
      }),
      contextoLog: 'Invitación profesional',
    });
  },

  /** Bienvenida tras verificar el correo del dueño. */
  async enviarBienvenidaStaff(destinatario: string, nombre: string, nombreComercio: string): Promise<void> {
    const urlPanel = `${env.frontendUrl}/panel`;

    const cuerpoHtml = [
      parrafo(`¡Hola, <strong>${nombre}</strong>! Tu cuenta quedó verificada.`),
      parrafo(`Ya podés ingresar al panel de <strong>${nombreComercio}</strong> y empezar a configurar tu comercio.`),
      botonPrimario(urlPanel, 'Ir al panel'),
      parrafo('Próximos pasos: invitá a tu equipo, cargá servicios y compartí tu link público para que tus clientes saquen turnos.'),
    ].join('');

    const texto = armarTextoPlano([
      `¡Bienvenido/a a ${NOMBRE_MARCA}, ${nombre}!`,
      `Tu comercio ${nombreComercio} está listo.`,
      `Ingresá al panel: ${urlPanel}`,
    ]);

    await enviarMail({
      destinatario,
      asunto: `¡Bienvenido/a a ${NOMBRE_MARCA}!`,
      texto,
      html: armarPlantillaEmail({
        titulo: '¡Tu cuenta está activa!',
        preheader: `Bienvenido/a a ${NOMBRE_MARCA}. Tu comercio ${nombreComercio} ya está listo.`,
        cuerpoHtml,
      }),
      contextoLog: 'Bienvenida staff',
    });
  },
};
