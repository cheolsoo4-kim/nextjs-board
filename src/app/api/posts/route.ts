import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts, boards, users } from '@/lib/schema'
import { getUserFromToken } from '@/lib/auth'
import { eq, desc, and, SQL } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const boardId = searchParams.get('boardId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // 기본 SELECT 부분
    const selectConfig = {
      id: posts.id,
      title: posts.title,
      content: posts.content,
      author: posts.author,
      isGuest: posts.isGuest,
      views: posts.views,
      createdAt: posts.createdAt,
      board: {
        id: boards.id,
        title: boards.title,
      }
    }

    // 조건에 따라 완전히 다른 쿼리 실행
    const postList = boardId
      ? await db
          .select(selectConfig)
          .from(posts)
          .leftJoin(boards, eq(posts.boardId, boards.id))
          .where(eq(posts.boardId, parseInt(boardId)))
          .orderBy(desc(posts.createdAt))
          .limit(limit)
          .offset(offset)
      : await db
          .select(selectConfig)
          .from(posts)
          .leftJoin(boards, eq(posts.boardId, boards.id))
          .orderBy(desc(posts.createdAt))
          .limit(limit)
          .offset(offset)

    return NextResponse.json(postList)
  } catch (error) {
    console.error('Posts fetch error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}