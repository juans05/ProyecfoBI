import { LayoutGrid } from "lucide-react"

export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-300">
        <LayoutGrid size={24} />
      </div>
      <div className="space-y-2 text-center">
        <div className="h-4 w-32 bg-slate-200 rounded mx-auto"></div>
        <div className="h-3 w-48 bg-slate-100 rounded mx-auto"></div>
      </div>
      
      <div className="w-full max-w-4xl mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-50">
        <div className="h-32 bg-slate-100 rounded-2xl border border-slate-200"></div>
        <div className="h-32 bg-slate-100 rounded-2xl border border-slate-200"></div>
        <div className="h-32 bg-slate-100 rounded-2xl border border-slate-200"></div>
      </div>
    </div>
  )
}
