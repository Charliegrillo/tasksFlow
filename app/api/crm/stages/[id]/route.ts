import { NextResponse } from 'next/server'
import { updateCrmStage, deleteCrmStage } from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const result = await updateCrmStage(Number(id), body)
  if (!result) return NextResponse.json({ error: 'Etapa no encontrada' }, { status: 404 })
  return NextResponse.json({ data: result })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deleted = await deleteCrmStage(Number(id))
  if (!deleted) return NextResponse.json({ error: 'Etapa no encontrada o es la única' }, { status: 400 })
  return NextResponse.json({ data: null })
}
