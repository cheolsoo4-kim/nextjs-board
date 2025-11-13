import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { getUserFromToken, hashPassword } from '@/lib/auth'
import { desc, eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const userList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))

    return NextResponse.json(userList)
  } catch (error) {
    console.error('Admin users fetch error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const { name, email, password, role, isActive } = await request.json()

    // 이메일 중복 체크
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existingUser.length > 0) {
      return NextResponse.json({ error: '이미 존재하는 이메일입니다.' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      isActive: isActive ?? true,
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Admin user creation error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
