'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('이름을 입력해주세요.')
      return false
    }

    if (!formData.email.trim()) {
      setError('이메일을 입력해주세요.')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('올바른 이메일 형식이 아닙니다.')
      return false
    }

    if (!formData.password) {
      setError('비밀번호를 입력해주세요.')
      return false
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.')
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        setError(data.error || '회원가입에 실패했습니다.')
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-2xl text-white">👤</span>
              </div>
</div>
            <h2 className="text-3xl font-bold text-gray-900">회원가입</h2>
<p className="mt-2 text-gray-600">새로운 계정을 만들어보세요</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">❌</span>
                </div>
<div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
</div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-green-400">✅</span>
                </div>
<div className="ml-3">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
</div>
            </div>
          )}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="이름"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="홍길동"
              required
            />

            <Input
              label="이메일"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your-em***@***********"
              required
            />

            <Input
              label="비밀번호"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <Input
              label="비밀번호 확인"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                {isLoading ? '회원가입 중...' : '회원가입'}
              </Button>
            </div>
</form>

          {/* Footer */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
<div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
</div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link
                  href="/auth/login"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  로그인하기
                </Link>
              </p>
            </div>
<div className="mt-4 text-center">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← 홈으로 돌아가기
              </Link>
            </div>
</div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            🎉 회원가입 혜택
          </h3>
<ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-center">
              <span className="mr-2">✅</span>
              게시판에 글 작성 및 댓글 기능
            </li>
<li className="flex items-center">
              <span className="mr-2">✅</span>
              개인 Todo 관리 시스템
            </li>
<li className="flex items-center">
              <span className="mr-2">✅</span>
              방명록 작성 및 개인정보 관리
            </li>
<li className="flex items-center">
              <span className="mr-2">✅</span>
              더 많은 기능들을 이용하세요!
            </li>
</ul>
        </div>
</div>
    </div>
  )
}
