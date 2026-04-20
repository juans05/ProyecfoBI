
"use client"

import { useState, startTransition } from "react"
import { Plus, X, Shield, Loader2 } from "lucide-react"
import { createProfile } from "@/domains/profiles/profiles.service"
import { toast } from "sonner"

export function CreateProfileButton({ companyId }: { companyId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    startTransition(() => {
      createProfile({
        name,
        description,
        isActive: true,
        companyId
      })
      .then(() => {
        toast.success("Perfil creado exitosamente")
        setIsOpen(false)
        setName("")
        setDescription("")
      })
      .catch((error: any) => {
        toast.error(error.message || "Error al crear el perfil")
      })
      .finally(() => {
        setIsLoading(false)
      })
    })
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn-primary">
        <Plus size={18} className="mr-2" />
        Nuevo Perfil
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                  <Shield size={20} />
                </div>
                <h3 className="font-bold text-slate-900">Crear Nuevo Perfil</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Nombre del Perfil</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  className="input" 
                  placeholder="Ej. Analista Senior"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="label">Descripción (Opcional)</label>
                <textarea 
                  className="input min-h-[100px] py-3" 
                  placeholder="Describe brevemente las responsabilidades de este perfil..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary flex-1 h-12"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex-1 h-12"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Crear Perfil"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
