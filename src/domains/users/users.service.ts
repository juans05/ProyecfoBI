"use server"

import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { UserSchema, UserUpdateSchema, type UserInput, type UserUpdateInput } from './users.schema'
import { revalidatePath } from 'next/cache'

export async function getUsers(companyId: string) {
  return await prisma.user.findMany({
    where: { companyId },
    include: {
      profiles: {
        include: {
          profile: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createUser(data: UserInput & { companyId: string }) {
  const parsed = UserSchema.parse(data)
  
  if (!parsed.password) {
    throw new Error('La contraseña es obligatoria para nuevos usuarios')
  }

  const passwordHash = await hash(parsed.password, 12)

  const user = await prisma.user.create({
    data: {
      email: parsed.email,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      passwordHash,
      isActive: parsed.isActive,
      companyId: data.companyId,
      profiles: {
        create: parsed.profileIds.map(profileId => ({
          profileId
        }))
      }
    }
  })

  revalidatePath('/dashboard/admin/users')
  return user
}

export async function updateUser(data: UserUpdateInput & { companyId: string }) {
  const parsed = UserUpdateSchema.parse(data)
  
  // Verificar que el usuario pertenezca a la empresa antes de actuar
  const existingUser = await prisma.user.findFirst({
    where: { id: parsed.id, companyId: data.companyId }
  })

  if (!existingUser) throw new Error('Usuario no encontrado o acceso denegado')

  const updateData: any = {
    email: parsed.email,
    firstName: parsed.firstName,
    lastName: parsed.lastName,
    isActive: parsed.isActive,
  }

  if (parsed.password) {
    updateData.passwordHash = await hash(parsed.password, 12)
  }

  // Si hay perfiles, actualizamos la relación
  if (parsed.profileIds) {
    updateData.profiles = {
      deleteMany: {}, // Borrar actuales
      create: parsed.profileIds.map(profileId => ({
        profileId
      }))
    }
  }

  const user = await prisma.user.update({
    where: { id: parsed.id },
    data: updateData
  })

  revalidatePath('/dashboard/admin/users')
  return user
}

export async function toggleUserStatus(user: { id: string, isActive: boolean }, companyId: string) {
  // Verificación de pertenencia
  const target = await prisma.user.findFirst({
    where: { id: user.id, companyId }
  })
  
  if (!target) return

  await prisma.user.update({
    where: { id: user.id },
    data: { isActive: !user.isActive }
  })
  revalidatePath('/dashboard/admin/users')
}
