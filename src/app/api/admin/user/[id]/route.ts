import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { getUserFromToken } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export async function PUT(
  request: NextRequest,
    { params }: { params: Promise<{ id: string }> }  // ✅ Promise로 변경

) {
  try {
    const user = await getUserFromToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }
     const { id } = await params;
    const userId = parseInt(id)
    const { name, email, role, isActive } = await request.json()

    const [updatedUser] = await db
      .update(users)
      .set({
        name,
        email,
        role,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        updatedAt: users.updatedAt,
      })

    if (!updatedUser) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
    { params }: { params: Promise<{ id: string }> }  // ✅ Promise로 변경

) {
  try {
    const user = await getUserFromToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }
      const { id } = await params;  // ✅ await 추가
    const userId = parseInt(id)

    // 자기 자신은 삭제할 수 없음
    if (user.id === userId) {
      return NextResponse.json({ error: '자기 자신은 삭제할 수 없습니다.' }, { status: 400 })
    }

    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({ id: users.id })

    if (!deletedUser) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ message: '사용자가 삭제되었습니다.' })
  } catch (error) {
    console.error('Admin user deletion error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
