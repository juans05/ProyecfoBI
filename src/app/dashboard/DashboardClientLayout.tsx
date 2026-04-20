"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { BranchSwitcher } from "@/components/layout/BranchSwitcher"
import { UserCircle, Bell, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { clsx } from "clsx"

interface DashboardClientLayoutProps {
  children: React.ReactNode
  session: any
  menuData: any[]
  companyData: any
}

export function DashboardClientLayout({ 
  children, 
  session, 
  menuData, 
  companyData 
}: DashboardClientLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <div 
      className={clsx(
        "intranet-layout bg-slate-50",
        isMobileMenuOpen && "mobile-open"
      )}
      style={{
        '--brand-primary': companyData?.primaryColor || '#2563eb',
        '--text-secondary': companyData?.secondaryColor || '#64748b',
        '--sidebar-bg': companyData?.sidebarBgColor || '#0f172a',
        '--sidebar-text': companyData?.sidebarTextColor || '#94a3b8',
      } as React.CSSProperties}
    >
      <Sidebar 
        menuData={menuData} 
        user={session.user} 
        companyData={companyData} 
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      <main className="intranet-main">
        <header className="intranet-header justify-between">
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <h2 className="text-lg font-semibold text-slate-800 hidden lg:block">Panel de Control</h2>
            <div className="h-6 w-px bg-slate-200 hidden lg:block" />
            <BranchSwitcher />
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors hidden sm:block">
              <Bell size={20} />
            </button>
            
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900 leading-none">{session.user.name}</p>
                <p className="text-xs text-slate-500 mt-1">{session.user.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm">
                <UserCircle size={22} />
              </div>
            </div>
          </div>
        </header>
        
        <div className="intranet-content bg-slate-50/50">
          {children}
        </div>
      </main>
    </div>
  )
}
