import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { todos } from '@/lib/schema'
import { getUserFromToken } from '@/lib/auth'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const userTodos = await db
      .select()
      .from(todos)
      .where(eq(todos.userId, user.id))
      .orderBy(desc(todos.createdAt))

    return NextResponse.json(userTodos)
  } catch (error) {
    console.error('Todos fetch error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { title, description, priority, dueDate } = await request.json()

    if (!title?.trim()) {
      return NextResponse.json({ error: '제목을 입력해주세요.' }, { status: 400 })
    }

    const [newTodo] = await db.insert(todos).values({
      title: title.trim(),
      description: description?.trim() || null,
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      userId: user.id,
    }).returning()

    return NextResponse.json(newTodo, { status: 201 })
  } catch (error) {
    console.error('Todo creation error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
