'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, ChatBubbleLeftRightIcon, CameraIcon, BeakerIcon, CloudIcon, ArrowRightOnRectangleIcon, UserIcon } from '@heroicons/react/24/outline'
import { useSession, signOut } from 'next-auth/react'

export default function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const navItems = [
    { href: '/', label: 'Home', labelTamil: 'முகப்பு', icon: HomeIcon },
    { href: '/chat', label: 'Chat', labelTamil: 'அரட்டை', icon: ChatBubbleLeftRightIcon },
    { href: '/crop-analysis', label: 'Crop', labelTamil: 'பயிர்', icon: CameraIcon },
    { href: '/soil-prediction', label: 'Soil', labelTamil: 'மண்', icon: BeakerIcon },
    { href: '/weather', label: 'Weather', labelTamil: 'வானிலை', icon: CloudIcon },
  ]

  return (
    <>
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 shrink-0">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-semibold text-gray-900 hidden xs:block">Farmer Support</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center px-3 py-1 rounded-lg text-[10px] transition-colors ${isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                  >
                    <Icon className="w-5 h-5 mb-0.5" />
                    <span>{item.label}</span>
                    <span className="font-tamil opacity-75">{item.labelTamil}</span>
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center space-x-2 sm:border-l sm:pl-4 sm:ml-4">
              {session ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[100px]">{session.user?.name || 'Farmer User'}</p>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="text-xs text-red-600 hover:underline flex items-center justify-end"
                    >
                      Logout
                    </button>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 shrink-0">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="sm:hidden text-gray-600 p-1"
                    title="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span className="hidden xs:block">Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 px-2 py-1 pb-safe flex justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive
                ? 'text-primary-600'
                : 'text-gray-500'
                }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}