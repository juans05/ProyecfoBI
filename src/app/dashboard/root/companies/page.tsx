import { CompanyService } from "@/domains/saas/companies.service"
import { requireAuth } from "@/domains/permissions/permissions.guard"
import { redirect } from "next/navigation"
import { 
  Building2, 
  Plus, 
  Search, 
  MoreVertical, 
  ShieldCheck, 
  ShieldAlert,
  Users,
  MapPin,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default async function CompaniesManagementPage() {
  const { session } = await requireAuth()
  
  if (!session || !(session.user as any).isRoot) {
    redirect('/dashboard')
  }

  const companies = await CompanyService.getAllCompanies()

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Building2 size={28} className="text-brand-600" />
            Gestión de Empresas
          </h1>
          <p className="text-slate-500 text-sm">Administra las organizaciones, licencias y accesos de soporte.</p>
        </div>
        
        <Link href="/dashboard/root/companies/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nueva Empresa
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-5 border-l-4 border-l-brand-500">
          <p className="text-sm font-medium text-slate-500">Empresas Activas</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{companies.filter(c => c.isActive).length}</p>
        </div>
        <div className="card p-5 border-l-4 border-l-blue-500">
          <p className="text-sm font-medium text-slate-500">Total Usuarios</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {companies.reduce((acc, c) => acc + c._count.users, 0)}
          </p>
        </div>
        <div className="card p-5 border-l-4 border-l-amber-500">
          <p className="text-sm font-medium text-slate-500">Sedes Registradas</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {companies.reduce((acc, c) => acc + c._count.branches, 0)}
          </p>
        </div>
      </div>

      <div className="card overflow-hidden border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Soporte</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Stats</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{company.name}</p>
                        <p className="text-xs text-slate-500">ID: {company.taxId || "N/A"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      company.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-slate-100 text-slate-600"
                    )}>
                      {company.isActive ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {company.allowRootAccess ? (
                        <span className="flex items-center gap-1 text-xs text-brand-600 font-medium bg-brand-50 px-2 py-1 rounded-md">
                          <ShieldCheck size={14} />
                          Permitido
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-md">
                          <ShieldAlert size={14} />
                          Bloqueado
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-4 text-slate-500">
                      <div className="flex items-center gap-1.5" title="Usuarios">
                        <Users size={14} />
                        <span className="text-xs font-medium">{company._count.users}</span>
                      </div>
                      <div className="flex items-center gap-1.5" title="Sedes">
                        <MapPin size={14} />
                        <span className="text-xs font-medium">{company._count.branches}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {company.allowRootAccess && (
                         <button className="p-2 text-brand-500 hover:bg-brand-50 rounded-lg transition-colors" title="Entrar como Admin">
                             <ExternalLink size={18} />
                         </button>
                       )}
                       <Link 
                        href={`/dashboard/root/companies/${company.id}`}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                       >
                         <MoreVertical size={18} />
                       </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
