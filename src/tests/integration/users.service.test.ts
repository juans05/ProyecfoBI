/**
 * Tests de Integración: domains/users/users.service.ts
 * Cubre: getUsers, createUser, updateUser, toggleUserStatus
 *
 * IMPORTANTE: Estos son Server Actions de Next.js.
 * next/cache (revalidatePath) está mockeado en setup.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prismaMock } from '../__mocks__/prisma'

import '../__mocks__/prisma'
import {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
} from '@/domains/users/users.service'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const COMPANY_ID = 'company-test-001'
const OTHER_COMPANY_ID = 'company-other-999'
const PROFILE_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const USER_UUID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'

const baseUserData = {
  email: 'nuevo@empresa.com',
  firstName: 'Maria',
  lastName: 'Lopez',
  password: 'Password1',
  isActive: true,
  profileIds: [PROFILE_UUID],
  companyId: COMPANY_ID,
}

const mockCreatedUser = {
  id: USER_UUID,
  email: 'nuevo@empresa.com',
  firstName: 'Maria',
  lastName: 'Lopez',
  passwordHash: '$2b$12$hashedpassword',
  isActive: true,
  isRoot: false,
  companyId: COMPANY_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const EXISTING_USER_UUID = 'f1e2d3c4-b5a6-7890-fedc-ba9876543210'

const mockExistingUser = {
  ...mockCreatedUser,
  id: EXISTING_USER_UUID,
  companyId: COMPANY_ID,
}

// ─── getUsers ─────────────────────────────────────────────────────────────────

describe('getUsers', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna usuarios de la empresa solicitada', async () => {
    const users = [mockExistingUser]
    prismaMock.user.findMany.mockResolvedValue(users)

    const result = await getUsers(COMPANY_ID)

    expect(result).toEqual(users)
    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { companyId: COMPANY_ID },
      })
    )
  })

  it('filtra SOLO por companyId (aislamiento multi-tenant)', async () => {
    prismaMock.user.findMany.mockResolvedValue([])

    await getUsers(COMPANY_ID)

    const callArgs = prismaMock.user.findMany.mock.calls[0][0]
    // El where solo debe tener companyId
    expect(callArgs.where).toEqual({ companyId: COMPANY_ID })
  })

  it('retorna lista vacía si la empresa no tiene usuarios', async () => {
    prismaMock.user.findMany.mockResolvedValue([])

    const result = await getUsers('empresa-sin-usuarios')
    expect(result).toEqual([])
  })

  it('incluye los perfiles de cada usuario', async () => {
    prismaMock.user.findMany.mockResolvedValue([mockExistingUser])

    await getUsers(COMPANY_ID)

    const callArgs = prismaMock.user.findMany.mock.calls[0][0]
    expect(callArgs.include).toBeDefined()
    expect(callArgs.include.profiles).toBeDefined()
  })
})

// ─── createUser ───────────────────────────────────────────────────────────────

describe('createUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.user.create.mockResolvedValue(mockCreatedUser)
  })

  it('crea un usuario exitosamente con datos válidos', async () => {
    const result = await createUser(baseUserData)
    expect(result).toEqual(mockCreatedUser)
    expect(prismaMock.user.create).toHaveBeenCalledOnce()
  })

  it('NO almacena la contraseña en texto plano (debe hashearla)', async () => {
    await createUser(baseUserData)

    const createCall = prismaMock.user.create.mock.calls[0][0]
    const storedHash = createCall.data.passwordHash

    expect(storedHash).toBeDefined()
    expect(storedHash).not.toBe('Password1')
    expect(storedHash).toMatch(/^\$2[ab]\$/) // formato bcrypt
  })

  it('asigna el companyId correcto al crear el usuario', async () => {
    await createUser(baseUserData)

    const createCall = prismaMock.user.create.mock.calls[0][0]
    expect(createCall.data.companyId).toBe(COMPANY_ID)
  })

  it('crea la relación de perfiles junto con el usuario', async () => {
    await createUser(baseUserData)

    const createCall = prismaMock.user.create.mock.calls[0][0]
    expect(createCall.data.profiles).toBeDefined()
    expect(createCall.data.profiles.create).toHaveLength(1)
    expect(createCall.data.profiles.create[0].profileId).toBe(PROFILE_UUID)
  })

  it('lanza error si password no se proporciona', async () => {
    const { password, ...dataWithoutPassword } = baseUserData

    await expect(createUser(dataWithoutPassword as any)).rejects.toThrow(
      'La contraseña es obligatoria para nuevos usuarios'
    )
  })

  it('lanza error Zod con email inválido', async () => {
    await expect(
      createUser({ ...baseUserData, email: 'no-es-email' })
    ).rejects.toThrow()
  })

  it('lanza error Zod con firstName muy corto', async () => {
    await expect(
      createUser({ ...baseUserData, firstName: 'M' })
    ).rejects.toThrow()
  })

  it('lanza error Zod si profileIds está vacío', async () => {
    await expect(
      createUser({ ...baseUserData, profileIds: [] })
    ).rejects.toThrow()
  })
})

// ─── updateUser ───────────────────────────────────────────────────────────────

describe('updateUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.user.findFirst.mockResolvedValue(mockExistingUser)
    prismaMock.user.update.mockResolvedValue(mockExistingUser)
  })

  it('actualiza usuario existente en la empresa', async () => {
    await updateUser({
      id: EXISTING_USER_UUID,
      email: 'actualizado@empresa.com',
      firstName: 'Maria',
      lastName: 'Garcia',
      isActive: true,
      profileIds: [PROFILE_UUID],
      companyId: COMPANY_ID,
    })

    expect(prismaMock.user.update).toHaveBeenCalledOnce()
  })

  it('verifica que el usuario pertenece a la empresa antes de actualizar', async () => {
    await updateUser({
      id: EXISTING_USER_UUID,
      email: 'x@x.com',
      firstName: 'Ana',
      lastName: 'Perez',
      isActive: true,
      profileIds: [PROFILE_UUID],
      companyId: COMPANY_ID,
    })

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { id: EXISTING_USER_UUID, companyId: COMPANY_ID },
    })
  })

  it('lanza error si usuario no pertenece a la empresa (protección multi-tenant)', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null) // usuario no encontrado en esa empresa

    const otroEmpresaUUID = 'aaaabbbb-cccc-dddd-eeee-ffffffffffff'
    await expect(
      updateUser({
        id: otroEmpresaUUID,
        email: 'x@x.com',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        profileIds: [PROFILE_UUID],
        companyId: COMPANY_ID,
      })
    ).rejects.toThrow('Usuario no encontrado o acceso denegado')
  })

  it('NO actualiza el password si no se proporciona', async () => {
    await updateUser({
      id: EXISTING_USER_UUID,
      email: 'x@x.com',
      firstName: 'Ana',
      lastName: 'Garcia',
      isActive: true,
      profileIds: [PROFILE_UUID],
      companyId: COMPANY_ID,
    })

    const updateCall = prismaMock.user.update.mock.calls[0][0]
    expect(updateCall.data.passwordHash).toBeUndefined()
  })

  it('hashea el password si se proporciona en la actualización', async () => {
    await updateUser({
      id: EXISTING_USER_UUID,
      email: 'x@x.com',
      firstName: 'Ana',
      lastName: 'Garcia',
      isActive: true,
      password: 'NewPass123',
      profileIds: [PROFILE_UUID],
      companyId: COMPANY_ID,
    })

    const updateCall = prismaMock.user.update.mock.calls[0][0]
    expect(updateCall.data.passwordHash).toBeDefined()
    expect(updateCall.data.passwordHash).not.toBe('NewPass123')
    expect(updateCall.data.passwordHash).toMatch(/^\$2[ab]\$/)
  })

  it('reemplaza todos los perfiles del usuario al actualizar', async () => {
    const newProfileId = 'c3d4e5f6-a7b8-9012-cdef-123456789012'

    await updateUser({
      id: EXISTING_USER_UUID,
      email: 'x@x.com',
      firstName: 'Ana',
      lastName: 'Garcia',
      isActive: true,
      profileIds: [newProfileId],
      companyId: COMPANY_ID,
    })

    const updateCall = prismaMock.user.update.mock.calls[0][0]
    // Debe borrar perfiles actuales y crear los nuevos
    expect(updateCall.data.profiles.deleteMany).toBeDefined()
    expect(updateCall.data.profiles.create).toHaveLength(1)
    expect(updateCall.data.profiles.create[0].profileId).toBe(newProfileId)
  })
})

// ─── toggleUserStatus ─────────────────────────────────────────────────────────

describe('toggleUserStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.user.update.mockResolvedValue({})
  })

  it('desactiva un usuario activo', async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: 'user-1', isActive: true, companyId: COMPANY_ID })

    await toggleUserStatus({ id: 'user-1', isActive: true }, COMPANY_ID)

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { isActive: false },
    })
  })

  it('activa un usuario inactivo', async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: 'user-1', isActive: false, companyId: COMPANY_ID })

    await toggleUserStatus({ id: 'user-1', isActive: false }, COMPANY_ID)

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { isActive: true },
    })
  })

  it('NO hace nada si el usuario no pertenece a la empresa', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null) // no encontrado en esa empresa

    await toggleUserStatus({ id: 'user-otra-empresa', isActive: true }, COMPANY_ID)

    expect(prismaMock.user.update).not.toHaveBeenCalled()
  })

  it('verifica pertenencia a empresa antes de toggle (protección multi-tenant)', async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: 'user-1', companyId: COMPANY_ID })

    await toggleUserStatus({ id: 'user-1', isActive: true }, COMPANY_ID)

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { id: 'user-1', companyId: COMPANY_ID },
    })
  })
})
