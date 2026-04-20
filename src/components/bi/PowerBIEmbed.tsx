"use client"

import { useEffect, useState, useMemo } from "react"
import { PowerBIEmbed as MicrosoftPowerBIEmbed } from "powerbi-client-react"
import { models } from "powerbi-client"
import { Loader2, ShieldAlert, BarChart2 } from "lucide-react"

interface PowerBIEmbedProps {
  resourceId: string
  refreshTrigger?: number
}

export function PowerBIEmbed({ resourceId, refreshTrigger }: PowerBIEmbedProps) {
  const [embedConfig, setEmbedConfig] = useState<any>(null)
  const [report, setReport] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch(`/api/bi/token/${resourceId}`)
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "No se pudo obtener el token")
        }
        const data = await response.json()
        setEmbedConfig(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchToken()
  }, [resourceId])

  const memoizedEmbedConfig = useMemo(() => ({
    type: "report",
    id: embedConfig?.reportId,
    embedUrl: embedConfig?.embedUrl,
    accessToken: embedConfig?.accessToken,
    tokenType: models.TokenType.Embed,
    settings: {
      panes: {
        filters: { visible: false },
        pageNavigation: { visible: true },
      },
      navContentPaneEnabled: true,
      background: models.BackgroundType.Transparent,
    },
  }), [embedConfig])

  const memoizedEventHandlers = useMemo(() => new Map([
    ["loaded", (event: any) => {
      console.log("Reporte cargado exitosamente")
      setReport(event.detail)
    }],
    ["error", (event: any) => console.error("Error en Power BI:", event?.detail)],
  ]), [])

  useEffect(() => {
    // Usamos reload() para un refresco visual completo si refreshTrigger cambia
    if (report && typeof report.reload === 'function' && refreshTrigger !== undefined && refreshTrigger > 0) {
      console.log("[PowerBIService] Recargando reporte...")
      report.reload().catch((err: any) => console.error("Error al recargar:", err))
    }
  }, [refreshTrigger, report])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
        <Loader2 className="animate-spin" size={40} />
        <p className="text-sm font-medium">Sincronizando con Power BI Cloud...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Error de Conexión</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-xs">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-white rounded-lg shadow-inner">
      <div className="absolute inset-0" style={{ marginTop: '-36px', height: 'calc(100% + 36px)' }}>
        <MicrosoftPowerBIEmbed
          embedConfig={memoizedEmbedConfig as any}
          eventHandlers={memoizedEventHandlers}
          cssClassName="w-full h-full border-0"
        />
      </div>
    </div>
  )

}
