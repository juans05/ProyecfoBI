import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getModulesWithResources } from "@/domains/navigation/modules.service"
import { getBranches } from "@/domains/navigation/branches.service"
import { NewResourceForm } from "@/components/admin/NewResourceForm"
import { Layout, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function NewResourcePage({
  searchParams,
}: {
  searchParams: { moduleId?: string }
}) {
  const session = await auth()
  const companyId = (session?.user as any)?.companyId

  if (!companyId) {
    redirect("/dashboard")
  }

  const [modules, branches] = await Promise.all([
    getModulesWithResources(companyId),
    getBranches(companyId)
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/admin/modules" 
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Layout size={28} className="text-brand-600" />
            Nuevo Recurso / Reporte
          </h1>
          <p className="text-slate-500 text-sm">Configura un reporte de Power BI o una página personalizada.</p>
        </div>
      </div>

      <NewResourceForm 
        companyId={companyId}
        modules={modules}
        branches={branches}
        defaultModuleId={searchParams.moduleId}
      />
    </div>
  )
}
