"use server"

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ResourceType } from '@prisma/client'

export async function getModulesWithResources() {
  return await prisma.module.findMany({
    include: {
      resources: true,
    },
    orderBy: { order: 'asc' }
  })
}

export async function createModule(data: any, companyId: string) {
  const mod = await prisma.module.create({
    data: {
      companyId,
      name: data.name,
      icon: data.icon || 'FileText',
      order: parseInt(data.order) || 0,
      isActive: true
    }
  })
  revalidatePath('/dashboard/admin/modules')
  revalidatePath('/dashboard') // Para el Sidebar
  return mod
}

export async function createResource(data: any, companyId: string) {
  const res = await prisma.resource.create({
    data: {
      moduleId: data.moduleId,
      name: data.name,
      type: data.type as ResourceType,
      url: data.url,
      powerbiReportId: data.powerbiReportId,
      order: parseInt(data.order) || 0,
    }
  })
  
  // Dar permiso automático al Administrador local para el nuevo recurso
  const adminProfile = await prisma.profile.findFirst({ 
    where: { name: 'Administrador', companyId } 
  })
  if (adminProfile) {
    await prisma.profileResource.create({
      data: {
        profileId: adminProfile.id,
        resourceId: res.id,
        canView: true,
        canEdit: true,
        canDelete: true
      }
    })
  }

  revalidatePath('/dashboard/admin/modules')
  revalidatePath('/dashboard')
  return res
}
