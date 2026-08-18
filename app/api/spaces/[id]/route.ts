import { NextResponse } from 'next/server'
import { deleteSpace, getSpace, updateSpace, validateSpacePassword } from '@/lib/db'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const space = getSpace(Number(id))
  return space ? NextResponse.json({ data: space }) : NextResponse.json({ error: 'Espacio no encontrado' }, { status: 404 })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const space = updateSpace(Number(id), body)
  return space ? NextResponse.json({ data: space }) : NextResponse.json({ error: 'Espacio no encontrado' }, { status: 404 })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const entered = typeof body.password === 'string' ? body.password : ''
  const ok = validateSpacePassword(Number(id), entered)
  return NextResponse.json({ valid: ok })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deleted = deleteSpace(Number(id))
  if (!deleted) return NextResponse.json({ error: 'No se puede eliminar el espacio o es el último disponible' }, { status: 409 })
  return new NextResponse(null, { status: 204 })
}
