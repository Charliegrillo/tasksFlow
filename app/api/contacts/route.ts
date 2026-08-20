import { NextResponse } from 'next/server'
import { listContacts, createContact } from '@/lib/db'

export async function GET() {
  return NextResponse.json({ data: await listContacts() })
}

export async function POST(req: Request) {
  const body = await req.json()
  if (!body.name?.trim()) return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 })
  return NextResponse.json({ data: await createContact(body) }, { status: 201 })
}
