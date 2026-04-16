"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createModule } from "@/domains/navigation/modules.service"
import { Save, X, Box, Type, ListOrdered } from "lucide-react"
import { toast } from "sonner"

export default function NewModulePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Package',
    order: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await createModule(formData)
      toast.success("Módulo creado correctamente")
      router.push("/dashboard/admin/modules")
      router.refresh()
    } catch (error) {
      toast.error("Error al crear el módulo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Módulo</h1>
          <p className="text-slate-500 text-sm">Crea una categoría principal para organizar recursos.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-8 bg-white space-y-6 shadow-sm border-slate-200">
        <div className="space-y-4">
          <div>
            <label className="label">Nombre del Módulo</label>
            <div className="relative">
              <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input pl-10" 
                placeholder="Ej. Comercial, Recursos Humanos..." 
              />
            </div>
          </div>

          <div>
            <label className="label">Ícono (Lucide)</label>
            <div className="relative">
              <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                value={formData.icon}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                className="input pl-10 font-mono text-sm" 
                placeholder="Ej. BarChart2, Users, Settings..." 
              />
            </div>
          </div>

          <div>
            <label className="label">Orden de Visualización</label>
            <div className="relative">
              <ListOrdered className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                className="input pl-10" 
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button type="submit" disabled={isLoading} className="btn-primary flex-1">
            {isLoading ? "Guardando..." : "Crear Módulo"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary px-8">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
