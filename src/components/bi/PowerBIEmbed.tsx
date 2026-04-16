"use client"

import { useEffect, useState } from "react"
import { PowerBIEmbed as MicrosoftPowerBIEmbed } from "powerbi-client-react"
import { models } from "powerbi-client"
import { Loader2, ShieldAlert, BarChart2 } from "lucide-react"

interface PowerBIEmbedProps {
  resourceId: string
}

export function PowerBIEmbed({ resourceId }: PowerBIEmbedProps) {
  const [embedConfig, setEmbedConfig] = useState<any>(null)
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
    <MicrosoftPowerBIEmbed
      embedConfig={{
        type: "report",
        id: embedConfig.reportId,
        embedUrl: embedConfig.embedUrl,
        accessToken: embedConfig.accessToken,
        tokenType: models.TokenType.Embed,
        settings: {
          panes: {
            filters: { visible: false },
            pageNavigation: { visible: true },
          },
          navContentPaneEnabled: true,
          background: models.BackgroundType.Transparent,
        },
      }}
      eventHandlers={
        new Map([
          ["loaded", () => console.log("Reporte cargado exitosamente")],
          ["error", (event) => console.error("Error en Power BI:", event?.detail)],
        ])
      }
      cssClassName="w-full h-full border-0 absolute inset-0"
    />
  )
}
