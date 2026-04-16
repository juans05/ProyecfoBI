"use client"

import { DataTable } from "@/components/shared/DataTable"
import { toggleUserStatus } from "@/domains/users/users.service"
import { Users, UserCircle, Edit2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface UsersTableProps {
  users: any[]
}

export function UsersTable({ users }: UsersTableProps) {
  const router = useRouter()
  
  const columns = [
    // ... (rest of columns remain the same)
  ]

  return (
    <DataTable 
      columns={columns as any}
      data={users}
      searchKey="email"
      searchPlaceholder="Buscar por email..."
      onToggleStatus={toggleUserStatus}
      onEdit={(user) => router.push(`/dashboard/admin/users/${user.id}`)}
    />
  )
}
