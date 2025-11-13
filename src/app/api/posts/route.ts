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

    // 조건 배열 생성
    const conditions: SQL[] = []
    
    if (boardId) {
      conditions.push(eq(posts.boardId, parseInt(boardId)))
    }

    // 기본 쿼리 빌더
    let queryBuilder = db
      .select({
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
      })
      .from(posts)
      .leftJoin(boards, eq(posts.boardId, boards.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset)

    // 조건이 있으면 where 절 추가
    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions))
    }

    const postList = await queryBuilder
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

    let user = null

    // 게스트가 아닌 경우 인증 확인
    if (!isGuest) {
      user = await getUserFromToken(request)
      if (!user) {
        return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
      }
    } else {
      // 게스트인 경우에도 토큰이 있으면 사용자 정보 가져오기
      user = await getUserFromToken(request)
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