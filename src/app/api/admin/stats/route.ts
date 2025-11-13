import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, posts, guestbook, todos, boards } from '@/lib/schema'
import { getUserFromToken } from '@/lib/auth'
import { eq, desc, count } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    // 사용자 통계
    const [totalUsers] = await db.select({ count: count() }).from(users)
    const [activeUsers] = await db.select({ count: count() }).from(users).where(eq(users.isActive, true))
    const [adminUsers] = await db.select({ count: count() }).from(users).where(eq(users.role, 'admin'))
    const recentUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt)).limit(5)

    // 게시물 통계
    const [totalPosts] = await db.select({ count: count() }).from(posts)
    const recentPosts = await db.select({
      id: posts.id,
      title: posts.title,
      authorName: posts.authorName,
      createdAt: posts.createdAt,
    }).from(posts).orderBy(desc(posts.createdAt)).limit(5)

    // 방명록 통계
    const [totalGuestbook] = await db.select({ count: count() }).from(guestbook)
    const [pendingGuestbook] = await db.select({ count: count() }).from(guestbook).where(eq(guestbook.isApproved, false))
    const recentGuestbook = await db.select().from(guestbook).orderBy(desc(guestbook.createdAt)).limit(5)

    // Todo 통계
    const [totalTodos] = await db.select({ count: count() }).from(todos)
    const [completedTodos] = await db.select({ count: count() }).from(todos).where(eq(todos.completed, true))

    const stats = {
      users: {
        total: totalUsers.count,
        active: activeUsers.count,
        admins: adminUsers.count,
        recent: recentUsers,
      },
      posts: {
        total: totalPosts.count,
        recent: recentPosts,
      },
      guestbook: {
        total: totalGuestbook.count,
        pending: pendingGuestbook.count,
        recent: recentGuestbook,
      },
      todos: {
        total: totalTodos.count,
        completed: completedTodos.count,
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
