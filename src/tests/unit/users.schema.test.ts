/**
 * Tests Unitarios: domains/users/users.schema.ts
 * Cubre: UserSchema, UserUpdateSchema
 */

import { describe, it, expect } from 'vitest'
import { UserSchema, UserUpdateSchema } from '@/domains/users/users.schema'

const validProfileId = '550e8400-e29b-41d4-a716-446655440000'
const validUUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

// ─── UserSchema ───────────────────────────────────────────────────────────────

describe('UserSchema', () => {
  const validUser = {
    email: 'juan@empresa.com',
    firstName: 'Juan',
    lastName: 'Saavedra',
    password: 'Password1',
    isActive: true,
    profileIds: [validProfileId],
  }

  it('valida datos correctos', () => {
    const result = UserSchema.safeParse(validUser)
    expect(result.success).toBe(true)
  })

  it('isActive tiene default true si no se especifica', () => {
    const { isActive, ...rest } = validUser
    const result = UserSchema.safeParse(rest)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isActive).toBe(true)
    }
  })

  it('falla con email inválido', () => {
    const result = UserSchema.safeParse({ ...validUser, email: 'no-email' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('email')
  })

  it('falla con firstName menor a 2 caracteres', () => {
    const result = UserSchema.safeParse({ ...validUser, firstName: 'J' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('firstName')
  })

  it('falla con lastName menor a 2 caracteres', () => {
    const result = UserSchema.safeParse({ ...validUser, lastName: 'S' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('lastName')
  })

  it('falla con password menor a 8 caracteres cuando se proporciona', () => {
    const result = UserSchema.safeParse({ ...validUser, password: '123' })
    expect(result.success).toBe(false)
  })

  it('acepta password como opcional (undefined)', () => {
    const { password, ...rest } = validUser
    const result = UserSchema.safeParse(rest)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.password).toBeUndefined()
    }
  })

  it('falla con profileIds vacío (debe tener al menos uno)', () => {
    const result = UserSchema.safeParse({ ...validUser, profileIds: [] })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('profileIds')
  })

  it('falla con profileId que no es UUID', () => {
    const result = UserSchema.safeParse({ ...validUser, profileIds: ['no-es-uuid'] })
    expect(result.success).toBe(false)
  })

  it('acepta múltiples profileIds válidos', () => {
    const result = UserSchema.safeParse({
      ...validUser,
      profileIds: [validProfileId, validUUID],
    })
    expect(result.success).toBe(true)
  })

  it('acepta id como UUID opcional', () => {
    const result = UserSchema.safeParse({ ...validUser, id: validUUID })
    expect(result.success).toBe(true)
  })

  it('falla si id no es UUID cuando se proporciona', () => {
    const result = UserSchema.safeParse({ ...validUser, id: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })
})

// ─── UserUpdateSchema ─────────────────────────────────────────────────────────

describe('UserUpdateSchema', () => {
  it('requiere id como UUID obligatorio', () => {
    const result = UserUpdateSchema.safeParse({ email: 'x@x.com' })
    expect(result.success).toBe(false)
    expect(result.error?.issues.some(i => i.path.includes('id'))).toBe(true)
  })

  it('acepta solo id y campos parciales', () => {
    const result = UserUpdateSchema.safeParse({
      id: validUUID,
      email: 'nuevo@empresa.com',
    })
    expect(result.success).toBe(true)
  })

  it('falla con id que no es UUID', () => {
    const result = UserUpdateSchema.safeParse({ id: '123', email: 'x@x.com' })
    expect(result.success).toBe(false)
  })

  it('valida solo con id (todos los demás campos opcionales)', () => {
    const result = UserUpdateSchema.safeParse({ id: validUUID })
    expect(result.success).toBe(true)
  })
})
