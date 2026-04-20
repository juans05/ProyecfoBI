
"use client"

import { useState } from "react"
import { BarChart2, Maximize2, RefreshCw } from "lucide-react"
import { PowerBIEmbed } from "@/components/bi/PowerBIEmbed"

interface BIReportConfigProps {
  resource: any
}

export function BIReportView({ resource }: BIReportConfigProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleFullscreen = () => {
    const element = document.querySelector('.pbi-container')
    if (element?.requestFullscreen) {
      element.requestFullscreen()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height)-2rem)] space-y-3 animate-in fade-in duration-500">
      {/* Header del Reporte */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 pt-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-50 rounded-lg" style={{ color: 'var(--brand-primary)' }}>
            <BarChart2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span style={{ color: 'var(--text-secondary)' }}>{resource.module.name}</span>
              <span style={{ color: 'var(--text-secondary)' }}>/</span>
              <span style={{ color: 'var(--text-secondary)' }}>Reporte BI</span>
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--brand-primary)' }}>{resource.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            className="btn-secondary h-9 text-xs"
          >
            <RefreshCw size={14} className="mr-2" />
            Actualizar
          </button>
          <button 
            onClick={handleFullscreen}
            className="btn-secondary h-9 text-xs"
          >
            <Maximize2 size={14} className="mr-2" />
            Fullscreen
          </button>
        </div>
      </div>

      {/* Contenedor del Reporte */}
      <div className="flex-1 bg-white border-y border-slate-200 shadow-sm overflow-hidden relative min-h-[500px] pbi-container">
        <PowerBIEmbed resourceId={resource.id} refreshTrigger={refreshTrigger} />
      </div>

      {/* Footer / Nota */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-6 pb-3">
        <p>Resource ID: {resource.id}</p>
        <p>Integración Segura GranMolino — Power BI Embedded</p>
      </div>
    </div>
  )
}
