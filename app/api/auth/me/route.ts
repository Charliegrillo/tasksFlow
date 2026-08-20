import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { container } from '@/lib/infrastructure/di/container'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ user: null })
  }
  const user = await container.authService.getUserById(session.userId)
  if (!user) {
    return NextResponse.json({ user: null })
  }
  return NextResponse.json({ user })
}
