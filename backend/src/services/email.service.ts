import nodemailer from 'nodemailer';

import { env, smtpEstaConfigurado } from '../config/env';

const OTP_EXPIRACION_MINUTOS = 10;

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

function armarCuerpoOtp(codigo: string): { texto: string; html: string } {
  const texto = [
    'Verificá tu cuenta en Turnero',
    '',
    `Tu código de verificación es: ${codigo}`,
    '',
    `Vence en ${OTP_EXPIRACION_MINUTOS} minutos.`,
    'Si no solicitaste este código, podés ignorar este mensaje.',
  ].join('\n');

  const html = `
    <p>Verificá tu cuenta en <strong>Turnero</strong>.</p>
    <p>Tu código de verificación es:</p>
    <p style="font-size:28px;font-weight:bold;letter-spacing:0.2em;margin:16px 0">${codigo}</p>
    <p style="color:#666;font-size:14px">Vence en ${OTP_EXPIRACION_MINUTOS} minutos.</p>
    <p style="color:#666;font-size:14px">Si no solicitaste este código, podés ignorar este mensaje.</p>
  `;

  return { texto, html };
}

export const emailService = {
  /**
   * Envía el OTP de verificación de staff por correo.
   * Si SMTP no está configurado, solo registra en consola (desarrollo).
   */
  async enviarCodigoVerificacionStaff(destinatario: string, codigo: string): Promise<void> {
    if (!smtpEstaConfigurado()) {
      if (env.esDesarrollo) {
        console.log(
          `[OTP registro staff] ${destinatario}: ${codigo} (vence en ${OTP_EXPIRACION_MINUTOS} min)`,
        );
        console.log(
          '[Email] SMTP no configurado — el código NO se envió por correo. ' +
            'Configurá SMTP_HOST, SMTP_USER y SMTP_PASS en backend/.env o revisá esta consola.',
        );
      }
      return;
    }

    const { texto, html } = armarCuerpoOtp(codigo);
    const transportador = crearTransportador();

    await transportador.sendMail({
      from: env.emailFrom,
      to: destinatario,
      subject: 'Tu código de verificación — Turnero',
      text: texto,
      html,
    });

    if (env.esDesarrollo) {
      console.log(`[Email] Código de verificación enviado a ${destinatario}`);
    }
  },
};
