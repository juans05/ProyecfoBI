"use client"

import { useState, useTransition } from "react"
import { Package, Settings, ChevronRight, BarChart, FileCode, Plus, LayoutGrid, Trash2, Loader2 } from "lucide-react"
import { CreateModuleModal, CreateResourceModal } from "@/components/admin/ModuleModals"
import { deleteModuleAction, deleteResourceAction } from "@/domains/navigation/module-management.actions"
import { toast } from "sonner"

interface ModuleWithResources {
  id: string
  name: string
  resources: any[]
}

export function ModuleManagementClient({ initialModules }: { initialModules: ModuleWithResources[] }) {
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false)
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState<{ id: string, name: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const openResourceModal = (id: string, name: string) => {
    setSelectedModule({ id, name })
    setIsResourceModalOpen(true)
  }

  const handleDeleteModule = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar el módulo "${name}"? Se borrarán todas sus pantallas asociadas.`)) {
      startTransition(async () => {
        try {
          await deleteModuleAction(id)
          toast.success("Módulo eliminado")
        } catch (error) {
          toast.error("Error al eliminar el módulo")
        }
      })
    }
  }

  const handleDeleteResource = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar la pantalla "${name}"?`)) {
      startTransition(async () => {
        try {
          await deleteResourceAction(id)
          toast.success("Pantalla eliminada")
        } catch (error) {
          toast.error("Error al eliminar la pantalla")
        }
      })
    }
  }

  const isProtected = (name: string) => {
    const protectedNames = ["Administración", "Usuarios", "Perfiles", "Módulos y Recursos", "Ajustes de Empresa"]
    return protectedNames.includes(name)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--brand-primary)' }}>Módulos y Recursos</h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Configura la navegación y herramientas de tu organización.</p>
        </div>
        <button 
          onClick={() => setIsModuleModalOpen(true)}
          className="btn-primary group"
        >
          <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform" />
          Nuevo Módulo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {initialModules.map((mod) => (
          <div key={mod.id} className="card bg-slate-900/50 border-slate-800/60 backdrop-blur-md overflow-hidden group hover:border-brand-500/30 transition-all">
            <div className="p-5 border-b border-slate-800/60 bg-slate-800/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white">{mod.name}</h3>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Módulo Activo</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isProtected(mod.name) && (
                  <button 
                    onClick={() => handleDeleteModule(mod.id, mod.name)}
                    className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Eliminar Módulo"
                    disabled={isPending}
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button className="text-slate-400 hover:text-white transition-colors">
                  <Settings size={18} />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {mod.resources.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 border border-dashed border-slate-800 rounded-lg text-center">
                  Sin recursos asignados
                </p>
              ) : (
                mod.resources.map((res) => (
                  <div key={res.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-slate-800/40 hover:bg-slate-900 transition-colors group/item">
                    <div className="flex items-center gap-3">
                      {res.type === 'POWERBI' ? (
                        <BarChart size={16} className="text-amber-400" />
                      ) : (
                        <FileCode size={16} className="text-blue-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-200">{res.name}</p>
                        <p className="text-[10px] text-slate-500">{res.url || 'Power BI Embedded'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteResource(res.id, res.name);
                        }}
                        className="p-1.5 opacity-100 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all"
                        title="Eliminar Pantalla"
                        disabled={isPending}
                      >
                        <Trash2 size={18} />
                      </button>
                      <ChevronRight size={14} className="text-slate-600 group-hover/item:text-brand-400 group-hover/item:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))
              )}

              <button 
                onClick={() => openResourceModal(mod.id, mod.name)}
                className="w-full mt-2 py-2.5 rounded-lg border border-dashed border-slate-700 text-xs font-semibold text-slate-400 hover:border-brand-500/50 hover:text-brand-400 hover:bg-brand-500/5 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={14} />
                Añadir Recurso o Dashboard
              </button>
            </div>
          </div>
        ))}
        
        <button 
          onClick={() => setIsModuleModalOpen(true)}
          className="group relative h-full min-h-[200px] flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-800 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all outline-none"
        >
          <div className="w-14 h-14 rounded-full bg-slate-800/50 group-hover:bg-brand-500/20 flex items-center justify-center text-slate-500 group-hover:text-brand-400 transition-all mb-4">
            <LayoutGrid size={28} />
          </div>
          <span className="text-sm font-bold text-slate-400 group-hover:text-brand-400">Expandir Ecosistema</span>
          <span className="text-xs text-slate-600 mt-1 max-w-[180px] text-center">Crea una nueva sección en el menú lateral de tu intranet.</span>
        </button>
      </div>

      <CreateModuleModal 
        isOpen={isModuleModalOpen} 
        onClose={() => setIsModuleModalOpen(false)} 
      />

      {selectedModule && (
        <CreateResourceModal 
          isOpen={isResourceModalOpen} 
          onClose={() => setIsResourceModalOpen(false)} 
          moduleId={selectedModule.id} 
          moduleName={selectedModule.name} 
        />
      )}
    </div>
  )
}
