import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const ProfileSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, 'Nombre muy corto'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
})

export type ProfileInput = z.infer<typeof ProfileSchema>

export async function getProfiles() {
  return await prisma.profile.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })
}
