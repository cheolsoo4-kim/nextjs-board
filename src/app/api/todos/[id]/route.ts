import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { todos } from '@/lib/schema'
import { getUserFromToken } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const todoId = parseInt(params.id)
    const { title, description, priority, dueDate, completed } = await request.json()

    const [updatedTodo] = await db
      .update(todos)
      .set({
        title: title?.trim(),
        description: description?.trim() || null,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        completed: completed ?? false,
        updatedAt: new Date(),
      })
      .where(and(eq(todos.id, todoId), eq(todos.userId, user.id)))
      .returning()

    if (!updatedTodo) {
      return NextResponse.json({ error: 'Todo를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json(updatedTodo)
  } catch (error) {
    console.error('Todo update error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const todoId = parseInt(params.id)

    const [deletedTodo] = await db
      .delete(todos)
      .where(and(eq(todos.id, todoId), eq(todos.userId, user.id)))
      .returning()

    if (!deletedTodo) {
      return NextResponse.json({ error: 'Todo를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Todo가 삭제되었습니다.' })
  } catch (error) {
    console.error('Todo deletion error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
