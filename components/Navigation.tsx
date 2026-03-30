'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon, ChatBubbleLeftRightIcon, CameraIcon,
  BeakerIcon, CloudIcon, ArrowRightOnRectangleIcon, UserCircleIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeSolid, ChatBubbleLeftRightIcon as ChatSolid,
  CameraIcon as CameraSolid, BeakerIcon as BeakerSolid, CloudIcon as CloudSolid
} from '@heroicons/react/24/solid'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

const navItems = [
  { href: '/',                label: 'Home',    icon: HomeIcon,                  iconSolid: HomeSolid },
  { href: '/chat',            label: 'Chat',    icon: ChatBubbleLeftRightIcon,   iconSolid: ChatSolid },
  { href: '/crop-analysis',   label: 'Leaf',    icon: CameraIcon,                iconSolid: CameraSolid },
  { href: '/soil-prediction', label: 'Soil',    icon: BeakerIcon,                iconSolid: BeakerSolid },
  { href: '/weather',         label: 'Weather', icon: CloudIcon,                 iconSolid: CloudSolid },
]

export default function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <>
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md group-hover:shadow-primary-500/30 transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C7 3 3 7.5 3 12s4 9 9 9 9-4 9-9c0-1-.2-2-.5-3M15 5l2 2-2 2M17 7h4" />
              </svg>
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="font-bold text-gray-900 text-[15px]">AgriPulse <span className="text-primary-600">AI</span></p>
              <p className="text-[10px] text-gray-400 font-tamil">விவசாய உதவியாளர்</p>
            </div>
          </Link>

          {/* Desktop Nav Pills */}
          <div className="hidden md:flex items-center bg-gray-100/80 rounded-2xl p-1 gap-0.5">
            {navItems.map(({ href, label, icon: Icon, iconSolid: IconSolid }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  scroll={false}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-primary-700 shadow-sm shadow-gray-200'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'
                  }`}
                >
                  {isActive
                    ? <IconSolid className="w-4 h-4 text-primary-600" />
                    : <Icon className="w-4 h-4" />
                  }
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2 shrink-0">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center">
                    <UserCircleIcon className="w-5 h-5 text-primary-700" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {session.user?.name?.split(' ')[0] || 'Farmer'}
                  </span>
                  <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800 truncate">{session.user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors mt-1"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-primary-500/20"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>

        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-200/60 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex justify-around items-center px-2 py-2">
          {navItems.map(({ href, label, icon: Icon, iconSolid: IconSolid }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                scroll={false}
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all"
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary-100' : ''}`}>
                  {isActive
                    ? <IconSolid className="w-5 h-5 text-primary-600" />
                    : <Icon className="w-5 h-5 text-gray-400" />
                  }
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-primary-600' : 'text-gray-400'}`}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
