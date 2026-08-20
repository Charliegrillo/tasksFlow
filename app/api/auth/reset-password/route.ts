import { NextResponse } from 'next/server'
import { container } from '@/lib/infrastructure/di/container'

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json()
    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token y nueva contraseña son requeridos' }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }
    const userId = await container.authService.validateResetToken(token)
    if (!userId) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 })
    }
    const success = await container.authService.resetPassword(token, newPassword)
    if (!success) {
      return NextResponse.json({ error: 'Error al actualizar la contraseña' }, { status: 500 })
    }
    return NextResponse.json({ success: true, message: 'Contraseña actualizada correctamente' })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
