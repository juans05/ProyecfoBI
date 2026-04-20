import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getPermissionsByProfile } from "@/domains/profiles/permissions.service"
import { PermissionMatrix } from "@/components/admin/PermissionMatrix"
import { Shield, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function ProfilePermissionsPage({ params }: { params: { id: string } }) {
  const session = await auth()
  const companyId = (session?.user as any)?.companyId

  if (!companyId) {
    redirect("/dashboard")
  }

  // 1. Obtener datos del perfil
  const profile = await prisma.profile.findUnique({
    where: { id: params.id, companyId }
  })

  if (!profile) {
    redirect("/dashboard/admin/profiles")
  }

  // 2. Obtener estructura de módulos y recursos con permisos actuales
  const modulesWithPermissions = await getPermissionsByProfile(params.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/admin/profiles" 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ChevronLeft size={24} />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Shield className="text-brand-600" size={20} />
            <h1 className="text-2xl font-bold text-slate-900">Configurar Permisos</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Perfil: <span className="font-bold text-slate-900">{profile.name}</span>
          </p>
        </div>
      </div>

      <div className="card bg-white p-0 overflow-hidden border-slate-200 shadow-xl">
        <div className="bg-slate-50 p-6 border-b border-slate-200">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Matriz de Acceso</h2>
          <p className="text-xs text-slate-500 mt-1">Activa o desactiva la visibilidad de cada sección para este perfil.</p>
        </div>
        
        <div className="p-0">
          <PermissionMatrix 
            profileId={params.id} 
            initialModules={modulesWithPermissions as any} 
          />
        </div>
      </div>
    </div>
  )
}
