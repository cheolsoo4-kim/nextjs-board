// app/api/boards/[id]/posts/[postId]/route.ts - PUT 메서드 추가
import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; postId: string }> }
) {
  // 기존 GET 메서드 코드 그대로 유지
  try {
    const params = await context.params
    const boardId = parseInt(params.id)
    const postId = parseInt(params.postId)
    
    if (isNaN(boardId) || isNaN(postId)) {
      return NextResponse.json({ error: '유효하지 않은 ID입니다.' }, { status: 400 })
    }

    const post = await sql`
      SELECT 
        id,
        title,
        content,
        COALESCE(author) as author,
        board_id,
        created_at,
        updated_at
      FROM posts 
      WHERE id = ${postId} AND board_id = ${boardId}
      LIMIT 1
    `

    if (post.length === 0) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json(post[0])
  } catch (error) {
    console.error('Post fetch error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 게시글 수정 API 추가
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const params = await context.params
    const boardId = parseInt(params.id)
    const postId = parseInt(params.postId)
    
    if (isNaN(boardId) || isNaN(postId)) {
      return NextResponse.json({ error: '유효하지 않은 ID입니다.' }, { status: 400 })
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

    // 게시글 존재 확인
    const existingPost = await sql`
      SELECT id FROM posts 
      WHERE id = ${postId} AND board_id = ${boardId}
      LIMIT 1
    `

    if (existingPost.length === 0) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 게시글 수정 (author 또는 author 컬럼에 따라 수정)
    try {
      // 먼저 author 컬럼이 있는지 확인
      const columnExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'posts' AND column_name = 'author'
        )
      `

      let updatedPost
      if (columnExists[0].exists) {
        // author 컬럼이 있는 경우
        updatedPost = await sql`
          UPDATE posts 
          SET title = ${title.trim()}, 
              content = ${content.trim()}, 
              author = ${author.trim()}, 
              updated_at = NOW()
          WHERE id = ${postId} AND board_id = ${boardId}
          RETURNING *
        `
      } else {
        // author 컬럼을 사용하는 경우
        updatedPost = await sql`
          UPDATE posts 
          SET title = ${title.trim()}, 
              content = ${content.trim()}, 
              author = ${author.trim()}, 
              updated_at = NOW()
          WHERE id = ${postId} AND board_id = ${boardId}
          RETURNING *
        `
      }

      console.log('게시글 수정 성공:', updatedPost[0])
      return NextResponse.json(updatedPost[0])
    } catch (updateError) {
      console.error('게시글 수정 오류:', updateError)
      return NextResponse.json({ error: '게시글 수정에 실패했습니다.' }, { status: 500 })
    }

  } catch (error) {
    console.error('Post update error:', error)
    return NextResponse.json({ error: '게시글 수정에 실패했습니다.' }, { status: 500 })
  }
}

// 게시글 삭제 API도 추가
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const params = await context.params
    const boardId = parseInt(params.id)
    const postId = parseInt(params.postId)
    
    if (isNaN(boardId) || isNaN(postId)) {
      return NextResponse.json({ error: '유효하지 않은 ID입니다.' }, { status: 400 })
    }

    // 게시글 존재 확인
    const existingPost = await sql`
      SELECT id FROM posts 
      WHERE id = ${postId} AND board_id = ${boardId}
      LIMIT 1
    `

    if (existingPost.length === 0) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 게시글 삭제
    await sql`
      DELETE FROM posts 
      WHERE id = ${postId} AND board_id = ${boardId}
    `

    console.log('게시글 삭제 성공:', postId)
    return NextResponse.json({ message: '게시글이 삭제되었습니다.' })

  } catch (error) {
    console.error('Post delete error:', error)
    return NextResponse.json({ error: '게시글 삭제에 실패했습니다.' }, { status: 500 })
  }
}