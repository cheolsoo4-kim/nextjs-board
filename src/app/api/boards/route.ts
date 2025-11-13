import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { boards } from '@/lib/schema'
import { getUserFromToken } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const boardList = await db.select().from(boards).where(eq(boards.isActive, true))
    return NextResponse.json(boardList)
  } catch (error) {
    console.error('Boards fetch error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const { title, description, category, allowGuest } = await request.json()

    const [newBoard] = await db.insert(boards).values({
      title,
      description,
      category,
      allowGuest,
    }).returning()

    return NextResponse.json(newBoard, { status: 201 })
  } catch (error) {
    console.error('Board creation error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
