import { prisma } from '@/lib/prisma'
import { ResourceType } from '@prisma/client'

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
   * [ULTRA-OPTIMIZADO] Obtiene la estructura del menú en una sola consulta.
   */
  static async getMenuData(userId: string, companyId: string, branchId?: string) {
    // Consulta atómica que valida permisos, empresa, sede y jerarquía en un solo paso
    const modules = await prisma.module.findMany({
      where: {
        companyId,
        isActive: true,
        resources: {
          some: {
            isActive: true,
            OR: [
              { branchId: branchId || null },
              { branchId: null }
            ],
            profileResources: {
              some: {
                canView: true,
                profile: {
                  isActive: true,
                  users: {
                    some: { userId }
                  }
                }
              }
            }
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
                canView: true,
                profile: {
                  isActive: true,
                  users: {
                    some: { userId }
                  }
                }
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
  }
}
