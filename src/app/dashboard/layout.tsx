import { Sidebar } from "@/components/layout/Sidebar"
import { BranchSwitcher } from "@/components/layout/BranchSwitcher"
import { UserCircle, Bell } from "lucide-react"
import { auth } from "@/auth"
import { NavigationService } from "@/domains/navigation/navigation.service"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  // Leer sede activa de cookies o usar la primaria
  const cookieStore = cookies()
  const activeBranchId = cookieStore.get('activeBranchId')?.value || (session.user as any).activeBranchId

  // Sincronizar sede activa en el objeto de sesión para componentes de cliente
  if (session.user) {
    ;(session.user as any).activeBranchId = activeBranchId
  }

  // Cargar menú: Si es Root sin empresa, cargar menú de sistema. Si tiene empresa, cargar menú de empresa.
  const companyId = (session.user as any).companyId
  const isRoot = (session.user as any).isRoot

  let menuData = []
  let companyData = null

  if (isRoot && !companyId) {
    // Menú de Sistema para Root
    menuData = [
      {
        id: 'root-mgmt',
        name: 'Sistemas',
        icon: 'Shield',
        resources: [
          { id: 'companies', name: 'Gestión de Empresas', type: 'PAGE', href: '/dashboard/root/companies' },
          { id: 'system-logs', name: 'Logs Globales', type: 'PAGE', href: '/dashboard/root/logs' },
        ]
      }
    ]
  } else if (companyId) {
    const [fetchedMenuData, fetchedCompanyData] = await Promise.all([
      NavigationService.getMenuData(session.user.id, companyId, activeBranchId),
      prisma.company.findUnique({
        where: { id: companyId },
        select: { 
          name: true, 
          tradeName: true, 
          logoUrl: true,
          primaryColor: true,
          secondaryColor: true,
          sidebarBgColor: true,
          sidebarTextColor: true,
          updatedAt: true
        }
      })
    ])
    menuData = fetchedMenuData
    companyData = fetchedCompanyData
  }

  return (
    <div 
      className="intranet-layout bg-slate-50"
      style={{
        '--brand-primary': companyData?.primaryColor || '#2563eb',
        '--text-secondary': companyData?.secondaryColor || '#64748b',
        '--sidebar-bg': companyData?.sidebarBgColor || '#0f172a',
        '--sidebar-text': companyData?.sidebarTextColor || '#94a3b8',
      } as React.CSSProperties}
    >
      <Sidebar menuData={menuData} user={session.user} companyData={companyData} />
      
      <main className="intranet-main">
        <header className="intranet-header justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-semibold text-slate-800 hidden lg:block">Panel de Control</h2>
            <div className="h-6 w-px bg-slate-200 hidden lg:block" />
            <BranchSwitcher />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
            </button>
            
            <div className="h-8 w-px bg-slate-200" />
            
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900 leading-none">{session.user.name}</p>
                <p className="text-xs text-slate-500 mt-1">{session.user.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                <UserCircle size={24} />
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
