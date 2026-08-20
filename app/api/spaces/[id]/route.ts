import { NextResponse } from 'next/server'
import { container } from '@/lib/infrastructure/di/container'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const space = await container.spaceService.findById(Number(id))
  return space ? NextResponse.json({ data: space }) : NextResponse.json({ error: 'Espacio no encontrado' }, { status: 404 })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const space = await container.spaceService.update(Number(id), body)
  return space ? NextResponse.json({ data: space }) : NextResponse.json({ error: 'Espacio no encontrado' }, { status: 404 })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const entered = typeof body.password === 'string' ? body.password : ''
  const ok = await container.spaceService.validatePassword(Number(id), entered)
  return NextResponse.json({ valid: ok })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deleted = await container.spaceService.delete(Number(id))
  if (!deleted) return NextResponse.json({ error: 'No se puede eliminar el espacio o es el último disponible' }, { status: 409 })
  return new NextResponse(null, { status: 204 })
}
