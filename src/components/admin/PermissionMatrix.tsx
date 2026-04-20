"use client"

import { useState, Fragment, startTransition } from "react"
import { 
  Shield, 
  ChevronRight, 
  BarChart2, 
  FileText, 
  Save, 
  Loader2, 
  CheckSquare, 
  Square 
} from "lucide-react"
import { updatePermissions } from "@/domains/profiles/permissions.service"
import { toast } from "sonner"

interface PermissionMatrixProps {
  profileId: string
  initialModules: any[] // Modules with nested resources and profile relations
}

export function PermissionMatrix({ profileId, initialModules }: PermissionMatrixProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  // State for modules (simple array of IDs)
  const [selectedModules, setSelectedModules] = useState<string[]>(
    initialModules.filter(m => m.profileModules && m.profileModules.length > 0 && m.profileModules[0].canAccess).map(m => m.id)
  )

  // State for resource permissions (object indexed by resourceId)
  const [resourcePerms, setResourcePerms] = useState<Record<string, { view: boolean, edit: boolean, del: boolean }>>(
    initialModules.reduce((acc, mod) => {
      mod.resources.forEach((res: any) => {
        const p = res.profileResources && res.profileResources.length > 0 ? res.profileResources[0] : null
        acc[res.id] = {
          view: p?.canView || false,
          edit: p?.canEdit || false,
          del: p?.canDelete || false
        }
      })
      return acc
    }, {} as any)
  )

  const toggleModule = (id: string) => {
    setSelectedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  const toggleResourcePerm = (resId: string, type: 'view' | 'edit' | 'del') => {
    setResourcePerms(prev => ({
      ...prev,
      [resId]: { ...prev[resId], [type]: !prev[resId][type] }
    }))
  }

  const handleSave = () => {
    setIsLoading(true)
    
    startTransition(() => {
      const resourcePermissions = Object.entries(resourcePerms).map(([id, p]) => ({
        resourceId: id,
        canView: p.view,
        canEdit: p.edit,
        canDelete: p.del
      }))

      updatePermissions(profileId, {
        moduleIds: selectedModules,
        resourcePermissions
      })
      .then(() => {
        toast.success("Seguridad del perfil actualizada")
      })
      .catch((error) => {
        toast.error("Error al sincronizar permisos")
      })
      .finally(() => {
        setIsLoading(false)
      })
    })
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Estructura de Navegación</th>
                <th className="px-4 py-4 text-center font-bold uppercase tracking-widest text-[10px]">Visibilidad</th>
                <th className="px-4 py-4 text-center font-bold uppercase tracking-widest text-[10px]">Escritura</th>
                <th className="px-4 py-4 text-center font-bold uppercase tracking-widest text-[10px]">Borrado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialModules.map((mod) => (
                <Fragment key={mod.id}>
                  {/* Module Row */}
                  <tr className="bg-slate-50/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                          <BarChart2 size={16} />
                        </div>
                        <span className="font-bold text-slate-900">{mod.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button onClick={() => toggleModule(mod.id)} className="transition-transform active:scale-95">
                        {selectedModules.includes(mod.id) 
                          ? <CheckSquare size={22} className="text-brand-600 fill-brand-50" /> 
                          : <Square size={22} className="text-slate-300" />}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-center text-slate-300">-</td>
                    <td className="px-4 py-4 text-center text-slate-300">-</td>
                  </tr>

                  {/* Resource Rows */}
                  {mod.resources.map((res: any) => (
                    <tr key={res.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-3 pl-14 relative">
                        <div className="absolute left-9 top-0 bottom-0 w-px bg-slate-200"></div>
                        <div className="absolute left-9 top-1/2 w-4 h-px bg-slate-200"></div>
                        <div className="flex items-center gap-3">
                          <FileText className="text-slate-300 group-hover:text-brand-400 transition-colors" size={14} />
                          <span className="text-slate-600 group-hover:text-slate-900 transition-colors font-medium">{res.name}</span>
                          {res.type === 'POWERBI' && (
                            <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-black">BI</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleResourcePerm(res.id, 'view')} className="transition-transform active:scale-90">
                          {resourcePerms[res.id]?.view 
                            ? <CheckSquare size={19} className="text-emerald-600 fill-emerald-50" /> 
                            : <Square size={19} className="text-slate-200" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleResourcePerm(res.id, 'edit')} className="transition-transform active:scale-90">
                          {resourcePerms[res.id]?.edit 
                            ? <CheckSquare size={19} className="text-blue-600 fill-blue-50" /> 
                            : <Square size={19} className="text-slate-200" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleResourcePerm(res.id, 'del')} className="transition-transform active:scale-90">
                          {resourcePerms[res.id]?.del 
                            ? <CheckSquare size={19} className="text-red-500 fill-red-50" /> 
                            : <Square size={19} className="text-slate-200" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end p-6 bg-slate-50 border-t border-slate-200 rounded-b-xl">
        <button 
          disabled={isLoading}
          onClick={handleSave} 
          className="btn-primary h-12 px-10 shadow-xl shadow-brand-600/20 text-sm font-bold tracking-wide"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              Sincronizando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save size={18} />
              Guardar Cambios de Perfil
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
