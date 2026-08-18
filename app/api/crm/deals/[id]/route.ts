import { NextResponse } from 'next/server'
import { updateCrmDeal, deleteCrmDeal } from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const result = updateCrmDeal(Number(id), body)
  if (!result) return NextResponse.json({ error: 'Deal no encontrado' }, { status: 404 })
  return NextResponse.json({ data: result })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deleted = deleteCrmDeal(Number(id))
  if (!deleted) return NextResponse.json({ error: 'Deal no encontrado' }, { status: 404 })
  return NextResponse.json({ data: null })
}
