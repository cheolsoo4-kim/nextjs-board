import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts, boards, users } from '@/lib/schema'
import { getUserFromToken } from '@/lib/auth'
import { eq, desc, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const boardId = searchParams.get('boardId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    let query = db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        authorName: posts.authorName,
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

    if (boardId) {
      query = query.where(eq(posts.boardId, parseInt(boardId)))
    }

    const postList = await query
    return NextResponse.json(postList)
  } catch (error) {
    console.error('Posts fetch error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, boardId, authorName, isGuest } = await request.json()
    
    if (!isGuest) {
      const user = await getUserFromToken(request)
      if (!user) {
        return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
      }
    }

    const user = await getUserFromToken(request)
    
    const [newPost] = await db.insert(posts).values({
      title,
      content,
      boardId: parseInt(boardId),
      authorId: user?.id || null,
      authorName: authorName || user?.name || '익명',
      isGuest: isGuest || false,
    }).returning()

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    console.error('Post creation error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
