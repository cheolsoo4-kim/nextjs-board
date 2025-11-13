import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { verifyPassword, generateToken } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 사용자 찾기
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (!user) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 잘못되었습니다.' }, { status: 401 })
    }

    // 비밀번호 확인
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 잘못되었습니다.' }, { status: 401 })
    }

    // JWT 토큰 생성
    const token = generateToken({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    })

    const response = NextResponse.json({ 
      message: '로그인이 완료되었습니다.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
