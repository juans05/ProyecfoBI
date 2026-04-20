import { auth } from "@/auth"
import { Building2, ShieldCheck, LayoutDashboard, BarChart2, Database } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) return null

  const isRoot = (session.user as any).isRoot
  const companyName = (session.user as any).companyName || "Portal de Inteligencia"

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-1000">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div className="relative inline-block">
          {/* Subtle background glow */}
          <div className="absolute -inset-8 bg-brand-500/5 rounded-full blur-[60px]" />
          
          <div className="relative w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto border border-slate-100 transition-transform hover:scale-105 duration-500">
            {isRoot ? (
              <ShieldCheck size={48} className="text-amber-500" />
            ) : (
              <Building2 size={48} className="text-brand-600" />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Bienvenido a tu <br/>
            <span className="text-brand-600">Portal de Inteligencia de Datos</span>
          </h1>
          
          <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed font-medium">
            Gestión centralizada para <span className="font-bold text-slate-800">{companyName}</span>. 
            Todo está listo para comenzar el análisis estratégico.
          </p>
        </div>

        {/* Minimal Platform Status / Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <div className="group p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col items-center gap-3 transition-all hover:shadow-md hover:-translate-y-1">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-colors">
              <LayoutDashboard size={20} />
            </div>
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Módulos</span>
              <p className="text-xs text-slate-600 font-bold leading-none">Activos</p>
            </div>
          </div>
          
          <div className="group p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col items-center gap-3 transition-all hover:shadow-md hover:-translate-y-1">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-colors">
              <BarChart2 size={20} />
            </div>
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Business Intelligence</span>
              <p className="text-xs text-slate-600 font-bold leading-none">Visualización</p>
            </div>
          </div>
          
          <div className="group p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col items-center gap-3 transition-all hover:shadow-md hover:-translate-y-1">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-colors">
              <Database size={20} />
            </div>
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Gestión de Datos</span>
              <p className="text-xs text-slate-600 font-bold leading-none">Segura</p>
            </div>
          </div>
        </div>

        {/* Final minimalist instructions */}
        <div className="pt-16">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-slate-100 bg-slate-50/50">
            <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
              Selecciona un reporte en el menú lateral para comenzar
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
