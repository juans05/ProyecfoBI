"use client"

import { useState } from "react"
import { DataTable } from "@/components/shared/DataTable"
import { toggleUserStatus } from "@/domains/users/users.service"
import { Users, UserCircle, Edit2, X, Shield } from "lucide-react"
import { UserForm } from "@/components/admin/UserForm"

interface UsersTableProps {
  companyId: string
  users: any[]
  profiles: any[]
}

export function UsersTable({ companyId, users, profiles }: UsersTableProps) {
  const [editingUser, setEditingUser] = useState<any | null>(null)
  
  const columns = [
    {
      header: 'Usuario',
      accessor: (user: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
            <UserCircle size={20} />
          </div>
          <div>
            <p className="font-medium text-slate-900">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Perfiles',
      accessor: (user: any) => (
        <div className="flex flex-wrap gap-1">
          {user.profiles && user.profiles.length > 0 ? (
            user.profiles.map((p: any) => (
              <span key={p.profileId} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                {p.profile.name}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-slate-400 italic">Sin perfil</span>
          )}
        </div>
      )
    },
    {
      header: 'Estado',
      accessor: (user: any) => (
        user.isActive 
          ? <span className="badge-green">Activo</span> 
          : <span className="badge-red">Inactivo</span>
      )
    }
  ]

  return (
    <>
      <DataTable 
        columns={columns as any}
        data={users}
        searchKey="email"
        searchPlaceholder="Buscar por email..."
        onToggleStatus={(user) => toggleUserStatus(user, companyId)}
        onEdit={(user) => setEditingUser(user)}
      />

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md p-4 px-6 border-b border-slate-200 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                  <Shield size={20} />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Editar Usuario</h3>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                title="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <UserForm 
                companyId={companyId}
                initialData={editingUser} 
                profiles={profiles} 
                onSuccess={() => setEditingUser(null)}
                onCancel={() => setEditingUser(null)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
