// app/boards/[id]/write/page.tsx
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface WritePageProps {
  params: Promise<{ id: string }>
}

export default function WritePage({ params }: WritePageProps) {
  const router = useRouter()
  
  // React.use()로 params Promise 해결
  const { id: boardId } = use(params)
  
  const [board, setBoard] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    author: '',
    isAnonymous: false
  })

  useEffect(() => {
    if (boardId) {
      fetchBoard()
    }
  }, [boardId])

  const fetchBoard = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/boards/${boardId}`)
      
      if (response.ok) {
        const data = await response.json()
        setBoard(data)
      } else {
        setError('게시판을 찾을 수 없습니다.')
      }
    } catch (error) {
      console.error('Failed to fetch board:', error)
      setError('서버 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!postForm.title.trim() || !postForm.content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.')
      return
    }

    if (!postForm.isAnonymous && !postForm.author.trim()) {
      setError('작성자명을 입력해주세요.')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/boards/${boardId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postForm.title.trim(),
          content: postForm.content.trim(),
          author: postForm.isAnonymous ? '익명' : postForm.author.trim(),
          boardId: parseInt(boardId)
        }),
      })

      if (response.ok) {
        router.push(`/boards/${boardId}`)
      } else {
        const data = await response.json()
        setError(data.error || '게시글 작성에 실패했습니다.')
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
</div>
    )
  }

  if (error && !board) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">오류 발생</h1>
<p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/boards" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            게시판 목록으로 돌아가기
          </Link>
        </div>
</div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href={`/boards/${boardId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            {board?.title || '게시판'}으로 돌아가기
          </Link>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">글쓰기</h1>
<p className="text-gray-600">
              {board?.title} 게시판에 새로운 글을 작성합니다.
            </p>
          </div>
</div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Write Form */}
        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 *
              </label>
              <input
                type="text"
                value={postForm.title}
                onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="제목을 입력하세요"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* 작성자 */}
            <div>
              <div className="flex items-center mb-2">
                <input
                  id="anonymous"
                  type="checkbox"
                  checked={postForm.isAnonymous}
                  onChange={(e) => setPostForm({ ...postForm, isAnonymous: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-900">
                  익명으로 작성
                </label>
              </div>
              
              {!postForm.isAnonymous && (
                <input
                  type="text"
                  value={postForm.author}
                  onChange={(e) => setPostForm({ ...postForm, author: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="작성자명을 입력하세요"
                  required={!postForm.isAnonymous}
                  disabled={isSubmitting}
                />
              )}
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용 *
              </label>
              <textarea
                value={postForm.content}
                onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                rows={12}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="내용을 입력하세요"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* 버튼들 */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Link
                href={`/boards/${boardId}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? '작성 중...' : '글 작성'}
              </button>
            </div>
</form>
        </div>
</div>
    </div>
  )
}