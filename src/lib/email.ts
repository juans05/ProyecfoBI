/**
 * lib/email.ts
 * Cliente de email (Resend) para recuperación de contraseña
 */

import { Resend } from 'resend'

// Solo inicializar si existe la clave, para evitar que el servidor explote si falta en el .env
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Email de origen (debe estar verificado en Resend o ser el de prueba)
const FROM_EMAIL = process.env.SMTP_FROM || 'onboarding@resend.dev'

export async function sendPasswordResetEmail(to: string, token: string, name: string) {
  if (!resend) {
    console.error('❌ Resend no está configurado. Falta RESEND_API_KEY en el archivo .env')
    throw new Error('Error de configuración en el servicio de correo')
  }

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  const { data, error } = await resend.emails.send({
    from: `Intranet BI <${FROM_EMAIL}>`,
    to: [to],
    subject: 'Recuperación de contraseña — Intranet',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Recuperación de contraseña</h2>
        <p>Hola <strong>${name}</strong>,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente botón (válido por <strong>1 hora</strong>):</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
            Restablecer contraseña
          </a>
        </div>
        <p style="color:#6b7280;margin-top:24px;font-size:13px;">
          Si no solicitaste este cambio, ignora este correo.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="color:#9ca3af;font-size:11px;text-align:center;">
          Enviado por Intranet Modular BI
        </p>
      </div>
    `,
  })

  if (error) {
    console.error('❌ Error enviando email con Resend:', error)
    throw new Error('No se pudo enviar el email de recuperación')
  }

  return data
}
