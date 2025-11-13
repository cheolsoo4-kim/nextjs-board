import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts, boards, users } from '@/lib/schema'
import { getUserFromToken } from '@/lib/auth'
import { eq, desc } from 'drizzle-orm'

// params를 사용하지 않음 (동적 라우트가 아니므로)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const boardId = searchParams.get('boardId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // 공통 SELECT 구조
    const selectFields = {
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

    // boardId 여부에 따라 다른 쿼리 실행
    let postList

    if (boardId) {
      postList = await db
        .select(selectFields)
        .from(posts)
        .leftJoin(boards, eq(posts.boardId, boards.id))
        .where(eq(posts.boardId, parseInt(boardId)))
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset)
    } else {
      postList = await db
        .select(selectFields)
        .from(posts)
        .leftJoin(boards, eq(posts.boardId, boards.id))
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset)
    }

    return NextResponse.json(postList)
  } catch (error) {
    console.error('Posts fetch error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, boardId, author, isGuest } = await request.json()
    
    // 입력 값 검증
    if (!title || !content || !boardId) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요.' }, 
        { status: 400 }
      )
    }

    // 사용자 인증 처리
    const user = await getUserFromToken(request)
    
    if (!isGuest && !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }
    
    const [newPost] = await db.insert(posts).values({
      title,
      content,
      boardId: parseInt(boardId),
      authorId: user?.id || null,
      author: author || user?.name || '익명',
      isGuest: isGuest || false,
    }).returning()

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    console.error('Post creation error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}