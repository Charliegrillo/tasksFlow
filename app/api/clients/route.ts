import { NextResponse } from 'next/server'
import { container } from '@/lib/infrastructure/di/container'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const archived = url.searchParams.get('archived') === 'true'
  if (archived) return NextResponse.json({ data: await container.clientService.findArchived() })
  return NextResponse.json({ data: await container.clientService.findAll() })
}

export async function POST(request: Request) {
  const body = await request.json()
  if (typeof body.name !== 'string' || !body.name.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
  try { return NextResponse.json({ data: await container.clientService.create(body) }, { status: 201 }) } catch { return NextResponse.json({ error: 'Ya existe un cliente con ese nombre' }, { status: 409 }) }
}
