import { NextResponse } from 'next/server'
import { container } from '@/lib/infrastructure/di/container'

export async function GET(request: Request) {
  const clientId = Number(new URL(request.url).searchParams.get('clientId'))
  return NextResponse.json({ data: await container.spaceService.findByClientId(clientId || undefined) })
}

export async function POST(request: Request) {
  const body = await request.json()
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
  if (name.length > 60) return NextResponse.json({ error: 'El nombre es demasiado largo' }, { status: 400 })
  try {
    return NextResponse.json({ data: await container.spaceService.create({ name, color: body.color, clientId: Number(body.clientId) || undefined }) }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Ya existe un espacio con ese nombre' }, { status: 409 })
  }
}
