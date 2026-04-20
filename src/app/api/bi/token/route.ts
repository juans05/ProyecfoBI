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
    const resource = await prisma.resource.findUnique({
      where: { id },
    })

    if (!resource || resource.type !== 'POWERBI' || !resource.powerbiReportId || !resource.powerbiWorkspaceId) {
      return NextResponse.json({ error: "Recurso BI no válido o mal configurado" }, { status: 404 })
    }

    // 2. [VIGILANTE SAAS] Validar acceso basado en empresa/sede/perfil
    // Usamos el guardia que ya tenemos implementado
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
