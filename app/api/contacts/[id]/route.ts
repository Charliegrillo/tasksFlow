import { NextResponse } from 'next/server'
import { updateContact, deleteContact } from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const result = await updateContact(Number(id), body)
  if (!result) return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 })
  return NextResponse.json({ data: result })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deleted = await deleteContact(Number(id))
  if (!deleted) return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 })
  return NextResponse.json({ data: null })
}
