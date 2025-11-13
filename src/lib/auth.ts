import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: any): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' })
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!)
  } catch (error) {
    return null
  }
}

export async function getUserFromToken(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) return null

    const decoded = verifyToken(token)
    return decoded
  } catch (error) {
    return null
  }
}
