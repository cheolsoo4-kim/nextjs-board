'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  DocumentTextIcon, 
  BookOpenIcon,
  CheckCircleIcon,
  UsersIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const navigation = [
    { name: '홈', href: '/', icon: HomeIcon },
    { name: '게시판', href: '/boards', icon: DocumentTextIcon },
    { name: '방명록', href: '/guestbook', icon: BookOpenIcon },
    { name: 'Todo', href: '/todos', icon: CheckCircleIcon },
    ...(user?.role === 'admin' ? [{ name: '관리자', href: '/admin', icon: UsersIcon }] : []),
  ]

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">My Board</h1>
<button onClick={() => setSidebarOpen(false)}>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
<nav className="flex-1 px-4 py-4">
            <SidebarNav navigation={navigation} pathname={pathname} />
          </nav>
        </div>
</div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col border-r border-gray-200 bg-white pt-5 pb-4">
          <div className="flex items-center px-4">
            <h1 className="text-xl font-bold text-gray-900">My Board</h1>
</div>
          <nav className="mt-8 flex-1 px-4">
            <SidebarNav navigation={navigation} pathname={pathname} />
          </nav>
        </div>
</div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">안녕하세요, {user.name}님</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/auth/login" className="text-sm text-blue-600 hover:text-blue-800">
                    로그인
                  </Link>
                  <Link href="/auth/register" className="text-sm text-green-600 hover:text-green-800">
                    회원가입
                  </Link>
                </div>
              )}
            </div>
</div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
</div>
  )
}

function SidebarNav({ navigation, pathname }: { navigation: any[]; pathname: string }) {
  return (
    <ul className="space-y-2">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <li key={item.name}>
            <Link
              href={item.href}
              className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
