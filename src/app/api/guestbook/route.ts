import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guestbook } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  try {
    const entries = await db
      .select()
      .from(guestbook)
      .where(eq(guestbook.isApproved, true))
      .orderBy(desc(guestbook.createdAt))

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Guestbook fetch error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json()

    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json({ error: '이름과 메시지를 모두 입력해주세요.' }, { status: 400 })
    }

    const [newEntry] = await db.insert(guestbook).values({
      name: name.trim(),
      email: email?.trim() || null,
      message: message.trim(),
      isApproved: true, // 자동 승인 (관리자 페이지에서 변경 가능)
    }).returning()

    return NextResponse.json(newEntry, { status: 201 })
  } catch (error) {
    console.error('Guestbook creation error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
