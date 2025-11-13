'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { 
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface GuestbookEntry {
  id: number
  name: string
  email?: string
  message: string
  isApproved: boolean
  createdAt: string
}

export default function GuestbookManagement() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<GuestbookEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchEntries()
  }, [])

  useEffect(() => {
    filterEntries()
  }, [entries, searchQuery, statusFilter])

  const fetchEntries = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/guestbook')
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } catch (error) {
      console.error('Failed to fetch guestbook entries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterEntries = () => {
    let filtered = entries

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(entry => 
        entry.name.toLowerCase().includes(query) ||
        entry.message.toLowerCase().includes(query) ||
        (entry.email && entry.email.toLowerCase().includes(query))
      )
    }

    // 상태 필터
    if (statusFilter !== 'all') {
      const isApproved = statusFilter === 'approved'
      filtered = filtered.filter(entry => entry.isApproved === isApproved)
    }

    setFilteredEntries(filtered)
  }

  const updateApproval = async (id: number, isApproved: boolean) => {
    try {
      const response = await fetch(`/api/admin/guestbook/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved }),
      })

      if (response.ok) {
        setEntries(entries.map(entry => 
          entry.id === id ? { ...entry, isApproved } : entry
        ))
        setSuccess(`방명록이 ${isApproved ? '승인' : '비승인'}되었습니다.`)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await response.json()
        setError(data.error || '상태 변경에 실패했습니다.')
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다.')
    }
  }

  const deleteEntry = async (id: number) => {
    if (!confirm('정말로 이 방명록을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/admin/guestbook/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setEntries(entries.filter(entry => entry.id !== id))
        setSuccess('방명록이 삭제되었습니다.')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await response.json()
        setError(data.error || '삭제에 실패했습니다.')
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다.')
    }
  }

  const approveAll = async () => {
    if (!confirm('모든 대기중인 방명록을 승인하시겠습니까?')) return

    try {
      const response = await fetch('/api/admin/guestbook/approve-all', {
        method: 'POST'
      })

      if (response.ok) {
        setEntries(entries.map(entry => ({ ...entry, isApproved: true })))
        setSuccess('모든 방명록이 승인되었습니다.')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await response.json()
        setError(data.error || '일괄 승인에 실패했습니다.')
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다.')
    }
  }

  const pendingCount = entries.filter(entry => !entry.isApproved).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">방명록 관리</h2>
<p className="text-gray-600">
            전체 {entries.length}개 (승인대기 {pendingCount}개)
          </p>
        </div>
        {pendingCount > 0 && (
          <Button onClick={approveAll}>
            <CheckIcon className="h-5 w-5 mr-2" />
            모두 승인
          </Button>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="이름, 이메일, 메시지 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
<select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">모든 상태</option>
            <option value="approved">승인됨</option>
            <option value="pending">승인대기</option>
          </select>

          <div className="text-sm text-gray-500 flex items-center">
            {filteredEntries.length}개 표시중
          </div>
</div>
      </div>

      {/* Entries List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
</div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📖</div>
<h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || statusFilter !== 'all'
                ? '검색 조건에 맞는 방명록이 없습니다'
                : '방명록이 없습니다'}
            </h3>
<p className="text-gray-500">사용자들이 방명록을 작성하길 기다려보세요.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-base font-medium text-gray-900">
                        {entry.name}
                      </h3>
                      {entry.email && (
                        <span className="text-sm text-gray-500">
                          ({entry.email})
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.isApproved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {entry.isApproved ? '✅ 승인됨' : '⏳ 승인대기'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(entry.createdAt), { locale: ko, addSuffix: true })}
                      </span>
                    </div>
<div className="bg-gray-50 rounded-lg p-4 mt-3">
                      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {entry.message}
                      </p>
                    </div>
</div>

                  <div className="flex items-center space-x-2 ml-4">
                    {!entry.isApproved ? (
                      <button
                        onClick={() => updateApproval(entry.id, true)}
                        className="text-green-600 hover:text-green-800"
                        title="승인"
                      >
                        <CheckIcon className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => updateApproval(entry.id, false)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="승인 취소"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-red-600 hover:text-red-800"
                      title="삭제"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
</div>
              </div>
            ))}
          </div>
        )}
      </div>
</div>
  )
}
