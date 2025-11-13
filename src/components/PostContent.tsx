'use client'

import { useState } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Post {
  id: number
  title: string
  content: string
  authorName: string
  authorId?: number
  isGuest: boolean
  views: number
  createdAt: string
  boardId: number
  board: {
    id: number
    title: string
    allowGuest: boolean
  }
}

interface PostContentProps {
  post: Post
}

export default function PostContent({ post }: PostContentProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/boards/${post.board.id}`}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← {post.board.title}
          </Link>
        </div>
<h1 className="text-2xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>
<div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              {post.isGuest ? '👤' : '👨‍💼'} {post.authorName}
            </span>
            <span>👀 {post.views}</span>
            <span>
              {formatDistanceToNow(new Date(post.createdAt), { locale: ko, addSuffix: true })}
            </span>
          </div>
</div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {post.content}
          </div>
</div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between">
          <Link href={`/boards/${post.board.id}`}>
            <Button variant="secondary">목록으로</Button>
          </Link>
          <div className="flex space-x-2">
            <Button variant="ghost">수정</Button>
            <Button variant="danger">삭제</Button>
          </div>
</div>
      </div>
</div>
  )
}
