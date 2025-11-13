import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comments } from '@/lib/schema'
import { getUserFromToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { postId, content, authorName, isGuest } = await request.json()
    
    if (!content?.trim()) {
      return NextResponse.json({ error: '댓글 내용을 입력해주세요.' }, { status: 400 })
    }

    let userInfo = null
    if (!isGuest) {
      userInfo = await getUserFromToken(request)
      if (!userInfo) {
        return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
      }
    }

    if (isGuest && !authorName?.trim()) {
      return NextResponse.json({ error: '이름을 입력해주세요.' }, { status: 400 })
    }

    const [newComment] = await db.insert(comments).values({
      postId: parseInt(postId),
      content: content.trim(),
      authorId: userInfo?.id || null,
      authorName: authorName?.trim() || userInfo?.name || '익명',
      isGuest: isGuest || false,
    }).returning()

    return NextResponse.json(newComment, { status: 201 })
  } catch (error) {
    console.error('Comment creation error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
