import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getPasswordResetToken, updateUserPassword, deletePasswordResetToken } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json()
    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token y nueva contraseña son requeridos' }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }
    const resetToken = getPasswordResetToken(token)
    if (!resetToken) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 })
    }
    const passwordHash = await bcrypt.hash(newPassword, 10)
    updateUserPassword(resetToken.userId, passwordHash)
    deletePasswordResetToken(token)
    return NextResponse.json({ success: true, message: 'Contraseña actualizada correctamente' })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
