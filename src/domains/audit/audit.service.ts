/**
 * domains/audit/audit.service.ts
 * Registro de auditoría de acciones del sistema
 */

import { prisma } from '@/lib/prisma'

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET'
  | 'PASSWORD_CHANGE'
  | 'CREATE_USER'
  | 'UPDATE_USER'
  | 'DELETE_USER'
  | 'CREATE_PROFILE'
  | 'UPDATE_PROFILE'
  | 'DELETE_PROFILE'
  | 'ASSIGN_PROFILE'
  | 'REVOKE_PROFILE'
  | 'CREATE_MODULE'
  | 'UPDATE_MODULE'
  | 'DELETE_MODULE'
  | 'CREATE_RESOURCE'
  | 'UPDATE_RESOURCE'
  | 'DELETE_RESOURCE'
  | 'UPDATE_PERMISSIONS'
  | 'VIEW_REPORT'

export type AuditParams = {
  userId?: string
  action: AuditAction
  entity?: string
  entityId?: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export const AuditService = {
  async log(params: AuditParams) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: params.userId,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          oldValues: params.oldValues,
          newValues: params.newValues,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
      })
    } catch (err) {
      // El log de auditoría no debe romper el flujo principal
      console.error('[AuditService] Error registrando audit log:', err)
    }
  },
}

/**
 * Helper para extraer IP y User-Agent desde request headers
 */
export function getRequestMeta(request: Request) {
  return {
    ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined,
    userAgent: request.headers.get('user-agent') ?? undefined,
  }
}
