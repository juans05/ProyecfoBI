"use client"

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginSchema, type LoginInput } from '@/domains/auth/auth.schema'
import { Lock, Mail, Loader2, AlertCircle, BarChart2, Database, LayoutDashboard, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Acceso denegado. Verifique sus credenciales corporativas.')
        toast.error('Error de autenticación')
      } else {
        toast.success('Identidad validada con éxito')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Error en la comunicación con el servidor de seguridad')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900">
      {/* Lado Izquierdo: Visual & Platform Pillars (Oculto en móvil) */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-slate-900">
        <img 
          src="/login-bg.png" 
          alt="Corporate background" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/60 to-brand-900/20" />
        
        <div className="relative z-10 flex flex-col justify-between p-20 w-full">
          {/* Logo / Header */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl transform -rotate-3 group hover:rotate-0 transition-transform duration-500">
              <BarChart2 className="text-brand-600" size={28} />
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tighter block leading-none">GRAN MOLINO</span>
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-[0.3em] mt-1 block">Business Intelligence</span>
            </div>
          </div>

          {/* Core Pillars Info */}
          <div className="max-w-2xl">
            <h2 className="text-6xl font-black text-white leading-[1.1] mb-12 tracking-tight">
              Control centralizado <br/> 
              <span className="text-brand-500 italic">decisiones inteligentes.</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="group">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-white border border-white/20 mb-5 group-hover:bg-brand-600 transition-colors duration-300">
                  <LayoutDashboard size={24} />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-2 opacity-60">Módulos de Control</h3>
                <p className="text-slate-400 text-[13px] leading-relaxed font-medium">Gestión integral de procesos operativos y flujos de trabajo corporativos.</p>
              </div>
              <div className="group">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-white border border-white/20 mb-5 group-hover:bg-brand-600 transition-colors duration-300">
                  <BarChart2 size={24} />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-2 opacity-60">Dashboards BI</h3>
                <p className="text-slate-400 text-[13px] leading-relaxed font-medium">Visualización de KPIs en tiempo real para un análisis estratégico preciso.</p>
              </div>
              <div className="group">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-white border border-white/20 mb-5 group-hover:bg-brand-600 transition-colors duration-300">
                  <Database size={24} />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-2 opacity-60">Gestión de Datos</h3>
                <p className="text-slate-400 text-[13px] leading-relaxed font-medium">Administración segura de activos digitales y auditoría de información crítica.</p>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck size={16} className="text-brand-500" />
              <span>Infraestructura Segura Enterprise</span>
            </div>
            <div className="text-[10px] text-slate-600 font-medium">ver 2.4.0-prod</div>
          </div>
        </div>
      </div>

      {/* Lado Derecho: Formulario Institucional */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center p-10 sm:p-14 md:p-24 bg-white relative">
        <div className="w-full max-w-[380px] mx-auto animate-in fade-in slide-in-from-right-4 duration-700">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-4 mb-16">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-xl">
              <BarChart2 className="text-white" size={24} />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 tracking-tighter block leading-none">GRAN MOLINO</span>
              <span className="text-[9px] font-bold text-brand-600 uppercase tracking-widest mt-0.5 block">BI Platform</span>
            </div>
          </div>

          <div className="mb-14">
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Acceso Corporativo</h1>
            <p className="text-slate-500 font-medium leading-relaxed">Bienvenido a la plataforma de inteligencia. Por favor, identifíquese para continuar.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {error && (
              <div className="bg-red-50 border-l-[6px] border-red-500 p-5 flex items-start gap-4 animate-in shake-in duration-300">
                <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-sm font-black text-red-900 uppercase tracking-tight mb-1">Fallo de Autenticación</h4>
                  <p className="text-xs text-red-700 font-semibold">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Profesional</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none transition-colors" size={20} />
                <input
                  {...register('email')}
                  type="email"
                  className={`w-full bg-slate-50 border-2 border-slate-100 h-16 pl-14 pr-6 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-bold ${
                    errors.email ? 'border-red-200 bg-red-50' : ''
                  }`}
                  placeholder="usuario@empresa.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-600 mt-1.5 font-bold ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Contraseña</label>
                <a href="/forgot-password" disable-link-style="true" className="text-[11px] font-black text-brand-700 hover:text-brand-900 transition-colors uppercase tracking-widest">
                  Olvide mi clave
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none transition-colors" size={20} />
                <input
                  {...register('password')}
                  type="password"
                  className={`w-full bg-slate-50 border-2 border-slate-100 h-16 pl-14 pr-6 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-bold ${
                    errors.password ? 'border-red-200 bg-red-50' : ''
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-xs text-red-600 mt-1.5 font-bold ml-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-950 hover:bg-slate-900 text-white h-16 rounded-2xl font-black uppercase tracking-[0.1em] shadow-2xl shadow-slate-900/40 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema de Control</span>
                </>
              )}
            </button>
          </form>

          <footer className="absolute bottom-10 left-0 right-0 px-24 hidden lg:block">
            <div className="pt-8 border-t border-slate-100 flex items-center justify-between text-slate-400">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">&copy; {new Date().getFullYear()} Gran Molino S.A.</p>
              <div className="w-1 h-1 bg-slate-200 rounded-full" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Security Node: Active</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
