import { NextResponse } from 'next/server'
import { createSpace, listSpaces } from '@/lib/db'

export async function GET(request: Request) {
  const clientId = Number(new URL(request.url).searchParams.get('clientId'))
  return NextResponse.json({ data: await listSpaces(clientId || undefined) })
}

export async function POST(request: Request) {
  const body = await request.json()
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
  if (name.length > 60) return NextResponse.json({ error: 'El nombre es demasiado largo' }, { status: 400 })
  try {
    return NextResponse.json({ data: await createSpace(name, body.color, Number(body.clientId) || undefined, body.secretPassword ?? null) }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Ya existe un espacio con ese nombre' }, { status: 409 })
  }
}
