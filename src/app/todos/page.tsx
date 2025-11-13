'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { 
  PlusIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface Todo {
  id: number
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  createdAt: string
  updatedAt: string
}

interface TodoForm {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  dueDate: string
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all')
  const [sortBy, setSortBy] = useState<'created' | 'priority' | 'dueDate'>('created')
  const [error, setError] = useState('')

  const [todoForm, setTodoForm] = useState<TodoForm>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  })

  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      fetchTodos()
    }
  }, [user])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        router.push('/auth/login')
      }
    } catch (error) {
      router.push('/auth/login')
    }
  }

  const fetchTodos = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/todos')
      if (response.ok) {
        const data = await response.json()
        setTodos(data)
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!todoForm.title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }

    try {
      const url = editingTodo ? `/api/todos/${editingTodo.id}` : '/api/todos'
      const method = editingTodo ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: todoForm.title.trim(),
          description: todoForm.description.trim(),
          priority: todoForm.priority,
          dueDate: todoForm.dueDate || null
        }),
      })

      if (response.ok) {
        fetchTodos()
        closeModal()
      } else {
        const data = await response.json()
        setError(data.error || 'Todo 저장에 실패했습니다.')
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다.')
    }
  }

  const toggleComplete = async (todo: Todo) => {
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...todo,
          completed: !todo.completed
        }),
      })

      if (response.ok) {
        setTodos(todos.map(t => 
          t.id === todo.id ? { ...t, completed: !t.completed } : t
        ))
      }
    } catch (error) {
      console.error('Failed to toggle todo:', error)
    }
  }

  const deleteTodo = async (id: number) => {
    if (!confirm('정말로 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTodos(todos.filter(t => t.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  const openModal = (todo?: Todo) => {
    if (todo) {
      setEditingTodo(todo)
      setTodoForm({
        title: todo.title,
        description: todo.description || '',
        priority: todo.priority,
        dueDate: todo.dueDate ? todo.dueDate.split('T')[0] : ''
      })
    } else {
      setEditingTodo(null)
      setTodoForm({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: ''
      })
    }
    setIsModalOpen(true)
    setError('')
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTodo(null)
    setError('')
  }

  // 필터링된 Todo 목록
  const filteredTodos = todos
    .filter(todo => {
      if (filter === 'completed') return todo.completed
      if (filter === 'pending') return !todo.completed
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  // 통계
  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length,
    overdue: todos.filter(t => 
      !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
    ).length
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '높음'
      case 'medium': return '보통'
      case 'low': return '낮음'
      default: return priority
    }
  }

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">✅ Todo 관리</h1>
<p className="text-gray-600 mt-1">할 일을 체계적으로 관리해보세요</p>
          </div>
<Button onClick={() => openModal()}>
            <PlusIcon className="h-5 w-5 mr-2" />
            새 할일 추가
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">전체</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
<CheckCircleIcon className="h-8 w-8 text-blue-500" />
            </div>
</div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">완료</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
<CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
</div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">진행중</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
<ClockIcon className="h-8 w-8 text-yellow-500" />
            </div>
</div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">기한초과</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              </div>
<ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            </div>
</div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">필터:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">전체</option>
                <option value="pending">진행중</option>
                <option value="completed">완료</option>
              </select>
            </div>
<div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">정렬:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="created">생성일순</option>
                <option value="priority">우선순위순</option>
                <option value="dueDate">마감일순</option>
              </select>
            </div>
</div>
        </div>

        {/* Todo List */}
        <div className="bg-white rounded-lg shadow-sm">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
</div>
          ) : filteredTodos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
<h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'Todo가 없습니다' : `${filter === 'completed' ? '완료된' : '진행중인'} Todo가 없습니다`}
              </h3>
<p className="text-gray-500 mb-4">새로운 할일을 추가해보세요!</p>
              <Button onClick={() => openModal()}>
                첫 번째 Todo 추가하기
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTodos.map((todo) => (
                <div key={todo.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <button
                      onClick={() => toggleComplete(todo)}
                      className={`mt-1 flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                        todo.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {todo.completed && <CheckCircleIcon className="h-3 w-3" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-base font-medium ${
                            todo.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}>
                            {todo.title}
                          </h3>
                          
                          {todo.description && (
                            <p className={`mt-1 text-sm ${
                              todo.completed ? 'text-gray-400' : 'text-gray-700'
                            }`}>
                              {todo.description}
                            </p>
                          )}

                          <div className="flex items-center space-x-4 mt-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                              {getPriorityText(todo.priority)}
                            </span>

                            {todo.dueDate && (
                              <span className={`text-xs ${
                                isOverdue(todo.dueDate) && !todo.completed
                                  ? 'text-red-600 font-medium'
                                  : 'text-gray-500'
                              }`}>
                                📅 {new Date(todo.dueDate).toLocaleDateString()}
                                {isOverdue(todo.dueDate) && !todo.completed && ' (기한초과)'}
                              </span>
                            )}

                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(todo.createdAt), { locale: ko, addSuffix: true })}
                            </span>
                          </div>
</div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => openModal(todo)}
                            className="text-gray-400 hover:text-blue-600"
                            title="수정"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteTodo(todo.id)}
                            className="text-gray-400 hover:text-red-600"
                            title="삭제"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
</div>
                    </div>
</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Todo Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingTodo ? 'Todo 수정' : '새 Todo 추가'}
        >
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="제목"
              value={todoForm.title}
              onChange={(e) => setTodoForm({ ...todoForm, title: e.target.value })}
              placeholder="할 일을 입력해주세요"
              required
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                설명 (선택사항)
              </label>
              <textarea
                value={todoForm.description}
                onChange={(e) => setTodoForm({ ...todoForm, description: e.target.value })}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="상세 설명을 입력해주세요"
              />
            </div>
<div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  우선순위
                </label>
                <select
                  value={todoForm.priority}
                  onChange={(e) => setTodoForm({ ...todoForm, priority: e.target.value as any })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="low">낮음</option>
                  <option value="medium">보통</option>
                  <option value="high">높음</option>
                </select>
              </div>
<Input
                label="마감일 (선택사항)"
                type="date"
                value={todoForm.dueDate}
                onChange={(e) => setTodoForm({ ...todoForm, dueDate: e.target.value })}
              />
            </div>
<div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={closeModal}>
                취소
              </Button>
              <Button type="submit">
                {editingTodo ? '수정' : '추가'}
              </Button>
            </div>
</form>
        </Modal>
      </div>
</Layout>
  )
}
