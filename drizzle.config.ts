import type { Config } from 'drizzle-kit'
import { config } from 'dotenv'

// .env 파일 로드
config()

export default {
  schema: './src/lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!, // connectionString → url로 변경
  },
} satisfies Config
