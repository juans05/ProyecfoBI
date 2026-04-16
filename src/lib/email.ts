/**
 * lib/email.ts
 * Cliente de email (Nodemailer) para recuperación de contraseña
 */

import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendPasswordResetEmail(to: string, token: string, name: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Recuperación de contraseña — Intranet',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Recuperación de contraseña</h2>
        <p>Hola <strong>${name}</strong>,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente botón (válido por <strong>1 hora</strong>):</p>
        <a href="${resetUrl}" 
           style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
          Restablecer contraseña
        </a>
        <p style="color:#6b7280;margin-top:24px;font-size:13px;">
          Si no solicitaste este cambio, ignora este correo.
        </p>
      </div>
    `,
  })
}
