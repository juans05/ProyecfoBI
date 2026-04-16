"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

/**
 * Cambia la sede activa del usuario
 */
export async function setActiveBranchAction(branchId: string) {
  const cookieStore = cookies()
  
  // Guardar ID de sede en cookie (expira en 30 días)
  cookieStore.set('activeBranchId', branchId, {
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })

  // Refrescar todas las rutas para aplicar el nuevo contexto
  revalidatePath('/dashboard')
  return { success: true }
}
