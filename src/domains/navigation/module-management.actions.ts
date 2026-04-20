"use server"

import { auth } from "@/auth"
import { ModuleManagementService } from "./module-management.service"
import { revalidatePath } from "next/cache"
import { ResourceType } from "@prisma/client"

export async function createModuleAction(name: string, icon: string = "Package") {
  const session = await auth()
  const companyId = (session?.user as any)?.companyId

  if (!companyId) throw new Error("No autorizado")

  await ModuleManagementService.createModule(companyId, name, icon)
  
  revalidatePath("/dashboard/admin/modules")
  revalidatePath("/dashboard") // Para actualizar el menú lateral
}

export async function createResourceAction(moduleId: string, data: {
  name: string,
  type: ResourceType,
  url?: string,
  powerbiReportId?: string,
  powerbiWorkspaceId?: string
}) {
  const session = await auth()
  if (!session) throw new Error("No autorizado")

  // [MEJORA] Si no se provee Workspace ID, usar el de la empresa por defecto del .env
  const finalData = {
    ...data,
    powerbiWorkspaceId: data.type === ResourceType.POWERBI 
      ? (data.powerbiWorkspaceId || process.env.PBI_WORKSPACE_ID) 
      : undefined
  }

  await ModuleManagementService.createResource(moduleId, finalData)
  
  revalidatePath("/dashboard/admin/modules")
  revalidatePath("/dashboard") // Para actualizar el menú lateral
}

export async function deleteModuleAction(moduleId: string) {
  const session = await auth()
  const companyId = (session?.user as any)?.companyId

  if (!companyId) throw new Error("No autorizado")

  await ModuleManagementService.deleteModule(companyId, moduleId)
  
  revalidatePath("/dashboard/admin/modules")
  revalidatePath("/dashboard")
}

export async function deleteResourceAction(resourceId: string) {
  const session = await auth()
  if (!session) throw new Error("No autorizado")

  await ModuleManagementService.deleteResource(resourceId)
  
  revalidatePath("/dashboard/admin/modules")
  revalidatePath("/dashboard")
}
