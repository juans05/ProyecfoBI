/**
 * domains/auth/auth.service.ts
 * Lógica de negocio de autenticación
 */

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateSecureToken, hashToken, getExpiresAt } from '@/lib/utils'
import { sendPasswordResetEmail } from '@/lib/email'

export const AuthService = {
  /**
   * Verifica credenciales para NextAuth credentials provider
   */
  async verifyCredentials(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        profiles: {
          include: { profile: true },
        },
        company: true
      },
    })

    if (!user || !user.isActive) return null

    // Si pertenece a una empresa, verificar que la empresa esté activa
    if (user.companyId && !user.company?.isActive) return null

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) return null

    return {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      isRoot: user.isRoot,
      companyId: user.companyId,
      companyName: user.company?.name,
      profiles: user.profiles.map((up) => up.profile.name),
    }
  },

  /**
   * Inicia el flujo de recuperación de contraseña
   */
  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })

    // Siempre responder igual por seguridad (no revelar si el email existe)
    if (!user || !user.isActive) return

    // Invalidar tokens previos del usuario
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

    // Generar token seguro
    const rawToken = generateSecureToken()
    const tokenHash = hashToken(rawToken)
    const expiresAt = getExpiresAt(1) // 1 hora

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    })

    await sendPasswordResetEmail(user.email, rawToken, user.firstName)
  },

  /**
   * Restablece la contraseña usando el token
   */
  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = hashToken(rawToken)

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    })

    if (!resetToken) {
      throw new Error('Token inválido o expirado')
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ])
  },

  /**
   * Cambia contraseña (usuario autenticado)
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('Usuario no encontrado')

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValid) throw new Error('Contraseña actual incorrecta')

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
  },
}
