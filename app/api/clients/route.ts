import { NextResponse } from 'next/server'
import { createClient, listClients, listArchivedClients } from '@/lib/db'

export async function GET(request: Request) { const url = new URL(request.url); const archived = url.searchParams.get('archived') === 'true'; if (archived) return NextResponse.json({ data: await listArchivedClients() }); return NextResponse.json({ data: await listClients() }) }
export async function POST(request: Request) {
  const body = await request.json()
  if (typeof body.name !== 'string' || !body.name.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
  try { return NextResponse.json({ data: await createClient(body) }, { status: 201 }) } catch { return NextResponse.json({ error: 'Ya existe un cliente con ese nombre' }, { status: 409 }) }
}
