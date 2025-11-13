// app/boards/[id]/posts/[postId]/edit/page.tsx (새 파일 생성)
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface Post {
  id: number
  title: string
  content: string
  author: string
  board_id: number
  created_at: string
  updated_at: string
}

interface Board {
  id: number
  title: string
  description: string
  category: string
  allowGuest: boolean
  isActive: boolean
}

interface EditPageProps {
  params: Promise<{ id: string; postId: string }>
}

export default function EditPostPage({ params }: EditPageProps) {
  const { id: boardId, postId } = use(params)
  const router = useRouter()
  
  const [post, setPost] = useState<Post | null>(null)
  const [board, setBoard] = useState<Board | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    author: ''
  })

  useEffect(() => {
    if (boardId && postId) {
      fetchPost()
      fetchBoard()
    }
  }, [boardId, postId])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/boards/${boardId}/posts/${postId}`)
      
      if (response.ok) {
        const data = await response.json()
        setPost(data)
        setPostForm({
          title: data.title,
          content: data.content,
          author: data.author
        })
      } else if (response.status === 404) {
        setError('게시글을 찾을 수 없습니다.')
      } else {
        setError('게시글을 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
      setError('서버 오류가 발생했습니다.')
    }
  }

  const fetchBoard = async () => {
    try {
      const response = await fetch(`/api/boards/${boardId}`)
      if (response.ok) {
        const data = await response.json()
        setBoard(data)
      }
    } catch (error) {
      console.error('Failed to fetch board:', error)
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

    if (!postForm.author.trim()) {
      setError('작성자명을 입력해주세요.')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/boards/${boardId}/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postForm.title.trim(),
          content: postForm.content.trim(),
          author: postForm.author.trim()
        }),
      })

      if (response.ok) {
        router.push(`/boards/${boardId}/posts/${postId}`)
      } else {
        const data = await response.json()
        setError(data.error || '게시글 수정에 실패했습니다.')
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

  if (error && !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">오류 발생</h1>
<p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href={`/boards/${boardId}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            게시판으로 돌아가기
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
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/boards" className="hover:text-blue-600">게시판</Link>
            <span>›</span>
            <Link href={`/boards/${boardId}`} className="hover:text-blue-600">
              {board?.title || '게시판'}
            </Link>
            <span>›</span>
            <Link href={`/boards/${boardId}/posts/${postId}`} className="hover:text-blue-600">
              {post?.title || '게시글'}
            </Link>
            <span>›</span>
            <span className="text-gray-900">수정</span>
          </div>
<Link 
            href={`/boards/${boardId}/posts/${postId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            게시글로 돌아가기
          </Link>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">게시글 수정</h1>
<p className="text-gray-600">
              {board?.title} 게시판의 게시글을 수정합니다.
            </p>
          </div>
</div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Edit Form */}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                작성자 *
              </label>
              <input
                type="text"
                value={postForm.author}
                onChange={(e) => setPostForm({ ...postForm, author: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="작성자명을 입력하세요"
                required
                disabled={isSubmitting}
              />
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
                href={`/boards/${boardId}/posts/${postId}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? '수정 중...' : '수정 완료'}
              </button>
            </div>
</form>
        </div>
</div>
    </div>
  )
}