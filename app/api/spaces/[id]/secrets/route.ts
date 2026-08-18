import { NextResponse } from 'next/server'
import { createSpaceSecret, listSpaceSecrets, updateSpaceSecret, deleteSpaceSecret } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const spaceId = Number(id)
  return NextResponse.json({ data: listSpaceSecrets(spaceId) })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const value = typeof body.value === 'string' ? body.value : ''
  if (!name || !value) return NextResponse.json({ error: 'Nombre y valor son obligatorios' }, { status: 400 })

  const secret = createSpaceSecret(Number(id), {
    name,
    value,
    type: body.type ?? 'other',
    notes: body.notes ?? '',
  })

  return NextResponse.json({ data: secret }, { status: 201 })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const secret = updateSpaceSecret(Number(id), body)
  return secret ? NextResponse.json({ data: secret }) : NextResponse.json({ error: 'Secreto no encontrado' }, { status: 404 })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = new URL(request.url)
  const secretId = Number(url.searchParams.get('secretId'))
  if (!secretId) return NextResponse.json({ error: 'secretId requerido' }, { status: 400 })
  const deleted = deleteSpaceSecret(secretId)
  if (!deleted) return NextResponse.json({ error: 'Secreto no encontrado' }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
