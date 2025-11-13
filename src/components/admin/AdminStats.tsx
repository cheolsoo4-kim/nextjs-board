'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Stats {
  users: {
    total: number
    active: number
    admins: number
    recent: any[]
  }
  posts: {
    total: number
    recent: any[]
  }
  guestbook: {
    total: number
    pending: number
    recent: any[]
  }
  todos: {
    total: number
    completed: number
  }
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
</div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">통계를 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">총 사용자</p>
              <p className="text-3xl font-bold">{stats.users.total}</p>
              <p className="text-blue-100 text-sm mt-1">관리자 {stats.users.admins}명</p>
            </div>
<div className="text-4xl opacity-80">👥</div>
</div>
        </div>
<div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">총 게시물</p>
              <p className="text-3xl font-bold">{stats.posts.total}</p>
            </div>
<div className="text-4xl opacity-80">📝</div>
</div>
        </div>
<div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">방명록</p>
              <p className="text-3xl font-bold">{stats.guestbook.total}</p>
              <p className="text-purple-100 text-sm mt-1">대기 {stats.guestbook.pending}개</p>
            </div>
<div className="text-4xl opacity-80">📖</div>
</div>
        </div>
<div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">완료된 Todo</p>
              <p className="text-3xl font-bold">{stats.todos.completed}</p>
              <p className="text-orange-100 text-sm mt-1">전체 {stats.todos.total}개</p>
            </div>
<div className="text-4xl opacity-80">✅</div>
</div>
        </div>
</div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 가입 사용자</h3>
<div className="space-y-3">
            {stats.users.recent.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {user.name.charAt(0)}
                    </span>
                  </div>
<div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
</div>
                <div className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(user.createdAt), { locale: ko, addSuffix: true })}
                </div>
</div>
            ))}
          </div>
</div>

        {/* Recent Posts */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 게시물</h3>
<div className="space-y-3">
            {stats.posts.recent.map((post: any) => (
              <div key={post.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">{post.authorName}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(post.createdAt), { locale: ko, addSuffix: true })}
                  </p>
                </div>
</div>
            ))}
          </div>
</div>
      </div>

      {/* Recent Guestbook */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 방명록</h3>
<div className="space-y-4">
          {stats.guestbook.recent.map((entry: any) => (
            <div key={entry.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{entry.name}</span>
                  {!entry.isApproved && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                      승인대기
                    </span>
                  )}
                </div>
<span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(entry.createdAt), { locale: ko, addSuffix: true })}
                </span>
              </div>
<p className="text-gray-700 text-sm">{entry.message}</p>
            </div>
          ))}
        </div>
</div>
    </div>
  )
}
