import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PowerBIService } from "@/domains/bi/powerbi.service"
import { requireResourceAccess } from "@/domains/permissions/permissions.guard"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { id } = params // ID del Recurso en nuestra DB

  try {
    // 1. Obtener el recurso para tener el reportId y workspaceId de Power BI
    console.log(`[DEBUG BI] Solicitando token para recurso ID: ${id}`)
    const resource = await prisma.resource.findUnique({
      where: { id },
    })

    if (resource) {
      console.log(`[DEBUG BI] Recurso encontrado: ${resource.name}`)
      console.log(`[DEBUG BI] Config: Report=${resource.powerbiReportId}, Workspace=${resource.powerbiWorkspaceId}, Type=${resource.type}`)
    } else {
      console.log(`[DEBUG BI] Recurso NO encontrado en DB`)
    }

    if (!resource || resource.type !== 'POWERBI' || !resource.powerbiReportId || !resource.powerbiWorkspaceId) {
      console.error(`[DEBUG BI] Error de validación detectado para: ${resource?.name || 'Recurso inexistente'}`)
      return NextResponse.json({ error: "Recurso BI no válido o mal configurado" }, { status: 404 })
    }

    // 2. [VIGILANTE SAAS] Validar acceso basado en empresa/sede/perfil
    const hasAccess = await requireResourceAccess(
      session.user.id, 
      id, 
      (session.user as any).activeBranchId, 
      'canView'
    )

    if (!hasAccess) {
      return NextResponse.json({ error: "Acceso denegado por políticas de empresa" }, { status: 403 })
    }

    // 3. Obtener el Embed Token desde el servicio de Power BI
    const embedConfig = await PowerBIService.getEmbedConfig(
      resource.powerbiWorkspaceId,
      resource.powerbiReportId
    )

    return NextResponse.json(embedConfig)
  } catch (error: any) {
    console.error("Error en API BI Token:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
