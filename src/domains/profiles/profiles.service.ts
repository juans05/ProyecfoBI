"use server"

import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const ProfileSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, 'Nombre muy corto'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
})

type ProfileInput = z.infer<typeof ProfileSchema>

export async function getProfiles() {
  return await prisma.profile.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })
}

export async function createProfile(data: ProfileInput & { companyId: string }) {
  try {
    const parsed = ProfileSchema.parse(data)
    
    const profile = await prisma.profile.create({
      data: {
        name: parsed.name,
        description: parsed.description,
        isActive: parsed.isActive,
        companyId: data.companyId,
      }
    })

    revalidatePath('/dashboard/admin/profiles')
    return profile
  } catch (error: any) {
    console.error("🔴 PROFILE CREATION ERROR:", error)
    if (error.code === 'P2002') {
      throw new Error("Ya existe un perfil con ese nombre en esta empresa.")
    }
    throw new Error(error.message || "Error interno al crear perfil.")
  }
}

export async function deleteProfile(id: string, companyId: string) {
  const profile = await prisma.profile.findFirst({
    where: { id, companyId }
  })

  if (!profile) throw new Error('Perfil no encontrado')

  await prisma.profile.delete({
    where: { id }
  })

  revalidatePath('/dashboard/admin/profiles')
  return { success: true }
}
