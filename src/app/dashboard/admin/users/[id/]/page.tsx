import { UserForm } from "@/components/admin/UserForm"
import { getProfiles } from "@/domains/profiles/profiles.service"
import { prisma } from "@/lib/prisma"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: PageProps) {
  const { id } = params
  
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profiles: true
    }
  })

  if (!user) return notFound()

  const profiles = await getProfiles()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/admin/users" 
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Usuario</h1>
          <p className="text-slate-500 text-sm">Actualiza la información o los permisos de {user.firstName}.</p>
        </div>
      </div>

      <UserForm initialData={user} profiles={profiles} />
    </div>
  )
}
