/**
 * domains/navigation/navigation.service.ts
 * Construye el menú dinámico del usuario autenticado
 * basado en sus perfiles y permisos en base de datos
 */

import { prisma } from '@/lib/prisma'

export type NavResource = {
  id: string
  name: string
  type: string
  url: string | null
  order: number
}

export type NavModule = {
  id: string
  name: string
  icon: string | null
  order: number
  parentId: string | null
  resources: NavResource[]
  children: NavModule[]
}

export const NavigationService = {
  /**
   * Retorna el árbol de menú al que tiene acceso el usuario.
   * Solo incluye módulos y recursos con permiso activo.
   */
  async getMenuForUser(userId: string): Promise<NavModule[]> {
    // Obtener perfiles del usuario
    const userProfiles = await prisma.userProfile.findMany({
      where: { userId },
      select: { profileId: true },
    })
    const profileIds = userProfiles.map((up) => up.profileId)

    // Módulos accesibles por sus perfiles
    const accessibleModules = await prisma.profileModule.findMany({
      where: {
        profileId: { in: profileIds },
        canAccess: true,
      },
      include: {
        module: {
          include: {
            children: true,
            resources: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })

    // Recursos accesibles por sus perfiles
    const accessibleResourceIds = await prisma.profileResource.findMany({
      where: {
        profileId: { in: profileIds },
        canView: true,
      },
      select: { resourceId: true },
    })
    const resourceIdSet = new Set(accessibleResourceIds.map((pr) => pr.resourceId))

    // Deduplicar módulos (un usuario puede tener múltiples perfiles)
    const moduleMap = new Map<string, NavModule>()

    for (const pm of accessibleModules) {
      const mod = pm.module
      if (moduleMap.has(mod.id)) continue
      if (!mod.isActive) continue

      moduleMap.set(mod.id, {
        id: mod.id,
        name: mod.name,
        icon: mod.icon,
        order: mod.order,
        parentId: mod.parentId,
        resources: mod.resources
          .filter((r) => resourceIdSet.has(r.id))
          .map((r) => ({
            id: r.id,
            name: r.name,
            type: r.type,
            url: r.url,
            order: r.order,
          })),
        children: [],
      })
    }

    // Construir jerarquía (módulos padre/hijo)
    const roots: NavModule[] = []
    for (const mod of moduleMap.values()) {
      if (mod.parentId && moduleMap.has(mod.parentId)) {
        moduleMap.get(mod.parentId)!.children.push(mod)
      } else {
        roots.push(mod)
      }
    }

    // Ordenar por campo order
    const sortByOrder = (a: NavModule, b: NavModule) => a.order - b.order
    roots.sort(sortByOrder)
    for (const mod of moduleMap.values()) {
      mod.children.sort(sortByOrder)
    }

    return roots
  },
}
