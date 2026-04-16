"use server"

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getProfilesWithStats(companyId: string) {
  if (!companyId) return []
  
  return await prisma.profile.findMany({
    where: { companyId },
    include: {
      _count: {
        select: { users: true }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export async function getPermissionsByProfile(profileId: string) {
  const modules = await prisma.module.findMany({
    include: {
      resources: true,
      profileModules: {
        where: { profileId }
      },
      profileResources: {
        where: { profileId }
      }
    },
    orderBy: { order: 'asc' }
  })
  
  return modules
}

export async function updatePermissions(profileId: string, permissions: any) {
  // Esta acción actualizará profileModules y profileResources de un perfil
  // Implementación simplificada para la demo
  const { moduleIds, resourcePermissions } = permissions
  
  // 1. Actualizar Módulos
  await prisma.profileModule.deleteMany({ where: { profileId } })
  await prisma.profileModule.createMany({
    data: moduleIds.map((moduleId: string) => ({
      profileId,
      moduleId,
      canAccess: true
    }))
  })

  // 2. Actualizar Recursos
  await prisma.profileResource.deleteMany({ where: { profileId } })
  await prisma.profileResource.createMany({
    data: resourcePermissions.map((rp: any) => ({
      profileId,
      resourceId: rp.resourceId,
      canView: rp.canView,
      canEdit: rp.canEdit,
      canDelete: rp.canDelete
    }))
  })

  revalidatePath('/dashboard/admin/profiles')
}
