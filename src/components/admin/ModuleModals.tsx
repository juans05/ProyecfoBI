"use client"

import { useState } from "react"
import { LayoutGrid, Package, ChevronRight, BarChart, Type, Link as LinkIcon, X, Loader2 } from "lucide-react"
import { createModuleAction, createResourceAction } from "@/domains/navigation/module-management.actions"
import { ResourceType } from "@prisma/client"

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  children: React.ReactNode
}

function BaseModal({ isOpen, onClose, title, description, children }: BaseModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-800 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <p className="text-sm text-slate-400 mt-1">{description}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export function CreateModuleModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createModuleAction(name)
      onClose()
      setName("")
    } catch (error) {
      alert("Error al crear módulo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Nuevo Módulo" 
      description="Crea una sección principal para organizar recursos."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Nombre del Módulo</label>
          <div className="relative">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Finanzas, Operaciones..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:border-brand-500/50 outline-none transition-all"
            />
          </div>
        </div>

        <button 
          disabled={loading || !name}
          className="btn-primary w-full py-3 h-auto text-base font-bold group"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Crear Módulo Institucional"}
        </button>
      </form>
    </BaseModal>
  )
}

export function CreateResourceModal({ 
  isOpen, 
  onClose, 
  moduleId, 
  moduleName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  moduleId: string; 
  moduleName: string 
}) {
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<ResourceType>(ResourceType.POWERBI)
  const [name, setName] = useState("")
  const [pbiReportId, setPbiReportId] = useState("")
  const [pbiWorkspaceId, setPbiWorkspaceId] = useState("")
  const [url, setUrl] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createResourceAction(moduleId, {
        name,
        type,
        url: type === ResourceType.LINK ? url : undefined,
        powerbiReportId: type === ResourceType.POWERBI ? pbiReportId : undefined,
        powerbiWorkspaceId: type === ResourceType.POWERBI ? pbiWorkspaceId : undefined,
      })
      onClose()
      setName("")
      setPbiReportId("")
      setPbiWorkspaceId("")
      setUrl("")
    } catch (error) {
      alert("Error al crear recurso")
    } finally {
      setLoading(false)
    }
  }

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Añadir Recurso" 
      description={`Agregando a: ${moduleName}`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button 
            type="button"
            onClick={() => setType(ResourceType.POWERBI)}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${type === ResourceType.POWERBI ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <BarChart size={14} />
            POWER BI
          </button>
          <button 
            type="button"
            onClick={() => setType(ResourceType.LINK)}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${type === ResourceType.LINK ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <LinkIcon size={14} />
            LINK / WEB
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Nombre Visual</label>
            <input 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Reporte de Ventas Mensual" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:border-brand-500/50 outline-none"
            />
          </div>

          {type === ResourceType.POWERBI ? (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block text-amber-500/80">Report ID (Power BI)</label>
                <input 
                  required
                  value={pbiReportId}
                  onChange={(e) => setPbiReportId(e.target.value)}
                  placeholder="35881d36-f7e7-4a26-aa78-..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs font-mono text-white focus:border-amber-500/50 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block text-amber-500/80">Workspace ID (Opcional)</label>
                <input 
                  value={pbiWorkspaceId}
                  onChange={(e) => setPbiWorkspaceId(e.target.value)}
                  placeholder="ID del grupo de trabajo" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs font-mono text-white focus:border-amber-500/50 outline-none"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">URL Destino</label>
              <input 
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://pagina-externa.com" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:border-brand-500/50 outline-none"
              />
            </div>
          )}
        </div>

        <button 
          disabled={loading || !name}
          className="btn-primary w-full py-3 h-auto text-base font-bold"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Vincular Recurso"}
        </button>
      </form>
    </BaseModal>
  )
}
