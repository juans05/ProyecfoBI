import { auth } from "@/auth"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  ShieldCheck
} from "lucide-react"

import { WelcomeView } from "@/components/dashboard/WelcomeView"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) return null

  const isRoot = (session.user as any).isRoot
  const profiles = (session.user as any).profiles || []
  const isAdmin = isRoot || profiles.includes('Administrador')
  
  const companyName = (session.user as any).companyName

  if (!isAdmin) {
    return <WelcomeView userName={session.user.name!} companyName={companyName} />
  }

  const stats = [
    { name: isRoot ? 'Empresas Totales' : 'Ventas Totales', value: isRoot ? '1' : '$124,592', icon: isRoot ? Building2 : BarChart3, trend: '+12.5%', isUp: true },
    { name: 'Nuevos Usuarios', value: '148', icon: Users, trend: '+4.3%', isUp: true },
    { name: 'Consultas Hoy', value: '1,024', icon: Calendar, trend: '-2.1%', isUp: false },
    { name: 'Conversión', value: '3.2%', icon: TrendingUp, trend: '+0.8%', isUp: true },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            {isRoot ? (
              <>
                <ShieldCheck size={28} className="text-amber-500" />
                Administración Global
              </>
            ) : (
              <>
                <Building2 size={28} className="text-brand-600" />
                {companyName} — Overview
              </>
            )}
          </h1>
          <p className="text-slate-500 mt-1">
            {isRoot 
              ? "Bienvenido al panel maestro del sistema SaaS." 
              : `Gestionando el rendimiento de ${companyName}.`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card p-6 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${stat.isUp ? 'text-emerald-600' : 'text-red-600'}`}>
                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.trend}
                <span className="text-slate-400 font-normal ml-1">vs mes anterior</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg text-brand-600 border border-slate-100">
              <stat.icon size={22} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placeholder for Main Chart */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="font-semibold text-slate-800">Tendencia de Ingresos</h3>
            <button className="text-xs text-brand-600 font-medium hover:underline">Ver detalles</button>
          </div>
          <div className="card-body h-[300px] flex items-center justify-center bg-slate-50/30">
            <div className="text-center">
              <BarChart3 className="mx-auto text-slate-200 mb-2" size={48} />
              <p className="text-slate-400 text-sm">Visualización de Power BI cargando...</p>
            </div>
          </div>
        </div>

        {/* Placeholder for Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-slate-800">Actividad Reciente</h3>
          </div>
          <div className="card-body p-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                  <UserCircle size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 leading-tight">Acceso detectado</p>
                  <p className="text-xs text-slate-500">Hace {i * 10} minutos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function UserCircle({ size }: { size: number }) {
  return <Users size={size} /> // Placeholder
}
