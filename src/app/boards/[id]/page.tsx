// app/boards/[id]/page.tsx
'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Board {
  id: number
  title: string
  description: string
  category: string
  allowGuest: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Post {
  id: number
  title: string
  content: string
  author: string
  board_id: number
  created_at: string
  updated_at: string
}

interface BoardPageProps {
  params: Promise<{ id: string }>
}

export default function BoardDetailPage({ params }: BoardPageProps) {
  const { id: boardId } = use(params)
  
  const [board, setBoard] = useState<Board | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoadingBoard, setIsLoadingBoard] = useState(true)
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (boardId) {
      fetchBoard()
      fetchPosts()
    }
  }, [boardId])

  const fetchBoard = async () => {
    try {
      setIsLoadingBoard(true)
      const response = await fetch(`/api/boards/${boardId}`)
      
      if (response.ok) {
        const data = await response.json()
        setBoard(data)
      } else if (response.status === 404) {
        setError('게시판을 찾을 수 없습니다.')
      } else {
        setError('게시판을 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to fetch board:', error)
      setError('서버 오류가 발생했습니다.')
    } finally {
      setIsLoadingBoard(false)
    }
  }

  const fetchPosts = async () => {
    try {
      setIsLoadingPosts(true)
      const response = await fetch(`/api/boards/${boardId}/posts`)
      
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
        console.log('가져온 게시글:', data)
      } else {
        console.error('게시글 목록 조회 실패')
        setPosts([])
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      setPosts([])
    } finally {
      setIsLoadingPosts(false)
    }
  }

  if (isLoadingBoard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
</div>
    )
  }

  if (error) {
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

  if (!board) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">게시판을 찾을 수 없습니다</h1>
</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/boards"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            게시판 목록
          </Link>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{board.title}</h1>
<p className="text-gray-600">{board.description}</p>
              </div>
              
              {/* 글쓰기 버튼 */}
              {board.isActive && (
                <div className="flex gap-2">
                  <Link 
                    href={`/boards/${board.id}/write`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    글쓰기
                  </Link>
                </div>
              )}
            </div>
<div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded">{board.category}</span>
              {board.allowGuest && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">비회원 허용</span>
              )}
              <span className={`px-2 py-1 rounded ${
                board.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {board.isActive ? '활성' : '비활성'}
              </span>
              <span>전체 {posts.length}개 글</span>
            </div>
</div>
        </div>

        {/* 게시글 목록 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">게시글 목록</h2>
              
              {/* 상단 글쓰기 버튼 */}
              {board.isActive && (
                <Link 
                  href={`/boards/${board.id}/write`}
                  className="inline-flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  새 글 작성
                </Link>
              )}
            </div>
            
            {isLoadingPosts ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <PencilIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-lg mb-2">아직 게시글이 없습니다.</p>
                <p className="text-sm mb-6">첫 번째 게시글을 작성해보세요!</p>
                
                {/* 큰 글쓰기 버튼 */}
                {board.isActive && (
                  <Link 
                    href={`/boards/${board.id}/write`}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PencilIcon className="h-5 w-5 mr-2" />
                    첫 번째 글 작성하기
                  </Link>
                )}
              </div>
            ) : (
             <div className="space-y-4">
  {posts.map((post) => (
    <Link 
      key={post.id} 
      href={`/boards/${boardId}/posts/${post.id}`}
      className="block"
    >
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            {post.title}
          </h3>
<span className="text-xs text-gray-500 whitespace-nowrap ml-4">
            {formatDistanceToNow(new Date(post.created_at), { locale: ko, addSuffix: true })}
          </span>
        </div>
<p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {post.content.substring(0, 150)}
          {post.content.length > 150 && '...'}
        </p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <span className="text-gray-700 font-medium">{post.author}</span>
            <span className="text-gray-500">#{post.id}</span>
          </div>
<div className="flex items-center space-x-2">
            <span className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              자세히 보기 →
            </span>
          </div>
</div>
      </div>
</Link>
  ))}
</div>
            )}
          </div>
</div>

        {/* 하단 글쓰기 버튼 */}
        {board.isActive && posts.length > 0 && (
          <div className="mt-6 flex justify-center">
            <Link 
              href={`/boards/${board.id}/write`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              글쓰기
            </Link>
          </div>
        )}
      </div>
</div>
  )
}