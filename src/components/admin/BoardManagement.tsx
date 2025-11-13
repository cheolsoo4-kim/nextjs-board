'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { 
  PlusIcon, 
  PencilIcon,
  TrashIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface Board {
  id: number
  title: string
  description: string
  category: string
  allowGuest: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  postCount?: number
}

interface BoardForm {
  title: string
  description: string
  category: string
  allowGuest: boolean
  isActive: boolean
}

export default function BoardManagement() {
  const [boards, setBoards] = useState<Board[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBoard, setEditingBoard] = useState<Board | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [boardForm, setBoardForm] = useState<BoardForm>({
    title: '',
    description: '',
    category: '',
    allowGuest: true,
    isActive: true
  })

  const categories = [
    '공지사항',
    '자유게시판',
    '질문답변',
    '이벤트',
    '기타'
  ]

  useEffect(() => {
    fetchBoards()
  }, [])

  const fetchBoards = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/boards')
      if (response.ok) {
        const data = await response.json()
        setBoards(data)
      }
    } catch (error) {
      console.error('Failed to fetch boards:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!boardForm.title.trim() || !boardForm.description.trim()) {
      setError('제목과 설명을 모두 입력해주세요.')
      return
    }

    setError('')
    setSuccess('')

    try {
      const url = editingBoard ? `/api/admin/boards/${editingBoard.id}` : '/api/admin/boards'
      const method = editingBoard ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: boardForm.title.trim(),
          description: boardForm.description.trim(),
          category: boardForm.category,
          allowGuest: boardForm.allowGuest,
          isActive: boardForm.isActive
        }),
      })

      if (response.ok) {
        setSuccess(editingBoard ? '게시판이 수정되었습니다.' : '게시판이 생성되었습니다.')
        fetchBoards()
        closeModal()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await response.json()
        setError(data.error || '게시판 저장에 실패했습니다.')
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다.')
    }
  }

  const deleteBoard = async (id: number) => {
    if (!confirm('정말로 이 게시판을 삭제하시겠습니까? 모든 게시글도 함께 삭제됩니다.')) return

    try {
      const response = await fetch(`/api/admin/boards/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess('게시판이 삭제되었습니다.')
        fetchBoards()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await response.json()
        setError(data.error || '게시판 삭제에 실패했습니다.')
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다.')
    }
  }

  const toggleBoardStatus = async (board: Board) => {
    try {
      const response = await fetch(`/api/admin/boards/${board.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...board,
          isActive: !board.isActive
        }),
      })

      if (response.ok) {
        setBoards(boards.map(b => 
          b.id === board.id ? { ...b, isActive: !b.isActive } : b
        ))
        setSuccess(`게시판이 ${!board.isActive ? '활성화' : '비활성화'}되었습니다.`)
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      console.error('Failed to toggle board status:', error)
    }
  }

  const openModal = (board?: Board) => {
    if (board) {
      setEditingBoard(board)
      setBoardForm({
        title: board.title,
        description: board.description,
        category: board.category,
        allowGuest: board.allowGuest,
        isActive: board.isActive
      })
    } else {
      setEditingBoard(null)
      setBoardForm({
        title: '',
        description: '',
        category: categories[0],
        allowGuest: true,
        isActive: true
      })
    }
    setIsModalOpen(true)
    setError('')
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBoard(null)
    setError('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">게시판 관리</h2>
<p className="text-gray-600">전체 {boards.length}개의 게시판</p>
        </div>
<Button onClick={() => openModal()}>
          <PlusIcon className="h-5 w-5 mr-2" />
          게시판 추가
        </Button>
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

      {/* Boards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
</div>
        ) : boards.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">게시판이 없습니다</h3>
<p className="mt-1 text-sm text-gray-500">첫 번째 게시판을 추가해보세요.</p>
            <div className="mt-6">
              <Button onClick={() => openModal()}>
                게시판 추가
              </Button>
            </div>
</div>
        ) : (
          boards.map((board) => (
            <div key={board.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {board.title}
                  </h3>
<p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {board.description}
                  </p>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {board.category}
                    </span>
                    {board.allowGuest && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        비회원 허용
                      </span>
                    )}
                  </div>
</div>
              </div>
<div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>게시글 {board.postCount || 0}개</span>
                <span>{formatDistanceToNow(new Date(board.createdAt), { locale: ko, addSuffix: true })}</span>
              </div>
<div className="flex items-center justify-between">
                <button
                  onClick={() => toggleBoardStatus(board)}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                    board.isActive
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {board.isActive ? '✅ 활성' : '❌ 비활성'}
                </button>

                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal(board)}
                    className="text-blue-600 hover:text-blue-900"
                    title="수정"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteBoard(board.id)}
                    className="text-red-600 hover:text-red-900"
                    title="삭제"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
</div>
            </div>
          ))
        )}
      </div>

      {/* Board Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBoard ? '게시판 수정' : '새 게시판 추가'}
      >
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="게시판 이름"
            value={boardForm.title}
            onChange={(e) => setBoardForm({ ...boardForm, title: e.target.value })}
            placeholder="게시판 이름을 입력하세요"
            required
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              설명
            </label>
            <textarea
              value={boardForm.description}
              onChange={(e) => setBoardForm({ ...boardForm, description: e.target.value })}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="게시판 설명을 입력하세요"
              required
            />
          </div>
<div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              카테고리
            </label>
            <select
              value={boardForm.category}
              onChange={(e) => setBoardForm({ ...boardForm, category: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
<div className="space-y-4">
            <div className="flex items-center">
              <input
                id="allowGuest"
                type="checkbox"
                checked={boardForm.allowGuest}
                onChange={(e) => setBoardForm({ ...boardForm, allowGuest: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowGuest" className="ml-2 block text-sm text-gray-900">
                비회원 글쓰기 허용
              </label>
            </div>
<div className="flex items-center">
              <input
                id="isActive"
                type="checkbox"
                checked={boardForm.isActive}
                onChange={(e) => setBoardForm({ ...boardForm, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                활성 상태
              </label>
            </div>
</div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              취소
            </Button>
            <Button type="submit">
              {editingBoard ? '수정' : '추가'}
            </Button>
          </div>
</form>
      </Modal>
    </div>
  )
}
