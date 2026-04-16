"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Save, X, Hash, ToggleLeft, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { createCompanyAction } from "@/domains/saas/companies.actions"

export default function NewCompanyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    taxId: '',
    isActive: true,
    allowRootAccess: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const result = await createCompanyAction(formData)
      
      if (result.success) {
        toast.success("Empresa creada correctamente")
        router.push("/dashboard/root/companies")
        router.refresh()
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      toast.error("Error inesperado al crear la empresa")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Building2 size={28} className="text-brand-600" />
            Nueva Empresa
          </h1>
          <p className="text-slate-500 text-sm">Registra una nueva organización en el ecosistema SaaS.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-8 bg-white space-y-6 shadow-sm border-slate-200">
        <div className="space-y-4">
          <div>
            <label className="label">Nombre Comercial / Razón Social</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input pl-10" 
                placeholder="Ej. Corporación Global S.A.C." 
              />
            </div>
          </div>

          <div>
            <label className="label">Identificación Tributaria (RUC / NIT / CIF)</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                value={formData.taxId}
                onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                className="input pl-10" 
                placeholder="Número de registro de la empresa" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 group hover:border-brand-200 transition-colors">
              <div className="flex items-center gap-3">
                <ToggleLeft size={20} className="text-slate-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Empresa Activa</p>
                  <p className="text-[10px] text-slate-500">Permitir acceso a sus usuarios</p>
                </div>
              </div>
              <input 
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-amber-50/30 rounded-xl border border-amber-100 group">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Acceso de Soporte</p>
                  <p className="text-[10px] text-amber-600">Root puede entrar (Dashboard)</p>
                </div>
              </div>
              <input 
                type="checkbox"
                checked={formData.allowRootAccess}
                onChange={(e) => setFormData({...formData, allowRootAccess: e.target.checked})}
                className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t font-semibold">
          <button type="submit" disabled={isLoading} className="btn-primary flex-1 h-12 flex items-center justify-center gap-2">
            <Save size={18} />
            {isLoading ? "Registrando..." : "Crear Organización"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary px-8 h-12">
            Cancelar
          </button>
        </div>
      </form>

      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Nota:</strong> Al crear la empresa, el sistema la habilitará como un espacio de trabajo vacío. 
          Deberás asignar o crear el primer Administrador de la organización manualmente o mediante el flujo de onboarding.
        </p>
      </div>
    </div>
  )
}
