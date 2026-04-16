/**
 * lib/utils.ts
 * Utilidades generales del proyecto
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import crypto from 'crypto'

/** Combina clases Tailwind sin conflictos */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Genera un token seguro aleatorio */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex')
}

/** Hashea un token con SHA-256 para almacenarlo en DB */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/** Calcula la fecha de expiración desde ahora */
export function getExpiresAt(hours = 1): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000)
}
