
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Upload, Loader2, Check, Palette } from "lucide-react"
import { updateCompanyBranding } from "@/domains/saas/settings.service"
import { toast } from "sonner"

interface SettingsFormProps {
  company: any
}

export function SettingsForm({ company }: SettingsFormProps) {
  const router = useRouter()
  const [tradeName, setTradeName] = useState(company.tradeName || "")
  const [primaryColor, setPrimaryColor] = useState(company.primaryColor || "#2563eb")
  const [secondaryColor, setSecondaryColor] = useState(company.secondaryColor || "#64748b")
  const [sidebarBgColor, setSidebarBgColor] = useState(company.sidebarBgColor || "#0f172a")
  const [sidebarTextColor, setSidebarTextColor] = useState(company.sidebarTextColor || "#94a3b8")
  
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(company.logoUrl || null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('tradeName', tradeName)
      formData.append('primaryColor', primaryColor)
      formData.append('secondaryColor', secondaryColor)
      formData.append('sidebarBgColor', sidebarBgColor)
      formData.append('sidebarTextColor', sidebarTextColor)

      if (file) {
        formData.append('file', file)
      }

      await updateCompanyBranding(company.id, formData)

      toast.success("Ajustes actualizados correctamente")
      router.refresh()
    } catch (error) {
      toast.error("Error al guardar los ajustes")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card bg-white p-8 space-y-8 border-slate-200">
      <div className="space-y-6">
        <section>
          <label className="label text-slate-900 font-bold">Nombre Comercial</label>
          <div className="relative group">
            <input
              type="text"
              className="input pl-10 h-12"
              placeholder="Ej. Gran Molino S.A.C."
              value={tradeName}
              onChange={(e) => setTradeName(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors">
              <Store size={18} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2 italic">Este nombre sobreescribirá el nombre legal en la barra lateral.</p>
        </section>

        <section>
          <label className="label text-slate-900 font-bold">Logo del Sistema</label>
          <div className="flex items-start gap-6 mt-3">
            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden relative group">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Upload size={24} className="text-slate-300" />
              )}
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                <span className="text-[10px] text-white font-bold uppercase tracking-widest">Cambiar</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Check size={16} />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-700">Formato Recomendado</p>
                  <p className="text-slate-500 mt-0.5">PNG o SVG fondo transparente (Max 2MB)</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                className="btn-secondary h-10 w-full text-xs"
              >
                Seleccionar desde PC
              </button>
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        <section className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50/50 flex items-center justify-center text-brand-600">
              <Palette size={18} />
            </div>
            Colores de la Plataforma
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-700">Contenido Principal</p>
              <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Color de Títulos</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 overflow-hidden" 
                    />
                    <input 
                      type="text" 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="input flex-1 h-10 font-mono text-xs" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Color de Subtítulos</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={secondaryColor} 
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 overflow-hidden" 
                    />
                    <input 
                      type="text" 
                      value={secondaryColor} 
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="input flex-1 h-10 font-mono text-xs" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-700">Menú Lateral (Navigation)</p>
              <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Fondo del Menú</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={sidebarBgColor} 
                      onChange={(e) => setSidebarBgColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 overflow-hidden" 
                    />
                    <input 
                      type="text" 
                      value={sidebarBgColor} 
                      onChange={(e) => setSidebarBgColor(e.target.value)}
                      className="input flex-1 h-10 font-mono text-xs" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Texto del Menú</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={sidebarTextColor} 
                      onChange={(e) => setSidebarTextColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 overflow-hidden" 
                    />
                    <input 
                      type="text" 
                      value={sidebarTextColor} 
                      onChange={(e) => setSidebarTextColor(e.target.value)}
                      className="input flex-1 h-10 font-mono text-xs" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="pt-6 border-t border-slate-100 flex justify-end">
        <button 
          type="submit" 
          disabled={isLoading}
          className="btn-primary h-12 px-12 shadow-xl shadow-brand-600/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={18} />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2" size={18} />
              Guardar Ajustes de Marca
            </>
          )}
        </button>
      </div>
    </form>
  )
}

function Store({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
      <path d="M2 7h20"/>
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/>
    </svg>
  )
}
