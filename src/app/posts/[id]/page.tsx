import Layout from '@/components/Layout'
import Link from 'next/link'
import { db } from '@/lib/db'
import { posts, boards } from '@/lib/schema'
import { desc, eq, sql } from 'drizzle-orm' // sql import 추가
import PostContent from '@/components/PostContent'
import CommentSection from '@/components/CommentSection'
// import PostActions from '@/components/PostActions'  // 아직 없다면 주석 처리

// Server Action으로 분리
async function incrementViewsAction(postId: number) {
  try {
    await db
      .update(posts)
      .set({ 
        views: sql`COALESCE(${posts.views}, 0) + 1` // db.raw 대신 sql 사용
      })
      .where(eq(posts.id, postId))
  } catch (error) {
    console.error('조회수 업데이트 실패:', error)
  }
}

async function getPost(id: number) {
  const result = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      author: posts.author,
      views: posts.views,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      board: {
        id: boards.id,
        title: boards.title,
      }
    })
    .from(posts)
    .leftJoin(boards, eq(posts.boardId, boards.id))
    .where(eq(posts.id, id))
    .limit(1)

  return result[0] || null
}

interface PageProps {
  params: {
    id: string
  }
}

export default async function PostPage({ params }: PageProps) {
  const postId = parseInt(params.id)
  
  if (isNaN(postId)) {
    return (
      <Layout>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">잘못된 접근입니다</h1>
<Link href="/boards" className="text-blue-600 hover:underline">
            게시판으로 돌아가기
          </Link>
        </div>
</Layout>
    )
  }

  // 조회수 증가 (비동기로 실행)
  incrementViewsAction(postId).catch(console.error)
  
  const post = await getPost(postId)

  if (!post) {
    return (
      <Layout>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">게시글을 찾을 수 없습니다</h1>
<Link href="/boards" className="text-blue-600 hover:underline">
            게시판으로 돌아가기
          </Link>
        </div>
</Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* 네비게이션 */}
        <div className="mb-6">
          <Link 
            href={post.board ? `/boards/${post.board.id}` : '/boards'} 
            className="text-blue-600 hover:underline"
          >
            ← {post.board?.title || '게시판'}으로 돌아가기
          </Link>
        </div>

        {/* 게시글 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
<div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span className="font-medium">{post.author}</span>
                <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                {post.board && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {post.board.title}
                  </span>
                )}
              </div>
<div className="flex items-center space-x-4">
                <span>조회 {post.views || 0}</span>
              </div>
</div>
          </div>
</div>

        {/* 게시글 내용 */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-800">
              {post.content}
            </div>
</div>
        </div>

        {/* 댓글 섹션 */}
        {/* <CommentSection postId={post.id} /> */}

        {/* 액션 버튼들 */}
        <div className="flex justify-between items-center bg-white rounded-lg shadow-sm p-6">
          <Link 
            href={post.board ? `/boards/${post.board.id}` : '/boards'}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            목록으로
          </Link>
          
          <div className="space-x-2">
            <Link 
              href={`/posts/${post.id}/edit`}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              수정
            </Link>
            <button 
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              onClick={() => {
                if (confirm('정말로 삭제하시겠습니까?')) {
                  // TODO: 삭제 기능 구현
                  alert('삭제 기능은 아직 구현되지 않았습니다.')
                }
              }}
            >
              삭제
            </button>
          </div>
</div>

        {/* PostActions 컴포넌트 (있다면) */}
         <PostActions postId={post.id} /> 
      </div>
</Layout>
  )
}