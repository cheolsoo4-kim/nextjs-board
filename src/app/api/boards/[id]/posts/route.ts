// app/api/boards/[id]/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const boardId = parseInt(params.id)
    
    if (isNaN(boardId)) {
      return NextResponse.json({ error: '유효하지 않은 게시판 ID입니다.' }, { status: 400 })
    }

    const body = await request.json()
    const { title, content, author } = body

    // 입력 유효성 검사
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: '제목과 내용은 필수 항목입니다.' }, { status: 400 })
    }

    if (!author?.trim()) {
      return NextResponse.json({ error: '작성자는 필수 항목입니다.' }, { status: 400 })
    }

    // posts 테이블이 없으면 생성
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(100) NOT NULL,
        board_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    // 게시글 생성
    const newPost = await sql`
      INSERT INTO posts (title, content, author, board_id, created_at, updated_at)
      VALUES (${title.trim()}, ${content.trim()}, ${author.trim()}, ${boardId}, NOW(), NOW())
      RETURNING *
    `

    return NextResponse.json(newPost[0], { status: 201 })
  } catch (error) {
    console.error('Post creation error:', error)
    return NextResponse.json({ error: '게시글 작성에 실패했습니다.' }, { status: 500 })
  }
}

// 게시글 목록 조회 API
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const boardId = parseInt(params.id)
    
    if (isNaN(boardId)) {
      return NextResponse.json({ error: '유효하지 않은 게시판 ID입니다.' }, { status: 400 })
    }

    console.log('게시글 목록 조회 - boardId:', boardId)

    // Neon으로 게시글 목록 조회 (최신순)
    const postList = await sql`
      SELECT 
        id,
        title,
        content,
        COALESCE(author) as author,
        board_id,
        created_at,
        updated_at
      FROM posts 
      WHERE board_id = ${boardId} 
      ORDER BY created_at DESC
    `

    console.log('조회된 게시글 수:', postList.length)
    return NextResponse.json(postList)
  } catch (error) {
    console.error('Posts fetch error:', error)
    return NextResponse.json({ error: '게시글 목록 조회에 실패했습니다.' }, { status: 500 })
  }
}