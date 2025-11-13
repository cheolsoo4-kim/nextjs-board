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
  MagnifyingGlassIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface UserForm {
  name: string
  email: string
  role: 'admin' | 'user'
  isActive: boolean
  password?: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [userForm, setUserForm] = useState<UserForm>({
    name: '',
    email: '',
    role: 'user',
    isActive: true,
    password: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      )
    }

    // 역할 필터
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // 상태 필터
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active'
      filtered = filtered.filter(user => user.isActive === isActive)
    }

    setFilteredUsers(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userForm.name.trim() || !userForm.email.trim()) {
      setError('이름과 이메일을 모두 입력해주세요.')
      return
    }

    if (!editingUser && !userForm.password?.trim()) {
      setError('비밀번호를 입력해주세요.')
      return
    }

    setError('')
    setSuccess('')

    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users'
      const method = editingUser ? 'PUT' : 'POST'

      const body: any = {
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        role: userForm.role,
        isActive: userForm.isActive
      }

      if (!editingUser && userForm.password) {
        body.password = userForm.password
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        setSuccess(editingUser ? '사용자가 수정되었습니다.' : '사용자가 생성되었습니다.')
        fetchUsers()
        closeModal()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await response.json()
        setError(data.error || '사용자 저장에 실패했습니다.')
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다.')
    }
  }

  const deleteUser = async (id: number) => {
    if (!confirm('정말로 이 사용자를 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess('사용자가 삭제되었습니다.')
        fetchUsers()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await response.json()
        setError(data.error || '사용자 삭제에 실패했습니다.')
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다.')
    }
  }

  const toggleUserStatus = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...user,
          isActive: !user.isActive
        }),
      })

      if (response.ok) {
        setUsers(users.map(u => 
          u.id === user.id ? { ...u, isActive: !u.isActive } : u
        ))
        setSuccess(`사용자가 ${!user.isActive ? '활성화' : '비활성화'}되었습니다.`)
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error)
    }
  }

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setUserForm({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      })
    } else {
      setEditingUser(null)
      setUserForm({
        name: '',
        email: '',
        role: 'user',
        isActive: true,
        password: ''
      })
    }
    setIsModalOpen(true)
    setError('')
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
    setError('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">사용자 관리</h2>
<p className="text-gray-600">전체 {users.length}명의 사용자</p>
        </div>
<Button onClick={() => openModal()}>
          <PlusIcon className="h-5 w-5 mr-2" />
          사용자 추가
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

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="이름 또는 이메일 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
<select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">모든 역할</option>
            <option value="admin">관리자</option>
            <option value="user">일반 사용자</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">모든 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>

          <div className="text-sm text-gray-500 flex items-center">
            {filteredUsers.length}명 표시중
          </div>
</div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사용자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이메일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    역할
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserCircleIcon className="h-6 w-6 text-gray-500" />
                          </div>
</div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
</div>
                      </div>
</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'admin' ? '👑 관리자' : '👤 사용자'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleUserStatus(user)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                          user.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {user.isActive ? '✅ 활성' : '❌ 비활성'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(user.createdAt), { locale: ko, addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openModal(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="수정"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="삭제"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">사용자가 없습니다</h3>
<p className="mt-1 text-sm text-gray-500">
                  {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                    ? '검색 조건에 맞는 사용자가 없습니다.'
                    : '첫 번째 사용자를 추가해보세요.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser ? '사용자 수정' : '새 사용자 추가'}
      >
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="이름"
            value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
            placeholder="사용자 이름을 입력하세요"
            required
          />

          <Input
            label="이메일"
            type="email"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            placeholder="이메일을 입력하세요"
            required
          />

          {!editingUser && (
            <Input
              label="비밀번호"
              type="password"
              value={userForm.password || ''}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              placeholder="비밀번호를 입력하세요"
              required
            />
          )}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              역할
            </label>
            <select
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="user">일반 사용자</option>
              <option value="admin">관리자</option>
            </select>
          </div>
<div className="flex items-center">
            <input
              id="isActive"
              type="checkbox"
              checked={userForm.isActive}
              onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              활성 상태
            </label>
          </div>
<div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              취소
            </Button>
            <Button type="submit">
              {editingUser ? '수정' : '추가'}
            </Button>
          </div>
</form>
      </Modal>
    </div>
  )
}
