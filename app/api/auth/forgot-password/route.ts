import { NextResponse } from 'next/server'
import { container } from '@/lib/infrastructure/di/container'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email es requerido' }, { status: 400 })
    }
    const token = await container.authService.createResetToken(email)
    if (token) {
      console.log(`\n=== PASSWORD RESET TOKEN ===\nUser: ${email}\nToken: ${token}\nUse: /reset-password?token=${token}\n============================\n`)
    }
    return NextResponse.json({ success: true, message: 'Si el email existe, recibirás un enlace de recuperación' })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
