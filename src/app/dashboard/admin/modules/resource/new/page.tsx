"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getModulesWithResources, createResource } from "@/domains/navigation/modules.service"
import { getBranches } from "@/domains/navigation/branches.service"
import { Save, X, BarChart2, Link as LinkIcon, Folder, Layout, MapPin } from "lucide-react"
import { toast } from "sonner"

export default function NewResourcePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [modules, setModules] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: '',
    moduleId: searchParams.get('moduleId') || '',
    branchId: '', // Nuevo campo para sede
    type: 'POWERBI',
    url: '',
    powerbiReportId: '',
    order: 0
  })

  useEffect(() => {
    async function fetchData() {
      const [modulesData, branchesData] = await Promise.all([
        getModulesWithResources(),
        getBranches()
      ])
      setModules(modulesData)
      setBranches(branchesData)
      if (!formData.moduleId && modulesData.length > 0) {
        setFormData(prev => ({ ...prev, moduleId: modulesData[0].id }))
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await createResource(formData)
      toast.success("Recurso registrado correctamente")
      router.push("/dashboard/admin/modules")
      router.refresh()
    } catch (error) {
      toast.error("Error al registrar el recurso")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Layout size={28} className="text-brand-600" />
            Nuevo Recurso / Reporte
          </h1>
          <p className="text-slate-500 text-sm">Configura un reporte de Power BI o una página personalizada.</p>
        </div>
      </div>

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
                <option value="POWERBI">POWER BI (Iframe/Embedded)</option>
                <option value="PAGE">PÁGINA INTERNA (Next.js)</option>
                <option value="LINK">LINK EXTERNO</option>
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

          {formData.type === 'POWERBI' && (
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
                onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                className="input" 
            />
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t font-semibold">
          <button type="submit" disabled={isLoading} className="btn-primary flex-1 h-12">
            {isLoading ? "Registrando..." : "Guardar Recurso"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary px-8 h-12">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
