'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Comment {
  id: number
  content: string
  author: string
  authorId?: number
  isGuest: boolean
  createdAt: string
}

interface Post {
  id: number
  board: {
    allowGuest: boolean
  }
}

interface CommentSectionProps {
  post: Post
  initialComments: Comment[]
}

export default function CommentSection({ post, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [author, setauthor] = useState('')
  const [user, setUser] = useState<any>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setauthor(userData.name)
      } else {
        setIsGuest(true)
      }
    } catch (error) {
      setIsGuest(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) {
      setError('댓글 내용을 입력해주세요.')
      return
    }

    if (isGuest && !author.trim()) {
      setError('이름을 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          content: newComment.trim(),
          author: author.trim(),
          isGuest
        }),
      })

      if (response.ok) {
        const comment = await response.json()
        setComments([comment, ...comments])
        setNewComment('')
        setError('')
      } else {
        const data = await response.json()
        setError(data.error || '댓글 작성에 실패했습니다.')
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isGuest && !post.board.allowGuest) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          댓글 ({comments.length})
        </h3>
<div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center mb-6">
          <p className="text-gray-600">로그인한 사용자만 댓글을 작성할 수 있습니다.</p>
        </div>
<CommentList comments={comments} />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        댓글 ({comments.length})
      </h3>
      
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {isGuest && (
          <Input
            value={author}
            onChange={(e) => setauthor(e.target.value)}
            placeholder="이름을 입력해주세요"
            required
          />
        )}

        <div className="space-y-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="댓글을 입력해주세요"
            required
          />
        </div>
<div className="flex justify-end">
          <Button type="submit" isLoading={isLoading}>
            댓글 작성
          </Button>
        </div>
</form>

      <CommentList comments={comments} />
    </div>
  )
}

function CommentList({ comments }: { comments: Comment[] }) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-b-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {comment.isGuest ? '👤' : '👨‍💼'} {comment.author}
              </span>
              {comment.isGuest && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  비회원
                </span>
              )}
            </div>
<span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), { locale: ko, addSuffix: true })}
            </span>
          </div>
<p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
        </div>
      ))}
      
      {comments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          첫 번째 댓글을 작성해보세요!
        </div>
      )}
    </div>
  )
}
