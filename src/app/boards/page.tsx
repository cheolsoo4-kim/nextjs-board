// app/boards/page.tsx - 디버깅 버전
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

interface Board {
  id: number
  title: string
  description: string
  category: string
  allowGuest: boolean
  isActive: boolean
  createdAt: string
  postCount?: number
}

export default function BoardsListPage() {
  const [boards, setBoards] = useState<Board[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    console.log('BoardsListPage 마운트됨') // 디버그 로그
    fetchBoards()
  }, [])

  const fetchBoards = async () => {
    try {
      console.log('게시판 목록 요청 시작') // 디버그 로그
      setIsLoading(true)
      setError('')
      
      const response = await fetch('/api/boards')
      console.log('응답 상태:', response.status) // 디버그 로그
      console.log('응답 헤더:', response.headers) // 디버그 로그
      
      if (response.ok) {
        const data = await response.json()
        console.log('받은 데이터:', data) // 디버그 로그
        setBoards(data)
      } else {
        const errorText = await response.text()
        console.error('API 오류 응답:', errorText) // 디버그 로그
        setError(`서버 오류: ${response.status}`)
      }
    } catch (error) {
      console.error('네트워크 오류:', error) // 디버그 로그
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      console.log('로딩 완료') // 디버그 로그
      setIsLoading(false)
    }
  }

  console.log('현재 상태 - 로딩:', isLoading, '에러:', error, '게시판 수:', boards.length) // 디버그 로그

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h1>
<p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => {
              console.log('새로고침 버튼 클릭됨')
              fetchBoards()
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
</div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
          게시판
        </h1>
        
        {/* 디버그 정보 표시 */}
        <div className="mb-4 p-4 bg-yellow-100 rounded-lg">
          <p className="text-sm">디버그: 로딩={isLoading ? 'true' : 'false'}, 게시판 수={boards.length}</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
<p className="text-gray-600">게시판 목록을 불러오는 중...</p>
            </div>
</div>
        ) : boards.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">게시판이 없습니다</h3>
<p className="text-gray-500">아직 생성된 게시판이 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {boards.map((board) => (
              <Link key={board.id} href={`/boards/${board.id}`}>
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
                  <div className="mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                      {board.title}
                    </h3>
<p className="text-sm text-gray-600 line-clamp-3">
                      {board.description}
                    </p>
                  </div>
<div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {board.category}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {board.postCount || 0}개 글
                    </span>
                  </div>
</div>
              </Link>
            ))}
          </div>
        )}
      </div>
</div>
  )
}