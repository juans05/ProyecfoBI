"use server"

import { CompanyService, type CompanyData } from "./companies.service"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

/**
 * Action para crear una nueva empresa desde el panel Root
 */
export async function createCompanyAction(data: CompanyData) {
  try {
    console.log("🚀 [createCompanyAction] Iniciando creación de empresa:", data)
    
    const company = await CompanyService.createCompany(data)
    
    console.log("✅ [createCompanyAction] Empresa creada en DB:", company.id)
    
    // Forzar la actualización de la lista de empresas
    revalidatePath("/dashboard/root/companies")
    
    return { success: true, id: company.id }
  } catch (error: any) {
    console.error("❌ [createCompanyAction] Error fatal:", error)
    return { success: false, error: error.message || "Error desconocido" }
  }
}

/**
 * Action para actualizar una empresa existente
 */
export async function updateCompanyAction(id: string, data: Partial<CompanyData>) {
  try {
    await CompanyService.updateCompany(id, data)
    revalidatePath("/dashboard/root/companies")
    revalidatePath(`/dashboard/root/companies/${id}`)
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
