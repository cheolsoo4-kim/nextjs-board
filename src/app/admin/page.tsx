'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import AdminStats from '@/components/admin/AdminStats'
import UserManagement from '@/components/admin/UserManagement'
import BoardManagement from '@/components/admin/BoardManagement'
import GuestbookManagement from '@/components/admin/GuestbookManagement'

type TabType = 'dashboard' | 'users' | 'boards' | 'guestbook'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        if (userData.role !== 'admin') {
          router.push('/')
          return
        }
        setUser(userData)
      } else {
        router.push('/auth/login')
      }
    } catch (error) {
      router.push('/auth/login')
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'dashboard', name: '대시보드', icon: '📊' },
    { id: 'users', name: '사용자 관리', icon: '👥' },
    { id: 'boards', name: '게시판 관리', icon: '📝' },
    { id: 'guestbook', name: '방명록 관리', icon: '📖' },
  ]

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
</div>
      </Layout>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-red-400 text-6xl mb-4">🚫</div>
<h2 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h2>
<p className="text-gray-600">관리자만 접근할 수 있는 페이지입니다.</p>
        </div>
</Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">👨‍💼 관리자 패널</h1>
<p className="text-gray-600">사이트 전체를 관리하고 모니터링하세요</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
<div className="p-6">
            {activeTab === 'dashboard' && <AdminStats />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'boards' && <BoardManagement />}
            {activeTab === 'guestbook' && <GuestbookManagement />}
          </div>
</div>
      </div>
</Layout>
  )
}
