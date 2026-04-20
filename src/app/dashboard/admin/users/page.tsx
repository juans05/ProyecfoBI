import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getUsers } from "@/domains/users/users.service"
import { getProfiles } from "@/domains/profiles/profiles.service"
import { UsersTable } from "@/components/admin/UsersTable"
import { Plus, UserCheck, UserMinus, Shield } from "lucide-react"
import Link from "next/link"

export default async function UsersPage() {
  const session = await auth()
  const companyId = (session?.user as any)?.companyId

  if (!companyId) {
    redirect("/dashboard")
  }

  const users = await getUsers(companyId)
  const profiles = await getProfiles()

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h1>
          <p className="text-slate-500 text-sm mt-1">Administra los accesos y perfiles de los colaboradores.</p>
        </div>
        
        <Link href="/dashboard/admin/users/new" className="btn-primary">
          <Plus size={18} className="mr-2" />
          Nuevo Usuario
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-4 bg-white">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-lg">
            <UserCheck size={20} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Usuarios Activos</p>
            <p className="text-xl font-bold text-slate-900">{users.filter(u => u.isActive).length}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4 bg-white">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <UserMinus size={20} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Inactivos</p>
            <p className="text-xl font-bold text-slate-900">{users.filter(u => !u.isActive).length}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4 bg-white">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Perfiles Totales</p>
            <p className="text-xl font-bold text-slate-900">--</p>
          </div>
        </div>
      </div>

      <UsersTable users={users} profiles={profiles} />
    </div>
  )
}
