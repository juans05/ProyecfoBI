"use client"

import { useState, useTransition } from "react"
import { useSession } from "next-auth/react"
import { MapPin, ChevronDown, Check, Loader2 } from "lucide-react"
import { setActiveBranchAction } from "@/domains/navigation/branch.actions"
import { cn } from "@/lib/utils"

export function BranchSwitcher() {
  const { data: session } = useSession()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  const branches = (session?.user as any)?.branches || []
  const activeBranchId = (session?.user as any)?.activeBranchId
  const activeBranch = branches.find((b: any) => b.id === activeBranchId) || branches[0]

  const handleSelect = (branchId: string) => {
    if (branchId === activeBranchId) return
    
    startTransition(async () => {
      await setActiveBranchAction(branchId)
      setIsOpen(false)
      // Recargar la página para que el servidor use la nueva cookie
      window.location.reload()
    })
  }

  if (branches.length <= 1) return null

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-brand-300 transition-colors text-slate-700"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} className="text-brand-600" />}
        <div className="text-left hidden md:block">
          <p className="text-[10px] uppercase font-bold text-slate-400 leading-none">Sede Activa</p>
          <p className="text-xs font-semibold leading-tight">{activeBranch?.name}</p>
        </div>
        <ChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2 border-b border-slate-100 bg-slate-50/50">
              <p className="text-[10px] font-bold text-slate-500 uppercase px-3 py-1">Cambiar de Sede</p>
            </div>
            <div className="p-1">
              {branches.map((b: any) => (
                <button
                  key={b.id}
                  onClick={() => handleSelect(b.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.2 rounded-lg text-sm transition-colors",
                    b.id === activeBranchId 
                      ? "bg-brand-50 text-brand-700 font-medium" 
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        b.id === activeBranchId ? "bg-brand-500" : "bg-slate-300"
                    )} />
                    {b.name}
                  </div>
                  {b.id === activeBranchId && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
