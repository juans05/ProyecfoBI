import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | Intranet Empresarial',
    default: 'Intranet Empresarial',
  },
  description: 'Plataforma interna de inteligencia de negocios y gestión empresarial',
  robots: 'noindex, nofollow', // Es intranet, nunca indexar
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
