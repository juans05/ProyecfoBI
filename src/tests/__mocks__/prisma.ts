/**
 * Mock de Prisma Client para tests unitarios e de integración.
 * Reemplaza todas las operaciones de BD con vi.fn() controlables por test.
 */
import { vi } from 'vitest'

export const prismaMock = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  userProfile: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    deleteMany: vi.fn(),
  },
  profile: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  },
  profileResource: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
  profileModule: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
  resource: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
  passwordResetToken: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
  $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
}

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))
