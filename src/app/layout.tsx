import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Toaster } from 'sonner'

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
      <body>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  )
}
