"use client"

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginSchema, type LoginInput } from '@/domains/auth/auth.schema'
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react'
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
        setError('Email o contraseña incorrectos')
        toast.error('Error de acceso')
      } else {
        toast.success('¡Bienvenido!')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Ocurrió un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-800/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-[420px] p-6 z-10">
        <div className="card bg-slate-900/40 backdrop-blur-xl border-slate-800 shadow-2xl p-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Intranet BI</h1>
            <p className="text-slate-400">Panel de Control Empresarial</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-3 text-sm">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div>
              <label className="label text-slate-300">Email Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  {...register('email')}
                  type="email"
                  className={`input bg-slate-800/50 border-slate-700 text-white pl-11 ${
                    errors.email ? 'border-red-500 bg-red-500/5' : 'focus:border-brand-500'
                  }`}
                  placeholder="nombre@empresa.com"
                />
              </div>
              {errors.email && <p className="error-msg">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label text-slate-300 mb-0">Contraseña</label>
                <a href="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  {...register('password')}
                  type="password"
                  className={`input bg-slate-800/50 border-slate-700 text-white pl-11 ${
                    errors.password ? 'border-red-500 bg-red-500/5' : 'focus:border-brand-500'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="error-msg">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 shadow-lg shadow-brand-600/20 disabled:bg-brand-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Ingresando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500">
              Corporatoin &copy; {new Date().getFullYear()} — Plataforma de Inteligencia de Negocios
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
