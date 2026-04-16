/**
 * domains/permissions/permissions.guard.ts
 * Guard de permisos — SIEMPRE validar en backend, nunca solo en frontend
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { ApiErrors } from '@/lib/api-response'

/**
 * Verifica que el usuario tenga sesión activa.
 * Retorna la sesión o una respuesta 401.
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { session: null, error: ApiErrors.UNAUTHORIZED() }
  }
  return { session, error: null }
}

/**
 * Verifica que el usuario tenga acceso a un recurso específico.
 * Busca por URL de recurso (para PAGE) o por resourceId.
 */
export async function requireResourceAccess(
  userId: string,
  resourceId: string,
  permission: 'canView' | 'canEdit' | 'canDelete' = 'canView'
) {
  // Obtener perfiles del usuario
  const userProfiles = await prisma.userProfile.findMany({
    where: { userId },
    select: { profileId: true },
  })

  const profileIds = userProfiles.map((up) => up.profileId)

  // Verificar si alguno de sus perfiles tiene el permiso
  const access = await prisma.profileResource.findFirst({
    where: {
      profileId: { in: profileIds },
      resourceId,
      [permission]: true,
    },
  })

  return !!access
}

/**
 * Verifica que el usuario tenga acceso a un módulo.
 */
export async function requireModuleAccess(userId: string, moduleId: string) {
  const userProfiles = await prisma.userProfile.findMany({
    where: { userId },
    select: { profileId: true },
  })

  const profileIds = userProfiles.map((up) => up.profileId)

  const access = await prisma.profileModule.findFirst({
    where: {
      profileId: { in: profileIds },
      moduleId,
      canAccess: true,
    },
  })

  return !!access
}

/**
 * Verifica si el usuario es administrador
 * (tiene el perfil "Administrador")
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const adminProfile = await prisma.profile.findUnique({
    where: { name: 'Administrador' },
  })
  if (!adminProfile) return false

  const isAdminUser = await prisma.userProfile.findFirst({
    where: { userId, profileId: adminProfile.id },
  })

  return !!isAdminUser
}
