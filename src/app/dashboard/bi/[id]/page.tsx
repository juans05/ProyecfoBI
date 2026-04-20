import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { requireResourceAccess } from '@/domains/permissions/permissions.guard'
import { ShieldAlert } from 'lucide-react'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { BIReportView } from "@/components/bi/BIReportView"

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

  const resource = await prisma.resource.findUnique({
    where: { id },
    include: { module: true }
  })

  if (!resource || resource.type !== 'POWERBI') {
    return notFound()
  }

  const cookieStore = cookies()
  const activeBranchId = cookieStore.get('activeBranchId')?.value || (session.user as any).activeBranchId

  const hasAccess = await requireResourceAccess(session.user.id!, id, activeBranchId, 'canView')

  if (!hasAccess) {
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
    <div className="p-0 sm:p-2 md:p-4">
      <BIReportView resource={resource} />
    </div>
  )
}
