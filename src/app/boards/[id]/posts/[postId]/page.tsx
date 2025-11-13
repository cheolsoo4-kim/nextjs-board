// app/boards/[id]/posts/[postId]/page.tsx - 삭제 기능 추가
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

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

interface PostPageProps {
  params: Promise<{ id: string; postId: string }>
}

export default function PostDetailPage({ params }: PostPageProps) {
  const { id: boardId, postId } = use(params)
  const router = useRouter()
  
  const [post, setPost] = useState<Post | null>(null)
  const [board, setBoard] = useState<Board | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

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

  // 삭제 확인 및 실행 함수
  const handleDelete = async () => {
    if (!post) return

    // 삭제 확인 대화상자
    const isConfirmed = window.confirm(
      `정말로 "${post.title}" 게시글을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
    )

    if (!isConfirmed) return

    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch(`/api/boards/${boardId}/posts/${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // 삭제 성공 시 게시판 목록으로 이동
        alert('게시글이 삭제되었습니다.')
        router.push(`/boards/${boardId}`)
      } else {
        const data = await response.json()
        setError(data.error || '게시글 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Delete error:', error)
      setError('서버 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
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
        {/* 네비게이션 */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/boards" className="hover:text-blue-600">게시판</Link>
            <span>›</span>
            <Link href={`/boards/${boardId}`} className="hover:text-blue-600">
              {board?.title || '게시판'}
            </Link>
            <span>›</span>
            <span className="text-gray-900">{post?.title}</span>
          </div>
<Link 
            href={`/boards/${boardId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            목록으로 돌아가기
          </Link>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {post && (
          <div className="bg-white rounded-lg shadow">
            {/* 게시글 헤더 */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
                
                {/* 액션 버튼들 */}
                <div className="flex items-center space-x-2">
                  <Link 
                    href={`/boards/${boardId}/posts/${postId}/edit`}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    title="수정"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                  <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="삭제"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
</div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-700">{post.author}</span>
                  <span>#{post.id}</span>
                  <span>{formatDistanceToNow(new Date(post.created_at), { locale: ko, addSuffix: true })}</span>
                </div>
</div>
            </div>
            
            {/* 게시글 본문 */}
            <div className="p-6">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {post.content}
                </div>
</div>
            </div>
            
            {/* 하단 액션 바 */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <Link 
                  href={`/boards/${boardId}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  목록
                </Link>
                
                <div className="flex items-center space-x-3">
                  <Link 
                    href={`/boards/${boardId}/posts/${postId}/edit`}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    수정
                  </Link>
                  <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    {isDeleting ? '삭제 중...' : '삭제'}
                  </button>
                </div>
</div>
            </div>
</div>
        )}
      </div>
</div>
  )
}