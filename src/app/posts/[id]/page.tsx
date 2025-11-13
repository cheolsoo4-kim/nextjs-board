import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { posts, boards } from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'
import PostContent from '@/components/PostContent'
import CommentSection from '@/components/CommentSection'
import PostActions from '@/components/PostActions'

// Server Action으로 분리
async function incrementViewsAction(postId: number) {
  'use server'
  
  try {
    await db
      .update(posts)
      .set({ 
        views: sql`${posts.views} + 1`
      })
      .where(eq(posts.id, postId))
  } catch (error) {
    console.error('Failed to increment views:', error)
    // 조회수 증가 실패해도 페이지는 보여줌
  }
}

// 게시글 데이터 가져오기 (조회수 증가와 분리)
async function getPostWithIncrement(postId: number) {
  // 1. 조회수 증가 (비동기적으로 실행)
  incrementViewsAction(postId)

  // 2. 게시글 데이터 가져오기
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
      boardId: posts.boardId,
      board: {
        id: boards.id,
        title: boards.title,
      },
    })
    .from(posts)
    .leftJoin(boards, eq(posts.boardId, boards.id))
    .where(eq(posts.id, postId))
    .limit(1)

  return post
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params
  const postId = parseInt(id)

  if (isNaN(postId)) {
    notFound()
  }

  const post = await getPostWithIncrement(postId)

  if (!post) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 브레드크럼 */}
      {post.board && (
        <nav className="mb-6 text-sm breadcrumbs">
          <ol className="flex items-center space-x-2">
            <li><a href="/boards" className="text-blue-600 hover:text-blue-800">게시판</a></li>
<li className="text-gray-500">/</li>
<li><a href={`/boards/${post.board.id}`} className="text-blue-600 hover:text-blue-800">{post.board.title}</a></li>
<li className="text-gray-500">/</li>
<li className="text-gray-700">{post.title}</li>
</ol>
        </nav>
      )}

      {/* 게시글 카드 */}
      <article className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        {/* 헤더 */}
        <header className="px-6 py-4 bg-gray-50 border-b">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            {post.title}
          </h1>
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {post.author}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                {post.views}
              </span>
            </div>
<div className="flex items-center space-x-4">
              <time dateTime={post.createdAt.toISOString()}>
                작성: {post.createdAt.toLocaleDateString('ko-KR')}
              </time>
              {post.updatedAt && post.updatedAt.getTime() !== post.createdAt.getTime() && (
                <time dateTime={post.updatedAt.toISOString()}>
                  수정: {post.updatedAt.toLocaleDateString('ko-KR')}
                </time>
              )}
            </div>
</div>
        </header>

        {/* 본문 */}
        <div className="px-6 py-8">
          <PostContent content={post.content} />
        </div>
</article>

      {/* 댓글 */}
      <div className="bg-white rounded-lg shadow-lg">
        <CommentSection postId={post.id} />
      </div>

      {/* 액션 버튼 */}
      <PostActions post={post} />
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const postId = parseInt(id)

  if (isNaN(postId)) {
    return { title: '게시글을 찾을 수 없습니다' }
  }

  // 조회수 증가 없이 데이터만 가져오기
  const [post] = await db
    .select({
      title: posts.title,
      content: posts.content,
      author: posts.author,
      board: {
        title: boards.title,
      },
    })
    .from(posts)
    .leftJoin(boards, eq(posts.boardId, boards.id))
    .where(eq(posts.id, postId))
    .limit(1)

  if (!post) {
    return { title: '게시글을 찾을 수 없습니다' }
  }

  return {
    title: `${post.title} - ${post.board?.title || '게시판'}`,
    description: post.content.substring(0, 150).replace(/<[^>]*>/g, ''),
    openGraph: {
      title: post.title,
      description: post.content.substring(0, 150).replace(/<[^>]*>/g, ''),
      type: 'article',
      authors: [post.author],
    },
  }
}