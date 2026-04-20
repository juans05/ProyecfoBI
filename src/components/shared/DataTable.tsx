"use client"

import { useState } from "react"
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle
} from "lucide-react"

interface Column<T> {
  header: string
  accessor: keyof T | ((item: T) => React.ReactNode)
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onToggleStatus?: (item: T) => void
  searchPlaceholder?: string
  searchKey: keyof T
}

export function DataTable<T extends { id: string, isActive?: boolean }>({
  columns,
  data,
  onEdit,
  onDelete,
  onToggleStatus,
  searchPlaceholder = "Buscar...",
  searchKey
}: DataTableProps<T>) {
  const [search, setSearch] = useState("")

  const filteredData = data.filter((item) => {
    const value = item[searchKey]
    if (typeof value === "string") {
      return value.toLowerCase().includes(search.toLowerCase())
    }
    return true
  })

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10 bg-white border-slate-200"
        />
      </div>

      {/* Table Container */}
      <div className="table-wrapper bg-white shadow-sm overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={col.className}>{col.header}</th>
              ))}
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-10 text-center text-slate-500">
                  No se encontraron resultados
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id}>
                  {columns.map((col, i) => (
                    <td key={i} className={col.className}>
                      {typeof col.accessor === "function" 
                        ? col.accessor(item) 
                        : (item[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                  <td className="text-right">
                    <div className="flex justify-end gap-3">
                      {onToggleStatus && (
                        <div className="relative group">
                          <button 
                            onClick={() => onToggleStatus(item)}
                            className={`p-1.5 rounded-md transition-colors ${
                              item.isActive 
                                ? "text-emerald-600 hover:bg-emerald-50" 
                                : "text-red-400 hover:bg-red-50"
                            }`}
                          >
                            {item.isActive ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                          </button>
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-50">
                            {item.isActive ? "Desactivar" : "Activar"}
                          </span>
                        </div>
                      )}
                      {onEdit && (
                        <div className="relative group">
                          <button 
                            onClick={() => onEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-50">
                            Editar
                          </span>
                        </div>
                      )}
                      {onDelete && (
                        <div className="relative group">
                          <button 
                            onClick={() => onDelete(item)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-50">
                            Eliminar
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
