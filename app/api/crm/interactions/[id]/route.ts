import { NextResponse } from 'next/server'
import { deleteCrmInteraction } from '@/lib/db'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deleted = deleteCrmInteraction(Number(id))
  if (!deleted) return NextResponse.json({ error: 'Interacción no encontrada' }, { status: 404 })
  return NextResponse.json({ data: null })
}
