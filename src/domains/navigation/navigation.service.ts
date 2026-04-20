import { prisma } from '@/lib/prisma'
import { ResourceType } from '@prisma/client'
import { cache } from 'react'

export interface MenuItem {
  id: string
  name: string
  icon: string | null
  href?: string
  group?: string
  children?: MenuItem[]
}

export class NavigationService {
  /**
   * [ULTRA-OPTIMIZADO] Obtiene la estructura del menú en dos pasos simples para evitar JOINs masivos.
   */
  static getMenuData = cache(async (userId: string, companyId: string, branchId?: string) => {
    // 1. Obtener IDs de perfiles activos del usuario de un solo paso
    const userProfiles = await prisma.userProfile.findMany({
      where: { userId, profile: { isActive: true } },
      select: { profileId: true }
    })
    
    const activeProfileIds = userProfiles.map(p => p.profileId)

    if (activeProfileIds.length === 0) return []

    // 2. Consulta de módulos y recursos usando los perfiles ya conocidos
    const modules = await prisma.module.findMany({
      where: {
        companyId,
        isActive: true,
        profileModules: {
          some: {
            profileId: { in: activeProfileIds },
            canAccess: true
          }
        }
      },
      include: {
        resources: {
          where: {
            isActive: true,
            OR: [
              { branchId: branchId || null },
              { branchId: null }
            ],
            profileResources: {
              some: {
                profileId: { in: activeProfileIds },
                canView: true
              }
            }
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    })

    return modules.map((mod) => ({
      id: mod.id,
      name: mod.name,
      icon: mod.icon,
      resources: mod.resources.map((res) => ({
        id: res.id,
        name: res.name,
        type: res.type,
        href: res.type === ResourceType.POWERBI 
          ? `/dashboard/bi/${res.id}` 
          : res.url || '#',
      })),
    }))
  })
}
