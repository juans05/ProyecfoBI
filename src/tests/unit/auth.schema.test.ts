/**
 * Tests Unitarios: domains/auth/auth.schema.ts
 * Cubre: LoginSchema, ForgotPasswordSchema, ResetPasswordSchema, ChangePasswordSchema
 */

import { describe, it, expect } from 'vitest'
import {
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
} from '@/domains/auth/auth.schema'

// ─── LoginSchema ──────────────────────────────────────────────────────────────

describe('LoginSchema', () => {
  it('valida datos correctos', () => {
    const result = LoginSchema.safeParse({ email: 'user@empresa.com', password: 'secret123' })
    expect(result.success).toBe(true)
  })

  it('falla con email inválido', () => {
    const result = LoginSchema.safeParse({ email: 'no-es-email', password: 'secret' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('email')
  })

  it('falla con email vacío', () => {
    const result = LoginSchema.safeParse({ email: '', password: 'secret' })
    expect(result.success).toBe(false)
  })

  it('falla con password vacío', () => {
    const result = LoginSchema.safeParse({ email: 'user@test.com', password: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('password')
  })

  it('falla si falta el campo email', () => {
    const result = LoginSchema.safeParse({ password: 'secret123' })
    expect(result.success).toBe(false)
  })

  it('falla si falta el campo password', () => {
    const result = LoginSchema.safeParse({ email: 'user@test.com' })
    expect(result.success).toBe(false)
  })

  it('acepta emails con subdominios', () => {
    const result = LoginSchema.safeParse({ email: 'admin@mail.empresa.com.mx', password: 'pass' })
    expect(result.success).toBe(true)
  })

  it('falla con email que contiene solo @', () => {
    const result = LoginSchema.safeParse({ email: '@', password: 'pass' })
    expect(result.success).toBe(false)
  })
})

// ─── ForgotPasswordSchema ────────────────────────────────────────────────────

describe('ForgotPasswordSchema', () => {
  it('valida email correcto', () => {
    const result = ForgotPasswordSchema.safeParse({ email: 'user@test.com' })
    expect(result.success).toBe(true)
  })

  it('falla con email inválido', () => {
    const result = ForgotPasswordSchema.safeParse({ email: 'no-valido' })
    expect(result.success).toBe(false)
  })

  it('falla con campo vacío', () => {
    const result = ForgotPasswordSchema.safeParse({ email: '' })
    expect(result.success).toBe(false)
  })

  it('falla sin campo email', () => {
    const result = ForgotPasswordSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

// ─── ResetPasswordSchema ─────────────────────────────────────────────────────

describe('ResetPasswordSchema', () => {
  const validData = {
    token: 'token-valido-123',
    password: 'Secure123',
    confirmPassword: 'Secure123',
  }

  it('valida datos correctos', () => {
    const result = ResetPasswordSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('falla con password sin mayúscula', () => {
    const result = ResetPasswordSchema.safeParse({ ...validData, password: 'secure123', confirmPassword: 'secure123' })
    expect(result.success).toBe(false)
    const msgs = result.error?.issues.map(i => i.message) ?? []
    expect(msgs.some(m => m.toLowerCase().includes('mayúscula'))).toBe(true)
  })

  it('falla con password sin número', () => {
    const result = ResetPasswordSchema.safeParse({ ...validData, password: 'SecurePass', confirmPassword: 'SecurePass' })
    expect(result.success).toBe(false)
    const msgs = result.error?.issues.map(i => i.message) ?? []
    expect(msgs.some(m => m.toLowerCase().includes('número'))).toBe(true)
  })

  it('falla con password menor a 8 caracteres', () => {
    const result = ResetPasswordSchema.safeParse({ ...validData, password: 'Sec1', confirmPassword: 'Sec1' })
    expect(result.success).toBe(false)
    const msgs = result.error?.issues.map(i => i.message) ?? []
    expect(msgs.some(m => m.includes('8'))).toBe(true)
  })

  it('falla cuando password y confirmPassword no coinciden', () => {
    const result = ResetPasswordSchema.safeParse({ ...validData, confirmPassword: 'OtroPassword1' })
    expect(result.success).toBe(false)
    const issue = result.error?.issues.find(i => i.path.includes('confirmPassword'))
    expect(issue).toBeDefined()
    expect(issue?.message).toContain('no coinciden')
  })

  it('falla con token vacío', () => {
    const result = ResetPasswordSchema.safeParse({ ...validData, token: '' })
    expect(result.success).toBe(false)
  })

  it('acepta password exactamente de 8 caracteres con mayúscula y número', () => {
    const result = ResetPasswordSchema.safeParse({ ...validData, password: 'Secure12', confirmPassword: 'Secure12' })
    expect(result.success).toBe(true)
  })
})

// ─── ChangePasswordSchema ─────────────────────────────────────────────────────

describe('ChangePasswordSchema', () => {
  const validData = {
    currentPassword: 'OldPass123',
    newPassword: 'NewPass456',
    confirmNewPassword: 'NewPass456',
  }

  it('valida datos correctos', () => {
    const result = ChangePasswordSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('falla con currentPassword vacío', () => {
    const result = ChangePasswordSchema.safeParse({ ...validData, currentPassword: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('currentPassword')
  })

  it('falla con newPassword sin mayúscula', () => {
    const result = ChangePasswordSchema.safeParse({ ...validData, newPassword: 'newpass456', confirmNewPassword: 'newpass456' })
    expect(result.success).toBe(false)
  })

  it('falla con newPassword sin número', () => {
    const result = ChangePasswordSchema.safeParse({ ...validData, newPassword: 'NewPassword', confirmNewPassword: 'NewPassword' })
    expect(result.success).toBe(false)
  })

  it('falla cuando newPassword y confirmNewPassword no coinciden', () => {
    const result = ChangePasswordSchema.safeParse({ ...validData, confirmNewPassword: 'Diferente9' })
    expect(result.success).toBe(false)
    const issue = result.error?.issues.find(i => i.path.includes('confirmNewPassword'))
    expect(issue).toBeDefined()
  })
})
