
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { SettingsForm } from "@/components/admin/SettingsForm"
import { Settings as SettingsIcon, Image as ImageIcon, Store } from "lucide-react"

export default async function SettingsPage() {
  const session = await auth()
  const companyId = (session?.user as any)?.companyId

  if (!companyId) {
    redirect("/dashboard")
  }

  // Verificar que sea admin (Perfil Administrador)
  const userProfiles = await prisma.userProfile.findMany({
    where: { userId: session?.user?.id },
    include: { profile: true }
  })
  
  const isAdmin = userProfiles.some(up => up.profile.name === 'Administrador' || (session?.user as any).isRoot)

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId }
  })

  if (!company) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <SettingsIcon className="text-brand-600" size={24} />
          Ajustes de Empresa
        </h1>
        <p className="text-slate-500 text-sm mt-1">Personaliza la identidad visual de tu intranet corporativa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <SettingsForm company={company} />
        </div>

        <div className="space-y-6">
          <div className="card p-6 border-brand-100 bg-brand-50/20">
            <Store className="text-brand-600 mb-4" size={32} />
            <h3 className="font-bold text-slate-900">Marca Corporativa</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              El nombre comercial aparecerá en la parte superior del menú lateral y en los reportes exportados.
            </p>
          </div>

          <div className="card p-6 border-slate-200 bg-white">
            <ImageIcon className="text-slate-400 mb-4" size={32} />
            <h3 className="font-bold text-slate-900">Logo de la Intranet</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Sube una imagen cuadrada (PNG/JPG) con fondo transparente para un mejor resultado visual.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
