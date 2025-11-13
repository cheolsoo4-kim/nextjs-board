import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts, boards, users } from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const postId = parseInt(id)

    // 1. 조회수 증가
    await db
      .update(posts)
      .set({ 
        views: sql`${posts.views} + 1` 
      })
      .where(eq(posts.id, postId))

    // 2. 게시글 정보 조회
    const [post] = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        author: posts.author,
        authorId: posts.authorId,
        isGuest: posts.isGuest,
        views: posts.views,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        board: {
          id: boards.id,
          title: boards.title,
        },
      })
      .from(posts)
      .leftJoin(boards, eq(posts.boardId, boards.id))
      .where(eq(posts.id, postId))
      .limit(1)

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Post fetch error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const postId = parseInt(id)
    const { title, content } = await request.json()

    const [updatedPost] = await db
      .update(posts)
      .set({
        title,
        content,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId))
      .returning()

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Post update error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const postId = parseInt(id)

    await db
      .delete(posts)
      .where(eq(posts.id, postId))

    return NextResponse.json({ message: '게시글이 삭제되었습니다.' })
  } catch (error) {
    console.error('Post delete error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}