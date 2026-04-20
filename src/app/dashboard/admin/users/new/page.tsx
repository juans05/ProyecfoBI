import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { UserForm } from "@/components/admin/UserForm"
import { getProfiles } from "@/domains/profiles/profiles.service"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function NewUserPage() {
  const session = await auth()
  const companyId = (session?.user as any)?.companyId

  if (!companyId) {
    redirect("/dashboard")
  }

  const profiles = await getProfiles()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/admin/users" 
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Usuario</h1>
          <p className="text-slate-500 text-sm">Crea una nueva cuenta y asigna sus perfiles iniciales.</p>
        </div>
      </div>

      <UserForm companyId={companyId} profiles={profiles} />
    </div>
  )
}
