import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { requireResourceAccess } from '@/domains/permissions/permissions.guard'
import { BarChart2, Maximize2, RefreshCw, ShieldAlert } from 'lucide-react'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { PowerBIEmbed } from "@/components/bi/PowerBIEmbed"

interface PageProps {
  params: {
    id: string
  }
}

export default async function PowerBIPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const { id } = params

  // 1. Obtener detalles del recurso
  const resource = await prisma.resource.findUnique({
    where: { id },
    include: { module: true }
  })

  if (!resource || resource.type !== 'POWERBI') {
    return notFound()
  }

  // 2. Leer sede activa para validación
  const cookieStore = cookies()
  const activeBranchId = cookieStore.get('activeBranchId')?.value || (session.user as any).activeBranchId

  // 3. Validar permiso de visualización y sede
  const hasAccess = await requireResourceAccess(session.user.id, id, activeBranchId, 'canView')

  if (!hasAccess) {
    // ... renderizado de acceso denegado ...
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Acceso Denegado</h2>
        <p className="text-slate-500 max-w-md">
          Tu perfil no tiene permisos suficientes para visualizar este reporte.
        </p>
        <Link href="/dashboard" className="mt-6 btn-secondary">
          Volver al Inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height)-3rem)] space-y-4 animate-in fade-in duration-500">
      {/* Header del Reporte */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
            <BarChart2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>{resource.module.name}</span>
              <span>/</span>
              <span>Reporte BI</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{resource.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-secondary h-9 text-xs">
            <RefreshCw size={14} className="mr-2" />
            Actualizar
          </button>
          <button className="btn-secondary h-9 text-xs">
            <Maximize2 size={14} className="mr-2" />
            Fullscreen
          </button>
        </div>
      </div>

      {/* Contenedor del Reporte a Pantalla Completa */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[500px]">
        <PowerBIEmbed resourceId={resource.id} />
      </div>

      {/* Footer / Nota */}
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <p>Resource ID: {resource.id}</p>
        <p>Integración Segura GranMolino — Power BI Embedded</p>
      </div>
    </div>
  )
}
