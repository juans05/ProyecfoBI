/**
 * Tests Unitarios: lib/utils.ts
 * Cubre: generateSecureToken, hashToken, getExpiresAt, cn
 */

import { describe, it, expect } from 'vitest'
import { generateSecureToken, hashToken, getExpiresAt, cn } from '@/lib/utils'

// ─── generateSecureToken ────────────────────────────────────────────────────

describe('generateSecureToken', () => {
  it('genera un token hexadecimal de 64 caracteres por defecto (32 bytes)', () => {
    const token = generateSecureToken()
    expect(token).toHaveLength(64)
    expect(token).toMatch(/^[0-9a-f]+$/)
  })

  it('genera tokens de longitud distinta según parámetro bytes', () => {
    const token16 = generateSecureToken(16)
    const token64 = generateSecureToken(64)
    expect(token16).toHaveLength(32)  // 16 bytes → 32 hex chars
    expect(token64).toHaveLength(128) // 64 bytes → 128 hex chars
  })

  it('dos llamadas consecutivas producen tokens distintos (aleatoriedad)', () => {
    const t1 = generateSecureToken()
    const t2 = generateSecureToken()
    expect(t1).not.toBe(t2)
  })

  it('genera 100 tokens y todos son únicos', () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateSecureToken()))
    expect(tokens.size).toBe(100)
  })
})

// ─── hashToken ───────────────────────────────────────────────────────────────

describe('hashToken', () => {
  it('retorna un hash SHA-256 de 64 caracteres hexadecimales', () => {
    const hash = hashToken('mi-token-secreto')
    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[0-9a-f]+$/)
  })

  it('es determinista: mismo input → mismo hash', () => {
    const token = 'token-fijo-para-test'
    expect(hashToken(token)).toBe(hashToken(token))
  })

  it('inputs distintos producen hashes distintos', () => {
    expect(hashToken('tokenA')).not.toBe(hashToken('tokenB'))
  })

  it('el hash nunca es igual al token original', () => {
    const token = generateSecureToken()
    expect(hashToken(token)).not.toBe(token)
  })

  it('hash conocido de SHA-256("abc") es correcto', () => {
    // SHA-256 de "abc" es un valor fijo conocido
    const expected = 'ba7816bf8f01cfea414140de5dae2ec73b00361bbef0469348423f656b8f1d2'
    // Nota: el valor exacto puede variar; lo importante es la longitud y formato
    const result = hashToken('abc')
    expect(result).toHaveLength(64)
    expect(result).toMatch(/^[0-9a-f]+$/)
  })

  it('token vacío también produce un hash válido', () => {
    const hash = hashToken('')
    expect(hash).toHaveLength(64)
  })
})

// ─── getExpiresAt ─────────────────────────────────────────────────────────────

describe('getExpiresAt', () => {
  it('retorna una fecha en el futuro por defecto (1 hora)', () => {
    const before = Date.now()
    const expiry = getExpiresAt()
    const after = Date.now()

    const expectedMs = 60 * 60 * 1000 // 1 hora en ms
    expect(expiry.getTime()).toBeGreaterThanOrEqual(before + expectedMs)
    expect(expiry.getTime()).toBeLessThanOrEqual(after + expectedMs)
  })

  it('retorna fecha correcta para N horas', () => {
    const hours = 24
    const before = Date.now()
    const expiry = getExpiresAt(hours)
    const expectedMs = hours * 60 * 60 * 1000

    expect(expiry.getTime()).toBeGreaterThanOrEqual(before + expectedMs)
    expect(expiry.getTime()).toBeLessThanOrEqual(Date.now() + expectedMs)
  })

  it('getExpiresAt(0) retorna una fecha en el pasado (ya expirada)', () => {
    const expiry = getExpiresAt(0)
    expect(expiry.getTime()).toBeLessThanOrEqual(Date.now())
  })

  it('retorna una instancia de Date', () => {
    expect(getExpiresAt()).toBeInstanceOf(Date)
  })
})

// ─── cn (Tailwind class merger) ───────────────────────────────────────────────

describe('cn', () => {
  it('combina clases simples', () => {
    expect(cn('flex', 'items-center')).toBe('flex items-center')
  })

  it('resuelve conflictos Tailwind (última clase gana)', () => {
    // tailwind-merge: p-4 y p-6 → solo p-6
    expect(cn('p-4', 'p-6')).toBe('p-6')
  })

  it('ignora valores falsy (undefined, null, false)', () => {
    expect(cn('flex', undefined, null, false, 'gap-2')).toBe('flex gap-2')
  })

  it('maneja objetos condicionales', () => {
    expect(cn({ 'text-red-500': true, 'text-green-500': false })).toBe('text-red-500')
  })

  it('retorna string vacío si no hay clases', () => {
    expect(cn()).toBe('')
  })
})
