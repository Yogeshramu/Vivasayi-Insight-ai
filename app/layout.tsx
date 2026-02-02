import './globals.css'
import { Inter } from 'next/font/google'
import Navigation from '@/components/Navigation'

import AuthProvider from '@/components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Farmer AI Support System',
  description: 'Multimodal AI system for farmer support with crop analysis, chatbot, and weather recommendations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="container mx-auto px-4 pt-4 pb-24 md:py-8">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}