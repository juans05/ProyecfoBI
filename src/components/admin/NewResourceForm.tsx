"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createResource } from "@/domains/navigation/modules.service"
import { Save, X, BarChart2, Link as LinkIcon, Folder, Layout, MapPin, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ResourceType } from "@prisma/client"

interface NewResourceFormProps {
  companyId: string
  modules: any[]
  branches: any[]
  defaultModuleId?: string
}

export function NewResourceForm({ companyId, modules, branches, defaultModuleId }: NewResourceFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    moduleId: defaultModuleId || (modules.length > 0 ? modules[0].id : ''),
    branchId: '',
    type: ResourceType.POWERBI as string,
    url: '',
    powerbiReportId: '',
    order: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await createResource(formData, companyId)
      toast.success("Recurso registrado correctamente")
      router.push("/dashboard/admin/modules")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Error al registrar el recurso")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8 bg-white space-y-8 shadow-sm border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-1">
          <label className="label">Módulo Destino</label>
          <div className="relative">
            <Folder className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              required
              value={formData.moduleId}
              onChange={(e) => setFormData({...formData, moduleId: e.target.value})}
              className="input pl-10 appearance-none"
            >
              {modules.length === 0 && <option value="">No hay módulos disponibles</option>}
              {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>

        <div className="md:col-span-1">
          <label className="label">Sede / Ámbito</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              value={formData.branchId}
              onChange={(e) => setFormData({...formData, branchId: e.target.value})}
              className="input pl-10 appearance-none bg-brand-50/30 border-brand-100"
            >
              <option value="">Global / Todas las Sedes</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Nombre del Reporte</label>
          <div className="relative">
            <BarChart2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="input pl-10" 
              placeholder="Ej. KPIs Ventas Q1" 
            />
          </div>
        </div>

        <div>
          <label className="label">Tipo de Recurso</label>
          <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="input"
            >
              <option value={ResourceType.POWERBI}>POWER BI (Iframe/Embedded)</option>
              <option value={ResourceType.PAGE}>PÁGINA INTERNA (Next.js)</option>
              <option value={ResourceType.LINK}>LINK EXTERNO</option>
            </select>
        </div>

        <div className="md:col-span-2">
          <label className="label">URL del Recurso / Embed URL</label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              required
              value={formData.url}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
              className="input pl-10" 
              placeholder="https://app.powerbi.com/reportEmbed?..." 
            />
          </div>
        </div>

        {formData.type === ResourceType.POWERBI && (
           <div>
              <label className="label">Report ID (Opcional)</label>
              <input 
                  value={formData.powerbiReportId}
                  onChange={(e) => setFormData({...formData, powerbiReportId: e.target.value})}
                  className="input" 
                  placeholder="UUID del reporte" 
              />
           </div>
        )}

        <div>
          <label className="label">Orden</label>
          <input 
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
              className="input" 
          />
        </div>
      </div>

      <div className="flex gap-3 pt-6 border-t font-semibold">
        <button type="submit" disabled={isLoading} className="btn-primary flex-1 h-12">
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Guardar Recurso"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary px-8 h-12">
          <X size={18} className="mr-2" />
          Cancelar
        </button>
      </div>
    </form>
  )
}
