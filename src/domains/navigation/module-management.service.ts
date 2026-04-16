import { prisma } from "@/lib/prisma"
import { ResourceType } from "@prisma/client"

export const ModuleManagementService = {
  /**
   * Obtiene todos los módulos y recursos de una empresa
   */
  async getCompanyModules(companyId: string) {
    return await prisma.module.findMany({
      where: { companyId },
      include: {
        resources: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })
  },

  /**
   * Crea un nuevo módulo y otorga permisos automáticos al Administrador
   */
  async createModule(companyId: string, name: string, icon: string) {
    return await prisma.$transaction(async (tx) => {
      const module = await tx.module.create({
        data: { companyId, name, icon, isActive: true }
      })

      // Otorgar permiso automático al perfil de Administrador de la empresa
      const adminProfile = await tx.profile.findFirst({
        where: { name: 'Administrador', companyId }
      })

      if (adminProfile) {
        await tx.profileModule.create({
          data: { profileId: adminProfile.id, moduleId: module.id, canAccess: true }
        })
      }

      return module
    })
  },

  /**
   * Añade un recurso y otorga permisos automáticos al Administrador
   */
  async createResource(moduleId: string, data: {
    name: string,
    type: ResourceType,
    url?: string,
    powerbiReportId?: string,
    powerbiWorkspaceId?: string
  }) {
    // Obtener companyId del módulo para buscar el perfil admin
    const module = await prisma.module.findUnique({ where: { id: moduleId } })
    
    return await prisma.$transaction(async (tx) => {
      const resource = await tx.resource.create({
        data: {
          moduleId,
          name: data.name,
          type: data.type,
          url: data.url,
          powerbiReportId: data.powerbiReportId,
          powerbiWorkspaceId: data.powerbiWorkspaceId,
          isActive: true
        }
      })

      if (module) {
        const adminProfile = await tx.profile.findFirst({
          where: { name: 'Administrador', companyId: module.companyId }
        })

        if (adminProfile) {
          await tx.profileResource.create({
            data: { 
              profileId: adminProfile.id, 
              resourceId: resource.id, 
              canView: true, 
              canEdit: true, 
              canDelete: true 
            }
          })
        }
      }

      return resource
    })
  }
}
