// app/api/boards/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { boards } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params  // params를 await으로 받기
    console.log('API 호출됨 - params:', params)
    console.log('요청된 ID:', params.id)
    
    if (!params.id) {
      return NextResponse.json({ error: 'ID가 제공되지 않았습니다.' }, { status: 400 })
    }
    
    const boardId = parseInt(params.id)
    console.log('파싱된 boardId:', boardId)
    
    if (isNaN(boardId)) {
      return NextResponse.json({ error: '유효하지 않은 ID입니다.' }, { status: 400 })
    }
    
    const [board] = await db
      .select()
      .from(boards)
      .where(eq(boards.id, boardId))
      .limit(1)

    console.log('찾은 게시판:', board)

    if (!board) {
      console.log('게시판을 찾을 수 없음 - boardId:', boardId)
      return NextResponse.json({ error: '게시판을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json(board)
  } catch (error) {
    console.error('Board fetch error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}