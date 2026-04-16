/**
 * domains/permissions/permissions.guard.ts
 * Guard de permisos optimizado para alto rendimiento
 */

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ApiErrors } from '@/lib/api-response'

/**
 * Verifica que el usuario tenga sesión activa.
 */
export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) {
    return { session: null, error: ApiErrors.UNAUTHORIZED() }
  }
  return { session, error: null }
}

/**
 * [OPTIMIZADO] Verifica acceso con una sola consulta a la base de datos.
 * Reduce la latencia de navegación al consolidar validaciones de perfil, recurso y sede.
 */
export async function requireResourceAccess(
  userId: string,
  resourceId: string,
  activeBranchId?: string,
  permission: 'canView' | 'canEdit' | 'canDelete' = 'canView'
) {
  // Una sola consulta que valida el permiso a través de la relación Profile -> User
  const access = await prisma.profileResource.findFirst({
    where: {
      resourceId,
      [permission]: true,
      profile: {
        isActive: true,
        users: {
          some: { userId }
        }
      }
    },
    select: {
      resource: {
        select: { branchId: true }
      }
    }
  })

  if (!access) return false

  // Validación de sede (solo si el recurso está restringido a una sede específica)
  if (access.resource.branchId && activeBranchId && access.resource.branchId !== activeBranchId) {
    return false
  }

  return true
}

/**
 * [OPTIMIZADO] Verifica acceso a módulo consolidado.
 */
export async function requireModuleAccess(userId: string, moduleId: string) {
  const access = await prisma.profileModule.findFirst({
    where: {
      moduleId,
      canAccess: true,
      profile: {
        isActive: true,
        users: {
          some: { userId }
        }
      }
    }
  })

  return !!access
}

/**
 * Verifica si el usuario es administrador global de su empresa.
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const isAdminUser = await prisma.userProfile.findFirst({
    where: { 
      userId,
      profile: {
        name: 'Administrador',
        isActive: true
      }
    },
  })

  return !!isAdminUser
}
