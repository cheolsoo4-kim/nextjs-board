// src/app/page.tsx (기존 코드와 동일하지만 import 경로 확인)
import Layout from '@/components/Layout'
import Link from 'next/link'
import { db } from '@/lib/db'
import { posts, boards, guestbook } from '@/lib/schema'
import { desc, eq } from 'drizzle-orm'

async function getRecentPosts() {
  try {
    return await db
      .select({
        id: posts.id,
        title: posts.title,
        author: posts.author,
        createdAt: posts.createdAt,
        board: {
          title: boards.title,
        }
      })
      .from(posts)
      .leftJoin(boards, eq(posts.boardId, boards.id))
      .orderBy(desc(posts.createdAt))
      .limit(5)
  } catch (error) {
    console.error('최근 게시글 조회 실패:', error)
    return []
  }
}

async function getRecentGuestbook() {
  try {
    return await db
      .select()
      .from(guestbook)
      .where(eq(guestbook.isApproved, true))
      .orderBy(desc(guestbook.createdAt))
      .limit(3)
  } catch (error) {
    console.error('최근 방명록 조회 실패:', error)
    return []
  }
}

export default async function HomePage() {
  const [recentPosts, recentGuestbookEntries] = await Promise.all([
    getRecentPosts(),
    getRecentGuestbook(),
  ])

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            환영합니다! 🎉
          </h1>
<p className="text-xl text-gray-600 mb-8">
            게시판, 방명록, Todo 관리를 한 곳에서 편리하게 사용하세요.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/boards" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              게시판 바로가기
            </Link>
            <Link href="/guestbook" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
              방명록 작성하기
            </Link>
          </div>
</div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Posts */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">최근 게시글</h2>
<Link href="/boards" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                더보기 →
              </Link>
            </div>
<div className="space-y-3">
              {recentPosts.map((post) => (
                <div key={post.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                  <Link href={`/posts/${post.id}`} className="block hover:bg-gray-50 p-2 rounded">
                    <h3 className="font-medium text-gray-900 truncate">{post.title}</h3>
<div className="flex items-center justify-between text-sm text-gray-500 mt-1">
                      <span>{post.author}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    {post.board && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                        {post.board.title}
                      </span>
                    )}
                  </Link>
                </div>
              ))}
              {recentPosts.length === 0 && (
                <p className="text-gray-500 text-center py-4">아직 게시글이 없습니다.</p>
              )}
            </div>
</div>

          {/* Recent Guestbook */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">최근 방명록</h2>
<Link href="/guestbook" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                더보기 →
              </Link>
            </div>
<div className="space-y-3">
              {recentGuestbookEntries.map((entry) => (
                <div key={entry.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-800">{entry.message}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                      <span>{entry.name}</span>
                      <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                    </div>
</div>
                </div>
              ))}
              {recentGuestbookEntries.length === 0 && (
                <p className="text-gray-500 text-center py-4">아직 방명록이 없습니다.</p>
              )}
            </div>
</div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">바로가기</h2>
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/boards" className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-2xl">📝</span>
              </div>
<span className="text-sm font-medium text-gray-900">게시판</span>
            </Link>
            <Link href="/guestbook" className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-2xl">📖</span>
              </div>
<span className="text-sm font-medium text-gray-900">방명록</span>
            </Link>
            <Link href="/todos" className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-2xl">✅</span>
              </div>
<span className="text-sm font-medium text-gray-900">Todo</span>
            </Link>
            <Link href="/auth/login" className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-2xl">👤</span>
              </div>
<span className="text-sm font-medium text-gray-900">로그인</span>
            </Link>
          </div>
</div>
      </div>
</Layout>
  )
}