import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ModuleManagementClient } from "@/components/admin/ModuleManagementClient"

export default async function ModulesAdminPage() {
  const session = await auth()
  const companyId = (session?.user as any)?.companyId

  if (!companyId) {
    redirect("/dashboard")
  }

  const modules = await prisma.module.findMany({
    where: { companyId },
    include: {
      resources: {
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { order: 'asc' }
  })

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ModuleManagementClient initialModules={modules} />
    </div>
  )
}
