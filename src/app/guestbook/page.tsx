'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface GuestbookEntry {
  id: number
  name: string
  email?: string
  message: string
  isApproved: boolean
  createdAt: string
}

export default function GuestbookPage() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/guestbook')
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } catch (error) {
      console.error('Failed to fetch guestbook entries:', error)
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) {
      setError('이름과 메시지를 모두 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          message: message.trim()
        }),
      })

      if (response.ok) {
        setSuccess('방명록이 등록되었습니다. 관리자 승인 후 표시됩니다.')
        setName('')
        setEmail('')
        setMessage('')
        // 새로고침하여 최신 데이터 가져오기
        setTimeout(() => {
          fetchEntries()
          setSuccess('')
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || '방명록 등록에 실패했습니다.')
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">📖 방명록</h1>
<p className="text-gray-600">
            여러분의 소중한 의견과 인사말을 남겨주세요!
          </p>
        </div>

        {/* Write Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">방명록 작성</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="이름 *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력해주세요"
                required
              />
              <Input
                label="이메일 (선택사항)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력해주세요"
              />
            </div>
<div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                메시지 *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="메시지를 입력해주세요"
                required
              />
            </div>
<div className="flex justify-end">
              <Button type="submit" isLoading={isLoading}>
                등록하기
              </Button>
            </div>
</form>
        </div>

        {/* Entries List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            방명록 목록 ({entries.length})
          </h2>

          {fetchLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
</div>
          ) : (
            <div className="space-y-6">
              {entries.map((entry) => (
                <div key={entry.id} className="border-l-4 border-blue-200 bg-blue-50 p-4 rounded-r-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{entry.name}</h3>
                      {entry.email && (
                        <span className="text-sm text-gray-500">({entry.email})</span>
                      )}
                    </div>
<span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(entry.createdAt), { locale: ko, addSuffix: true })}
                    </span>
                  </div>
<p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {entry.message}
                  </p>
                </div>
              ))}

              {entries.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">✍️</div>
<h3 className="text-lg font-medium text-gray-900 mb-2">
                    아직 방명록이 없습니다
                  </h3>
<p className="text-gray-500">첫 번째 방명록을 작성해보세요!</p>
                </div>
              )}
            </div>
          )}
        </div>
</div>
    </Layout>
  )
}
