/**
 * lib/api-response.ts
 * Helpers para respuestas JSON consistentes en las API Routes
 */

import { NextResponse } from 'next/server'

type ApiSuccess<T> = {
  success: true
  data: T
  message?: string
}

type ApiError = {
  success: false
  error: string
  details?: unknown
}

export function apiSuccess<T>(data: T, message?: string, status = 200) {
  const body: ApiSuccess<T> = { success: true, data }
  if (message) body.message = message
  return NextResponse.json(body, { status })
}

export function apiError(error: string, status = 400, details?: unknown) {
  const body: ApiError = { success: false, error }
  if (details) body.details = details
  return NextResponse.json(body, { status })
}

export const ApiErrors = {
  UNAUTHORIZED: () => apiError('No autorizado', 401),
  FORBIDDEN: () => apiError('Sin permisos para esta acción', 403),
  NOT_FOUND: (entity = 'Recurso') => apiError(`${entity} no encontrado`, 404),
  INTERNAL: () => apiError('Error interno del servidor', 500),
  BAD_REQUEST: (msg: string) => apiError(msg, 400),
}
