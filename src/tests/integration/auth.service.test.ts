/**
 * Tests de Integración: domains/auth/auth.service.ts
 * Usa mock de Prisma para simular respuestas de BD.
 * Cubre: verifyCredentials, requestPasswordReset, resetPassword, changePassword
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'
import { prismaMock } from '../__mocks__/prisma'

// Aplicar mock de Prisma antes de importar el servicio
import '../__mocks__/prisma'
import { AuthService } from '@/domains/auth/auth.service'
import { sendPasswordResetEmail } from '@/lib/email'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function createPasswordHash(plain: string) {
  return bcrypt.hash(plain, 10)
}

const mockCompany = {
  id: 'company-1',
  name: 'Empresa Test',
  isActive: true,
}

const mockUser = {
  id: 'user-1',
  email: 'juan@empresa.com',
  firstName: 'Juan',
  lastName: 'Saavedra',
  passwordHash: '',
  isActive: true,
  isRoot: false,
  companyId: 'company-1',
  company: mockCompany,
  profiles: [{ profile: { id: 'p1', name: 'Administrador' } }],
}

// ─── verifyCredentials ────────────────────────────────────────────────────────

describe('AuthService.verifyCredentials', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockUser.passwordHash = await createPasswordHash('Password123')
  })

  it('retorna datos del usuario con credenciales válidas', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser)

    const result = await AuthService.verifyCredentials('juan@empresa.com', 'Password123')

    expect(result).not.toBeNull()
    expect(result?.id).toBe('user-1')
    expect(result?.email).toBe('juan@empresa.com')
    expect(result?.companyId).toBe('company-1')
    expect(result?.profiles).toContain('Administrador')
  })

  it('retorna null si el usuario no existe en BD', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)

    const result = await AuthService.verifyCredentials('noexiste@test.com', 'cualquier')
    expect(result).toBeNull()
  })

  it('retorna null si el usuario está inactivo', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false })

    const result = await AuthService.verifyCredentials('juan@empresa.com', 'Password123')
    expect(result).toBeNull()
  })

  it('retorna null si la empresa del usuario está inactiva', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...mockUser,
      company: { ...mockCompany, isActive: false },
    })

    const result = await AuthService.verifyCredentials('juan@empresa.com', 'Password123')
    expect(result).toBeNull()
  })

  it('retorna null si la contraseña es incorrecta', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser)

    const result = await AuthService.verifyCredentials('juan@empresa.com', 'WrongPassword')
    expect(result).toBeNull()
  })

  it('usuario root (isRoot=true, companyId=null) puede autenticarse sin empresa', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...mockUser,
      isRoot: true,
      companyId: null,
      company: null,
    })

    const result = await AuthService.verifyCredentials('juan@empresa.com', 'Password123')
    expect(result).not.toBeNull()
    expect(result?.isRoot).toBe(true)
    expect(result?.companyId).toBeNull()
  })

  it('expone nombre completo como name', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser)

    const result = await AuthService.verifyCredentials('juan@empresa.com', 'Password123')
    expect(result?.name).toBe('Juan Saavedra')
  })

  it('no expone passwordHash en la respuesta', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser)

    const result = await AuthService.verifyCredentials('juan@empresa.com', 'Password123')
    expect(result).not.toHaveProperty('passwordHash')
    expect(result).not.toHaveProperty('password')
  })
})

// ─── requestPasswordReset ─────────────────────────────────────────────────────

describe('AuthService.requestPasswordReset', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.passwordResetToken.deleteMany.mockResolvedValue({ count: 0 })
    prismaMock.passwordResetToken.create.mockResolvedValue({})
  })

  it('elimina tokens previos e crea uno nuevo para usuario activo', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...mockUser, isActive: true })

    await AuthService.requestPasswordReset('juan@empresa.com')

    expect(prismaMock.passwordResetToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    })
    expect(prismaMock.passwordResetToken.create).toHaveBeenCalledOnce()
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      'juan@empresa.com',
      expect.any(String), // rawToken
      'Juan'
    )
  })

  it('almacena el hash del token, NO el token en crudo', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...mockUser, isActive: true })

    await AuthService.requestPasswordReset('juan@empresa.com')

    const createCall = prismaMock.passwordResetToken.create.mock.calls[0][0]
    const sentToEmail = (sendPasswordResetEmail as any).mock.calls[0][1]

    // El token guardado en BD (tokenHash) debe ser diferente al token enviado por email
    expect(createCall.data.tokenHash).not.toBe(sentToEmail)
    expect(createCall.data.tokenHash).toHaveLength(64) // SHA-256 hex
  })

  it('NO hace nada si el email no existe (falla silenciosa)', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)

    await expect(AuthService.requestPasswordReset('noexiste@test.com')).resolves.toBeUndefined()

    expect(prismaMock.passwordResetToken.create).not.toHaveBeenCalled()
    expect(sendPasswordResetEmail).not.toHaveBeenCalled()
  })

  it('NO hace nada si el usuario está inactivo (falla silenciosa)', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false })

    await AuthService.requestPasswordReset('juan@empresa.com')

    expect(prismaMock.passwordResetToken.create).not.toHaveBeenCalled()
  })

  it('el token creado expira en aproximadamente 1 hora', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...mockUser, isActive: true })

    const before = Date.now()
    await AuthService.requestPasswordReset('juan@empresa.com')
    const after = Date.now()

    const createCall = prismaMock.passwordResetToken.create.mock.calls[0][0]
    const expiresAt: Date = createCall.data.expiresAt

    const oneHourMs = 60 * 60 * 1000
    expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + oneHourMs)
    expect(expiresAt.getTime()).toBeLessThanOrEqual(after + oneHourMs + 1000)
  })
})

// ─── resetPassword ────────────────────────────────────────────────────────────

describe('AuthService.resetPassword', () => {
  const validToken = 'raw-token-valido-64chars'
  const mockResetToken = {
    id: 'rt-1',
    userId: 'user-1',
    tokenHash: 'hash-de-prueba',
    expiresAt: new Date(Date.now() + 60000),
    usedAt: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.$transaction.mockImplementation((ops: unknown[]) => Promise.all(ops))
    prismaMock.user.update.mockResolvedValue(mockUser)
    prismaMock.passwordResetToken.update.mockResolvedValue({ ...mockResetToken, usedAt: new Date() })
  })

  it('actualiza la contraseña con token válido', async () => {
    prismaMock.passwordResetToken.findFirst.mockResolvedValue(mockResetToken)

    await AuthService.resetPassword(validToken, 'NewPassword1')

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: expect.objectContaining({ passwordHash: expect.any(String) }),
      })
    )
  })

  it('marca el token como usado después del reset', async () => {
    prismaMock.passwordResetToken.findFirst.mockResolvedValue(mockResetToken)

    await AuthService.resetPassword(validToken, 'NewPassword1')

    expect(prismaMock.passwordResetToken.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'rt-1' },
        data: expect.objectContaining({ usedAt: expect.any(Date) }),
      })
    )
  })

  it('lanza error si token no existe en BD', async () => {
    prismaMock.passwordResetToken.findFirst.mockResolvedValue(null)

    await expect(AuthService.resetPassword('token-invalido', 'NewPassword1')).rejects.toThrow(
      'Token inválido o expirado'
    )
  })

  it('no almacena la contraseña en texto plano', async () => {
    prismaMock.passwordResetToken.findFirst.mockResolvedValue(mockResetToken)

    await AuthService.resetPassword(validToken, 'NewPassword1')

    const updateCall = prismaMock.user.update.mock.calls[0][0]
    const storedHash = updateCall.data.passwordHash

    // El hash almacenado no debe ser igual a la contraseña original
    expect(storedHash).not.toBe('NewPassword1')
    // Debe ser un hash bcrypt (empieza con $2b$ o $2a$)
    expect(storedHash).toMatch(/^\$2[ab]\$/)
  })

  it('busca token por hash (no por valor crudo)', async () => {
    prismaMock.passwordResetToken.findFirst.mockResolvedValue(mockResetToken)

    await AuthService.resetPassword(validToken, 'NewPassword1')

    const findCall = prismaMock.passwordResetToken.findFirst.mock.calls[0][0]
    // El where debe incluir tokenHash (hash del token), no el token crudo
    expect(findCall.where.tokenHash).toBeDefined()
    expect(findCall.where.tokenHash).not.toBe(validToken)
  })
})

// ─── changePassword ───────────────────────────────────────────────────────────

describe('AuthService.changePassword', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockUser.passwordHash = await createPasswordHash('OldPassword1')
    prismaMock.user.update.mockResolvedValue(mockUser)
  })

  it('cambia la contraseña con credenciales correctas', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser)

    await expect(
      AuthService.changePassword('user-1', 'OldPassword1', 'NewPassword2')
    ).resolves.toBeUndefined()

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: expect.objectContaining({ passwordHash: expect.any(String) }),
      })
    )
  })

  it('lanza error si el usuario no existe', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)

    await expect(
      AuthService.changePassword('no-existe', 'OldPassword1', 'NewPassword2')
    ).rejects.toThrow('Usuario no encontrado')
  })

  it('lanza error si la contraseña actual es incorrecta', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser)

    await expect(
      AuthService.changePassword('user-1', 'WrongPassword', 'NewPassword2')
    ).rejects.toThrow('Contraseña actual incorrecta')
  })

  it('el nuevo hash de contraseña es diferente al anterior', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser)
    const oldHash = mockUser.passwordHash

    await AuthService.changePassword('user-1', 'OldPassword1', 'NewPassword2')

    const updateCall = prismaMock.user.update.mock.calls[0][0]
    expect(updateCall.data.passwordHash).not.toBe(oldHash)
  })
})
