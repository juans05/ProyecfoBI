"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  BarChart2, 
  Settings, 
  Users, 
  UserCircle,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Database,
  FileText
} from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

const iconMap: Record<string, any> = {
  Settings,
  Users,
  BarChart2,
  Database,
  FileText,
  LayoutDashboard
}

interface SidebarProps {
  menuData: any[]
  user: any
}

export function Sidebar({ menuData, user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="intranet-sidebar border-r border-slate-800">
      <div className="sidebar-logo">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center mr-3 shadow-lg shadow-brand-600/30">
          <BarChart2 className="text-white" size={18} />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">Intranet BI</span>
      </div>

      <nav className="sidebar-nav">
        <div className="space-y-6">
          {/* Main Link */}
          <div>
            <Link
              href="/dashboard"
              className={cn(
                "sidebar-nav-item",
                pathname === "/dashboard" && "active"
              )}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Dynamic Modules */}
          {menuData.map((mod) => (
            <div key={mod.id}>
              <div className="sidebar-nav-group">{mod.name}</div>
              <div className="space-y-1">
                {mod.resources.map((res: any) => {
                  const Icon = iconMap[mod.icon || 'FileText'] || FileText
                  const isActive = pathname === res.href

                  return (
                    <Link
                      key={res.id}
                      href={res.href}
                      className={cn(
                        "sidebar-nav-item",
                        isActive && "active"
                      )}
                    >
                      <Icon size={18} />
                      <span className="flex-1">{res.name}</span>
                      {isActive && <ChevronRight size={14} className="opacity-60" />}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={() => signOut()}
          className="sidebar-nav-item text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}
