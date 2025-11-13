// admin_user.js
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// SSL 설정 없이 연결
const sql = neon(process.env.DATABASE_URL, {
  ssl: false  // SSL 비활성화
});

async function createAdminUser() {
  try {
    console.log('데이터베이스 연결 중...');
    
    // 테이블 존재 확인
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      )
    `;
    
    if (!tableExists[0].exists) {
      console.log('users 테이블이 존재하지 않습니다. 테이블을 생성합니다.');
      
      // users 테이블 생성
      await sql`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'USER',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      console.log('✅ users 테이블이 생성되었습니다.');
    }

    // 관리자 존재 확인
    const existingAdmin = await sql`
      SELECT * FROM users WHERE role = 'ADMIN' LIMIT 1
    `;

    if (existingAdmin.length > 0) {
      console.log('관리자가 이미 존재합니다:', existingAdmin[0].email);
      return;
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash('admin123!', 10);

    // 관리자 계정 생성
    const result = await sql`
      INSERT INTO users (email, password, name, role, created_at)
      VALUES (${'admin@test.com'}, ${hashedPassword}, ${'관리자'}, ${'ADMIN'}, NOW())
      RETURNING *
    `;

    console.log('✅ 관리자 계정이 생성되었습니다:');
    console.log('📧 이메일: ad***@***********');
    console.log('🔑 비밀번호: admin123!');
    console.log('⚠️  로그인 후 반드시 비밀번호를 변경하세요!');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.error('상세:', error);
  }
}

createAdminUser();
