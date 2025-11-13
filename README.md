# 📖 Project Structure Documentation

Next.js 16 + App Router를 사용한 게시판/블로그 시스템의 프로젝트 구조입니다.

## 📁 프로젝트 구조
├── app/

│ ├── admin/

│ ├── api/

│ ├── auth/

│ ├── boards/

│ ├── posts/

│ ├── guestbook/

│ ├── todos/

│ ├── layout.tsx

│ ├── page.tsx

│ ├── globals.css

│ └── favicon.ico

├── components/

│ ├── admin/

│ ├── ui/

│ └── *.tsx

└── lib/

├── auth.ts

├── db.ts

└── schema.ts



## 🔧 App Directory (Next.js App Router)

### 🔐 Authentication (`app/auth/`)
| 파일 | 설명 |
|------|------|
| `login/page.tsx` | 로그인 페이지 UI |
| `register/page.tsx` | 회원가입 페이지 UI |

### 👑 Admin (`app/admin/`)
| 파일 | 설명 |
|------|------|
| `page.tsx` | 관리자 대시보드 메인 페이지 |
| `user/` | 관리자용 사용자 관리 페이지 |

### 📋 Boards (`app/boards/`)
| 파일 | 설명 |
|------|------|
| `page.tsx` | 게시판 목록 페이지 |
| `[id]/page.tsx` | 특정 게시판의 글 목록 |
| `[id]/posts/[postId]/page.tsx` | 개별 게시글 상세 보기 |
| `[id]/posts/[postId]/edit/page.tsx` | 게시글 수정 페이지 |
| `[id]/write/page.tsx` | 새 글 작성 페이지 |

### 📝 Other Pages
| 파일 | 설명 |
|------|------|
| `posts/[id]/page.tsx` | 개별 포스트 상세 페이지 |
| `guestbook/page.tsx` | 방명록 페이지 |
| `todos/page.tsx` | 할일 관리 페이지 |

### 🏠 Root Files
| 파일 | 설명 |
|------|------|
| `layout.tsx` | 전체 앱 레이아웃 (메타데이터, 폰트, 공통 구조) |
| `page.tsx` | 홈페이지 |
| `globals.css` | 전역 CSS 스타일 |
| `favicon.ico` | 사이트 아이콘 |

## 🔌 API Routes (`app/api/`)

### 🔐 Auth APIs (`api/auth/`)
| 엔드포인트 | 파일 | 설명 |
|------------|------|------|
| `POST /api/auth/login` | `login/route.ts` | 로그인 처리 |
| `POST /api/auth/logout` | `logout/route.ts` | 로그아웃 처리 |
| `GET /api/auth/me` | `me/route.ts` | 현재 사용자 정보 조회 |
| `POST /api/auth/register` | `register/route.ts` | 회원가입 처리 |

### 👑 Admin APIs (`api/admin/`)
| 엔드포인트 | 파일 | 설명 |
|------------|------|------|
| `GET /api/admin/stats` | `stats/route.ts` | 관리자 통계 데이터 |
| `PUT/DELETE /api/admin/boards/[id]` | `boards/[id]/route.ts` | 게시판 관리 (수정/삭제) |
| `GET /api/admin/user` | `user/route.ts` | 사용자 목록 조회 |
| `PUT/DELETE /api/admin/user/[id]` | `user/[id]/route.ts` | 특정 사용자 관리 |

### 📋 Board APIs (`api/boards/`)
| 엔드포인트 | 파일 | 설명 |
|------------|------|------|
| `GET/POST /api/boards` | `route.ts` | 게시판 목록 조회/생성 |
| `GET /api/boards/[id]` | `[id]/route.ts` | 특정 게시판 정보 |
| `GET/POST /api/boards/[id]/posts` | `[id]/posts/route.ts` | 게시판 내 글 목록/작성 |
| `GET/PUT/DELETE /api/boards/[id]/posts/[postId]` | `[id]/posts/[postId]/route.ts` | 개별 글 조회/수정/삭제 |

### 🔧 Other APIs
| 엔드포인트 | 파일 | 설명 |
|------------|------|------|
| `GET/POST /api/posts` | `posts/route.ts` | 전체 포스트 관련 API |
| `POST /api/comments` | `comments/route.ts` | 댓글 시스템 API |
| `GET/POST /api/guestbook` | `guestbook/route.ts` | 방명록 API |
| `GET/POST /api/todos` | `todos/route.ts` | 할일 목록 조회/생성 |
| `PUT/DELETE /api/todos/[id]` | `todos/[id]/route.ts` | 개별 할일 수정/삭제 |

## 🎨 Components

### 🔧 UI Components (`components/ui/`)
| 컴포넌트 | 설명 |
|----------|------|
| `Button.tsx` | 재사용 가능한 버튼 컴포넌트 |
| `Input.tsx` | 폼 입력 필드 컴포넌트 |
| `Modal.tsx` | 모달 다이얼로그 컴포넌트 |
| `DeleteConfirmModal.tsx` | 삭제 확인 모달 |

### 👑 Admin Components (`components/admin/`)
| 컴포넌트 | 설명 |
|----------|------|
| `AdminStats.tsx` | 관리자 통계 표시 컴포넌트 |
| `BoardManagement.tsx` | 게시판 관리 인터페이스 |
| `UserManagement.tsx` | 사용자 관리 인터페이스 |
| `GuestbookManagement.tsx` | 방명록 관리 인터페이스 |

### 📄 Content Components
| 컴포넌트 | 설명 |
|----------|------|
| `Layout.tsx` | 페이지 공통 레이아웃 컴포넌트 |
| `PostContent.tsx` | 게시글 내용 표시 컴포넌트 |
| `CommentSection.tsx` | 댓글 섹션 컴포넌트 |

## 🛠 Library (`lib/`)
| 파일 | 설명 |
|------|------|
| `auth.ts` | 인증 관련 유틸리티 함수 |
| `db.ts` | 데이터베이스 연결 및 설정 |
| `schema.ts` | 데이터베이스 스키마 정의 (Drizzle ORM 등) |

## 🚀 주요 기능

- **🔐 사용자 인증**: 로그인/회원가입/로그아웃
- **📋 게시판 시스템**: 다중 게시판 지원
- **📝 게시글 관리**: CRUD 기능 완비
- **💬 댓글 시스템**: 게시글별 댓글 기능
- **👑 관리자 패널**: 통계, 사용자/게시판 관리
- **📖 방명록**: 간단한 방명록 기능
- **✅ 할일 관리**: TODO 리스트 기능

## 🛠 기술 스택

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: CSS/Tailwind CSS 
- **Database**: 설정에 따라 다름 (neon[PostgreSQL])
- **ORM**: Drizzle ORM (테스트용)

## 🔧 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start
📝 주의사항
현재 오류 발생: layout.tsx 파일의 Geist Mono 폰트 설정에서 오류가 발생하고 있습니다.

# 오류 해결을 위한 캐시 클리어
rm -rf .next
npm run dev
본 문서는 프로젝트 구조를 기반으로 작성되었으며, 실제 구현 내용과 다를 수 있습니다.
