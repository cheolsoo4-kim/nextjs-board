import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { hashPassword, generateToken } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // 이메일 중복 체크
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existingUser.length > 0) {
      return NextResponse.json({ error: '이미 존재하는 이메일입니다.' }, { status: 400 })
    }

    // 비밀번호 해시화
    const hashedPassword = await hashPassword(password)

    // 사용자 생성
    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    }).returning()

    // JWT 토큰 생성
    const token = generateToken({ 
      id: newUser.id, 
      email: newUser.email, 
      role: newUser.role 
    })

    const response = NextResponse.json({ 
      message: '회원가입이 완료되었습니다.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
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
    console.error('Registration error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
