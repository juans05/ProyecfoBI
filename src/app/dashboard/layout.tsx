import { Sidebar } from "@/components/layout/Sidebar"
import { auth } from "@/auth"
import { NavigationService } from "@/domains/navigation/navigation.service"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { DashboardClientLayout } from "./DashboardClientLayout"

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

  let menuData: any[] = []
  let companyData: any = null

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
      NavigationService.getMenuData(session.user.id!, companyId, activeBranchId),
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
    <DashboardClientLayout 
      session={session} 
      menuData={menuData} 
      companyData={companyData}
    >
      {children}
    </DashboardClientLayout>
  )
}
