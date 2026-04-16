/**
 * Tests de Integración: domains/permissions/permissions.guard.ts
 * Cubre: requireAuth, requireResourceAccess, requireModuleAccess, isAdmin
 *
 * CRÍTICO: Este es el punto de control de seguridad central de la plataforma.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prismaMock } from '../__mocks__/prisma'

import '../__mocks__/prisma'
import { auth } from '@/auth'
import {
  requireAuth,
  requireResourceAccess,
  requireModuleAccess,
  isAdmin,
} from '@/domains/permissions/permissions.guard'

const mockAuth = auth as ReturnType<typeof vi.fn>

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const USER_ID = 'user-abc-123'
const PROFILE_ID = 'profile-xyz-456'
const RESOURCE_ID = 'resource-res-789'
const MODULE_ID = 'module-mod-321'
const BRANCH_A = 'branch-a-111'
const BRANCH_B = 'branch-b-222'

const mockSession = {
  user: {
    id: USER_ID,
    email: 'test@empresa.com',
    name: 'Test User',
    isRoot: false,
    companyId: 'company-1',
    profiles: ['Editor'],
  },
  expires: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
}

// ─── requireAuth ──────────────────────────────────────────────────────────────

describe('requireAuth', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna session cuando el usuario tiene sesión válida', async () => {
    mockAuth.mockResolvedValue(mockSession)

    const result = await requireAuth()

    expect(result.error).toBeNull()
    expect(result.session?.user?.id).toBe(USER_ID)
  })

  it('retorna error 401 cuando no hay sesión', async () => {
    mockAuth.mockResolvedValue(null)

    const result = await requireAuth()

    expect(result.session).toBeNull()
    expect(result.error).toBeDefined()
  })

  it('retorna error 401 cuando sesión no tiene user.id', async () => {
    mockAuth.mockResolvedValue({ user: {}, expires: '' })

    const result = await requireAuth()

    expect(result.session).toBeNull()
    expect(result.error).toBeDefined()
  })

  it('retorna error 401 cuando sesión está vencida (auth() retorna null)', async () => {
    mockAuth.mockResolvedValue(null)

    const { session, error } = await requireAuth()

    expect(session).toBeNull()
    expect(error).not.toBeNull()
  })
})

// ─── requireResourceAccess ────────────────────────────────────────────────────

describe('requireResourceAccess', () => {
  beforeEach(() => vi.clearAllMocks())

  const userProfilesResponse = [{ profileId: PROFILE_ID }]
  const profileResourceWithAccess = {
    profileId: PROFILE_ID,
    resourceId: RESOURCE_ID,
    canView: true,
    canEdit: false,
    canDelete: false,
  }

  it('retorna true cuando el usuario tiene canView en el recurso', async () => {
    prismaMock.userProfile.findMany.mockResolvedValue(userProfilesResponse)
    prismaMock.resource.findUnique.mockResolvedValue({ branchId: null })
    prismaMock.profileResource.findFirst.mockResolvedValue(profileResourceWithAccess)

    const result = await requireResourceAccess(USER_ID, RESOURCE_ID)
    expect(result).toBe(true)
  })

  it('retorna false cuando el usuario NO tiene permiso en el recurso', async () => {
    prismaMock.userProfile.findMany.mockResolvedValue(userProfilesResponse)
    prismaMock.resource.findUnique.mockResolvedValue({ branchId: null })
    prismaMock.profileResource.findFirst.mockResolvedValue(null)

    const result = await requireResourceAccess(USER_ID, RESOURCE_ID)
    expect(result).toBe(false)
  })

  it('verifica canEdit correctamente', async () => {
    prismaMock.userProfile.findMany.mockResolvedValue(userProfilesResponse)
    prismaMock.resource.findUnique.mockResolvedValue({ branchId: null })
    prismaMock.profileResource.findFirst.mockResolvedValue({
      ...profileResourceWithAccess,
      canEdit: true,
    })

    const result = await requireResourceAccess(USER_ID, RESOURCE_ID, undefined, 'canEdit')
    expect(result).toBe(true)
  })

  it('verifica canDelete correctamente', async () => {
    prismaMock.userProfile.findMany.mockResolvedValue(userProfilesResponse)
    prismaMock.resource.findUnique.mockResolvedValue({ branchId: null })
    prismaMock.profileResource.findFirst.mockResolvedValue(null) // sin canDelete

    const result = await requireResourceAccess(USER_ID, RESOURCE_ID, undefined, 'canDelete')
    expect(result).toBe(false)
  })

  it('retorna false si recurso pertenece a sucursal diferente a la activa', async () => {
    prismaMock.userProfile.findMany.mockResolvedValue(userProfilesResponse)
    prismaMock.resource.findUnique.mockResolvedValue({ branchId: BRANCH_A })
    // El usuario tiene activa la sucursal B, pero el recurso es de A
    prismaMock.profileResource.findFirst.mockResolvedValue(profileResourceWithAccess)

    const result = await requireResourceAccess(USER_ID, RESOURCE_ID, BRANCH_B)
    expect(result).toBe(false)
  })

  it('permite acceso si recurso está en sucursal activa correcta', async () => {
    prismaMock.userProfile.findMany.mockResolvedValue(userProfilesResponse)
    prismaMock.resource.findUnique.mockResolvedValue({ branchId: BRANCH_A })
    prismaMock.profileResource.findFirst.mockResolvedValue(profileResourceWithAccess)

    const result = await requireResourceAccess(USER_ID, RESOURCE_ID, BRANCH_A)
    expect(result).toBe(true)
  })

  it('permite acceso si recurso no tiene sucursal asignada (GLOBAL)', async () => {
    prismaMock.userProfile.findMany.mockResolvedValue(userProfilesResponse)
    prismaMock.resource.findUnique.mockResolvedValue({ branchId: null })
    prismaMock.profileResource.findFirst.mockResolvedValue(profileResourceWithAccess)

    const result = await requireResourceAccess(USER_ID, RESOURCE_ID, BRANCH_A)
    expect(result).toBe(true)
  })

  it('retorna false si el usuario no tiene perfiles asignados', async () => {
    prismaMock.userProfile.findMany.mockResolvedValue([]) // sin perfiles
    prismaMock.resource.findUnique.mockResolvedValue({ branchId: null })
    prismaMock.profileResource.findFirst.mockResolvedValue(null)

    const result = await requireResourceAccess(USER_ID, RESOURCE_ID)
    expect(result).toBe(false)
  })

  it('usuario con múltiples perfiles: acceso si CUALQUIER perfil tiene permiso', async () => {
    const twoProfiles = [{ profileId: 'p1' }, { profileId: 'p2' }]
    prismaMock.userProfile.findMany.mockResolvedValue(twoProfiles)
    prismaMock.resource.findUnique.mockResolvedValue({ branchId: null })
    // Solo el perfil p2 tiene acceso
    prismaMock.profileResource.findFirst.mockResolvedValue({ ...profileResourceWithAccess, profileId: 'p2' })

    const result = await requireResourceAccess(USER_ID, RESOURCE_ID)
    expect(result).toBe(true)
  })
})

// ─── requireModuleAccess ──────────────────────────────────────────────────────

describe('requireModuleAccess', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna true cuando el usuario tiene acceso al módulo', async () => {
    prismaMock.userProfile.findMany.mockResolvedValue([{ profileId: PROFILE_ID }])
    prismaMock.profileModule.findFirst.mockResolvedValue({
      profileId: PROFILE_ID,
      moduleId: MODULE_ID,
      canAccess: true,
    })

    const result = await requireModuleAccess(USER_ID, MODULE_ID)
    expect(result).toBe(true)
  })

  it('retorna false cuando el usuario NO tiene acceso al módulo', async () => {
    prismaMock.userProfile.findMany.mockResolvedValue([{ profileId: PROFILE_ID }])
    prismaMock.profileModule.findFirst.mockResolvedValue(null)

    const result = await requireModuleAccess(USER_ID, MODULE_ID)
    expect(result).toBe(false)
  })

  it('retorna false con usuario sin perfiles', async () => {
    prismaMock.userProfile.findMany.mockResolvedValue([])
    prismaMock.profileModule.findFirst.mockResolvedValue(null)

    const result = await requireModuleAccess(USER_ID, MODULE_ID)
    expect(result).toBe(false)
  })
})

// ─── isAdmin ──────────────────────────────────────────────────────────────────

describe('isAdmin', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna true si el usuario tiene el perfil Administrador', async () => {
    const adminProfile = { id: 'admin-profile-id', name: 'Administrador' }
    prismaMock.profile.findUnique.mockResolvedValue(adminProfile)
    prismaMock.userProfile.findFirst.mockResolvedValue({
      userId: USER_ID,
      profileId: adminProfile.id,
    })

    const result = await isAdmin(USER_ID)
    expect(result).toBe(true)
  })

  it('retorna false si el usuario NO tiene perfil Administrador', async () => {
    const adminProfile = { id: 'admin-profile-id', name: 'Administrador' }
    prismaMock.profile.findUnique.mockResolvedValue(adminProfile)
    prismaMock.userProfile.findFirst.mockResolvedValue(null)

    const result = await isAdmin(USER_ID)
    expect(result).toBe(false)
  })

  it('retorna false si el perfil Administrador no existe en BD', async () => {
    prismaMock.profile.findUnique.mockResolvedValue(null)

    const result = await isAdmin(USER_ID)
    expect(result).toBe(false)
  })

  it('consulta profile con nombre exacto "Administrador"', async () => {
    prismaMock.profile.findUnique.mockResolvedValue(null)

    await isAdmin(USER_ID)

    expect(prismaMock.profile.findUnique).toHaveBeenCalledWith({
      where: { name: 'Administrador' },
    })
  })
})

// ─── Tests de Seguridad: Aislamiento Multi-tenant ───────────────────────────

describe('Aislamiento Multi-tenant (Seguridad Crítica)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('usuario empresa A no puede acceder a recurso de empresa B', async () => {
    // El usuario solo tiene perfiles de empresa A
    prismaMock.userProfile.findMany.mockResolvedValue([{ profileId: 'profile-empresa-A' }])
    // El recurso pertenece a empresa B (no hay profileResource que conecte ambos)
    prismaMock.resource.findUnique.mockResolvedValue({ branchId: null })
    prismaMock.profileResource.findFirst.mockResolvedValue(null) // Sin acceso cruzado

    const result = await requireResourceAccess(
      'user-empresa-A',
      'resource-empresa-B',
    )

    expect(result).toBe(false)
  })

  it('verifica que se usan los profileIds del usuario, no parámetros externos', async () => {
    prismaMock.userProfile.findMany.mockResolvedValue([{ profileId: PROFILE_ID }])
    prismaMock.resource.findUnique.mockResolvedValue({ branchId: null })
    prismaMock.profileResource.findFirst.mockResolvedValue(null)

    await requireResourceAccess(USER_ID, RESOURCE_ID)

    // Verifica que el findMany se llama con el userId correcto
    expect(prismaMock.userProfile.findMany).toHaveBeenCalledWith({
      where: { userId: USER_ID },
      select: { profileId: true },
    })
  })
})
