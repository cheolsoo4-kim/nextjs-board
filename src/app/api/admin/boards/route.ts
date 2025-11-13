import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { boards, posts } from '@/lib/schema'
import { getUserFromToken } from '@/lib/auth'
import { desc, eq, count } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    console.log(user.role.toLowerCase());
    if (!user || user.role.toLowerCase() !== 'admin' ) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }
   console.log('여기 안와?');
    const boardsWithCount = await db
      .select({
        id: boards.id,
        title: boards.title,
        description: boards.description,
        category: boards.category,
        allowGuest: boards.allowGuest,
        isActive: boards.isActive,
        createdAt: boards.createdAt,
        updatedAt: boards.updatedAt,
        postCount: count(posts.id)
      })
      .from(boards)
      .leftJoin(posts, eq(boards.id, posts.boardId))
      .groupBy(boards.id)
      .orderBy(desc(boards.createdAt))

    return NextResponse.json(boardsWithCount)
  } catch (error) {
    console.error('Admin boards fetch error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// POST 메서드 추가 (게시판 생성)
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user || user.role.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, category, allowGuest, isActive } = body

    // 입력 유효성 검사
    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: '제목과 설명은 필수 항목입니다.' }, { status: 400 })
    }

    // 게시판 생성
    const newBoard = await db.insert(boards).values({
      title: title.trim(),
      description: description.trim(),
      category: category || '기타',
      allowGuest: allowGuest ?? true,
      isActive: isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning()

    return NextResponse.json(newBoard[0], { status: 201 })
  } catch (error) {
    console.error('Board creation error:', error)
    return NextResponse.json({ error: '게시판 생성에 실패했습니다.' }, { status: 500 })
  }
}