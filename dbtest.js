// 임시 테스트 파일 또는 콘솔에서 실행
import { db } from '@/lib/db'
import { boards } from '@/lib/schema'

// 모든 게시판 조회
const allBoards = await db.select().from(boards)
console.log('모든 게시판:', allBoards)

// id=1 게시판 조회
const board1 = await db.select().from(boards).where(eq(boards.id, 1))
console.log('ID=1 게시판:', board1)
