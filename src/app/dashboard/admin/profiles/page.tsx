import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getProfilesWithStats } from "@/domains/profiles/permissions.service"
import { ProfilesTable } from "@/components/admin/ProfilesTable"
import { Shield, Plus, Key } from "lucide-react"

export default async function ProfilesPage() {
  const session = await auth()
  const companyId = (session?.user as any)?.companyId

  if (!companyId) {
    redirect("/dashboard")
  }

  const profiles = await getProfilesWithStats(companyId)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Perfiles y Permisos</h1>
          <p className="text-slate-500 text-sm mt-1">Define roles y controla el acceso a módulos y reportes.</p>
        </div>
        
        <button className="btn-primary">
          <Plus size={18} className="mr-2" />
          Nuevo Perfil
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 bg-slate-900 text-white relative overflow-hidden">
              <div className="relative z-10">
                <Shield className="text-brand-400 mb-4" size={32} />
                <h3 className="text-lg font-bold">Seguridad basada en Roles</h3>
                <p className="text-slate-400 text-sm mt-2 max-w-sm">
                    Toda la navegación y acciones del sistema están vinculadas a estos perfiles. 
                    Un cambio aquí impacta inmediatamente a todos los usuarios vinculados.
                </p>
              </div>
              <div className="absolute top-[-20%] right-[-10%] w-[150px] h-[150px] bg-brand-600/20 rounded-full blur-[50px]" />
          </div>
          
          <div className="card p-6 border-brand-100 bg-brand-50/30 flex items-center justify-between">
              <div>
                <p className="text-brand-800 font-semibold">Integración BI</p>
                <p className="text-brand-600 text-sm mt-1">Los reportes de Power BI heredan la seguridad de estos perfiles.</p>
              </div>
              <Key className="text-brand-300" size={48} />
          </div>
      </div>

      <ProfilesTable profiles={profiles} />
    </div>
  )
}
