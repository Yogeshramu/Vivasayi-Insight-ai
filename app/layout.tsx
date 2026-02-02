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
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}