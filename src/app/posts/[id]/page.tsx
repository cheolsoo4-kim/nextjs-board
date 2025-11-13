import Layout from '@/components/Layout'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { posts, boards, comments } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import PostContent from '@/components/PostContent'
import CommentSection from '@/components/CommentSection'

async function getPost(id: number) {
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
      boardId: posts.boardId,
      board: {
        id: boards.id,
        title: boards.title,
        allowGuest: boards.allowGuest,
      }
    })
    .from(posts)
    .leftJoin(boards, eq(posts.boardId, boards.id))
    .where(eq(posts.id, id))
    .limit(1)

  return post
}

async function getComments(postId: number) {
  return await db
    .select()
    .from(comments)
    .where(eq(comments.postId, postId))
    .orderBy(desc(comments.createdAt))
}

async function updateViews(postId: number) {
  await db
    .update(posts)
    .set({ views: db.raw('views + 1') })
    .where(eq(posts.id, postId))
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const postId = parseInt(params.id)
  if (isNaN(postId)) notFound()

  const [post, postComments] = await Promise.all([
    getPost(postId),
    getComments(postId)
  ])

  if (!post) notFound()

  // 조회수 증가
  await updateViews(postId)

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <PostContent post={post} />
        <CommentSection post={post} initialComments={postComments} />
      </div>
</Layout>
  )
}
