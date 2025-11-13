import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const userPayload = await getUserFromToken(request)
    if (!userPayload) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const [user] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      avatar: users.avatar,
    }).from(users).where(eq(users.id, userPayload.id)).limit(1)

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
