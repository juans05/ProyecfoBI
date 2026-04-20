import React from 'react'
import { 
  PieChart, 
  ArrowRight, 
  Sparkles, 
  BarChart3, 
  Gamepad2, 
  Target
} from 'lucide-react'

interface WelcomeViewProps {
  userName: string
  companyName: string
}

export function WelcomeView({ userName, companyName }: WelcomeViewProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-12 animate-in fade-in zoom-in duration-700">
      <div className="relative">
        <div className="absolute -inset-4 bg-brand-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 max-w-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-600">
            <Sparkles size={40} className="animate-bounce" />
          </div>
          
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            ¡Hola, <span className="text-brand-600">{userName.split(' ')[0]}</span>!
          </h1>
          
          <p className="text-xl text-slate-500 leading-relaxed">
            Bienvenido al portal de inteligencia de <span className="font-semibold text-slate-700">{companyName}</span>. 
            Todo está listo para que explores tus datos.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 transition-colors group">
              <BarChart3 className="mx-auto mb-2 text-slate-400 group-hover:text-brand-500 transition-colors" size={24} />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reportes</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 transition-colors group">
              <Target className="mx-auto mb-2 text-slate-400 group-hover:text-brand-500 transition-colors" size={24} />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Objetivos</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 transition-colors group">
              <PieChart className="mx-auto mb-2 text-slate-400 group-hover:text-brand-500 transition-colors" size={24} />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">KPIs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <p className="text-slate-400 font-medium flex items-center gap-2">
          Selecciona un reporte en el menú lateral para comenzar
        </p>
        <div className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-full font-bold shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all cursor-default group">
          Explora tus datos <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  )
}
