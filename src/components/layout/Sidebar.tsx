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
  FileText,
  Shield,
  Menu,
  ChevronLeft
} from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useState, useEffect } from 'react'

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
  companyData: any
}

export function Sidebar({ menuData, user, companyData }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Persistir estado en localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed') === 'true'
    setIsCollapsed(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed.toString())
    // Comunicar al layout mediante una clase en el body o contenedor
    if (isCollapsed) {
      document.querySelector('.intranet-layout')?.classList.add('sidebar-collapsed')
    } else {
      document.querySelector('.intranet-layout')?.classList.remove('sidebar-collapsed')
    }
  }, [isCollapsed])

  const displayName = companyData?.tradeName || companyData?.name || "Intranet BI"
  const logoUrl = companyData?.logoUrl 
    ? `${companyData.logoUrl}?t=${new Date(companyData.updatedAt).getTime()}` 
    : null

  return (
    <aside 
      className={cn("intranet-sidebar border-r border-slate-800", isCollapsed && "w-[80px]")}
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        color: 'var(--sidebar-text)',
        borderColor: 'rgba(255,255,255,0.1)'
      }}
    >
      <div className="sidebar-logo justify-between px-4">
        <div className="flex items-center">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-brand-600/30 overflow-hidden shrink-0"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <BarChart2 className="text-white" size={18} />
            )}
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold text-white tracking-tight truncate animate-in fade-in duration-300">
              {displayName}
            </span>
          )}
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
        >
          {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="space-y-6">
          {/* Dynamic Modules */}
          {menuData.map((mod) => (
            <div key={mod.id}>
              {!isCollapsed && <div className="sidebar-nav-group animate-in fade-in duration-300">{mod.name}</div>}
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
                        isCollapsed && "justify-center px-0",
                        isActive && "active"
                      )}
                      style={{
                        color: isActive ? 'white' : 'var(--sidebar-text)',
                        backgroundColor: isActive ? 'var(--brand-primary)' : 'transparent'
                      }}
                      title={isCollapsed ? res.name : undefined}
                    >
                      <Icon size={18} className="shrink-0" />
                      {!isCollapsed && <span className="flex-1 truncate animate-in fade-in duration-300">{res.name}</span>}
                      {isActive && !isCollapsed && <ChevronRight size={14} className="opacity-60" />}
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
          className={cn(
            "sidebar-nav-item text-red-400 hover:bg-red-500/10 hover:text-red-300",
            isCollapsed && "justify-center px-0"
          )}
          title={isCollapsed ? "Cerrar Sesión" : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && <span className="animate-in fade-in duration-300">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  )
}
