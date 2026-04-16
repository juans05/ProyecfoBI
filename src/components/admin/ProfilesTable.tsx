"use client"

import { DataTable } from "@/components/shared/DataTable"
import { Shield, Key, Users } from "lucide-react"
import Link from "next/link"

interface ProfilesTableProps {
  profiles: any[]
}

export function ProfilesTable({ profiles }: ProfilesTableProps) {
  const columns = [
    {
      header: 'Perfil',
      accessor: (profile: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm">
            <Shield size={18} />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{profile.name}</p>
            <p className="text-xs text-slate-500 truncate max-w-[200px]">{profile.description || 'Sin descripción'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Usuarios',
      accessor: (profile: any) => (
        <div className="flex items-center gap-2 text-slate-600">
          <Users size={14} />
          <span className="text-sm font-medium">{profile._count.users} usuarios</span>
        </div>
      )
    },
    {
      header: 'Estado',
      accessor: (profile: any) => (
        profile.isActive 
          ? <span className="badge-green">Activo</span> 
          : <span className="badge-red">Inactivo</span>
      )
    },
    {
        header: 'Acciones',
        className: 'text-right',
        accessor: (profile: any) => (
            <Link 
                href={`/dashboard/admin/profiles/${profile.id}/permissions`}
                className="btn-secondary h-8 py-0 px-3 text-xs flex items-center gap-2"
            >
                <Key size={14} />
                Permisos
            </Link>
        )
    }
  ]

  return (
    <DataTable 
      columns={columns as any}
      data={profiles}
      searchKey="name"
      searchPlaceholder="Buscar perfil..."
    />
  )
}
