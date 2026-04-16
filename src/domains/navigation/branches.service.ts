import { prisma } from "@/lib/prisma"

/**
 * Obtiene todas las sedes activas
 */
export async function getBranches() {
  return await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })
}

/**
 * Obtiene las sedes asignadas a un usuario específico
 */
export async function getUserBranches(userId: string) {
  return await prisma.userBranch.findMany({
    where: { userId },
    include: { branch: true }
  })
}
