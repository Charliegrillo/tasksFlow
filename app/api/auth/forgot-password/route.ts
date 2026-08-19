import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getUserByEmail, createPasswordResetToken } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email es requerido' }, { status: 400 })
    }
    const user = getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ success: true, message: 'Si el email existe, recibirás un enlace de recuperación' })
    }
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    createPasswordResetToken(user.id, token, expiresAt)
    console.log(`\n=== PASSWORD RESET TOKEN ===\nUser: ${user.email}\nToken: ${token}\nExpires: ${expiresAt}\nUse: /reset-password?token=${token}\n============================\n`)
    return NextResponse.json({ success: true, message: 'Si el email existe, recibirás un enlace de recuperación' })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
