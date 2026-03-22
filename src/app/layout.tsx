import type { Metadata } from 'next'
import Providers from './providers'
import '@/styles/globals.css'

export const metadata: Metadata = { title: 'RestaurantOS', description: 'Multi-tenant restaurant ordering' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
