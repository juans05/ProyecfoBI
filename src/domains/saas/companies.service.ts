import { prisma } from "@/lib/prisma"

export interface CompanyData {
  name: string
  taxId?: string
  isActive?: boolean
  allowRootAccess?: boolean
}

export const CompanyService = {
  /**
   * Obtiene todas las empresas
   */
  async getAllCompanies() {
    return await prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { users: true, branches: true }
        }
      }
    })
  },

  /**
   * Crea una nueva empresa con su equipamiento básico de administración por defecto
   */
  async createCompany(data: CompanyData) {
    return await prisma.$transaction(async (tx) => {
      // 1. Crear la Empresa
      const company = await tx.company.create({
        data: {
          name: data.name,
          taxId: data.taxId,
          isActive: data.isActive ?? true,
          allowRootAccess: data.allowRootAccess ?? false
        }
      })

      // 2. Crear Módulo de Administración por defecto
      const adminModule = await tx.module.create({
        data: {
          companyId: company.id,
          name: "Administración",
          icon: "Settings",
          order: 99, // Siempre al final por defecto
        }
      })

      // 3. Crear Recursos base (Usuarios, Perfiles, Módulos)
      const resourcesData = [
        { name: "Usuarios", url: "/dashboard/admin/users", order: 1 },
        { name: "Perfiles", url: "/dashboard/admin/profiles", order: 2 },
        { name: "Módulos y Recursos", url: "/dashboard/admin/modules", order: 3 },
      ]

      const resources = await Promise.all(
        resourcesData.map(res => 
          tx.resource.create({
            data: {
              moduleId: adminModule.id,
              name: res.name,
              type: 'PAGE',
              url: res.url,
              order: res.order
            }
          })
        )
      )

      // 4. Crear Perfil de "Administrador" Maestro de la Empresa
      const adminProfile = await tx.profile.create({
        data: {
          companyId: company.id,
          name: "Administrador",
          description: "Acceso total a la gestión de la empresa",
        }
      })

      // 5. Vincular Perfil con los nuevos recursos (Permisos Full)
      await Promise.all(
        resources.map(res => 
          tx.profileResource.create({
            data: {
              profileId: adminProfile.id,
              resourceId: res.id,
              canView: true,
              canEdit: true,
              canDelete: true
            }
          })
        )
      )

      return company
    })
  },

  /**
   * Actualiza una empresa
   */
  async updateCompany(id: string, data: Partial<CompanyData>) {
    return await prisma.company.update({
      where: { id },
      data
    })
  },

  /**
   * Obtiene una empresa por ID
   */
  async getCompanyById(id: string) {
    return await prisma.company.findUnique({
      where: { id }
    })
  }
}
