import { NextResponse } from 'next/server'
import { deleteBoardList, reorderBoardList } from '@/lib/db'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  const body = await request.json()
  const position = Number(body.position ?? body.index ?? body.newPosition)
  if (Number.isNaN(position)) return NextResponse.json({ error: 'position requerido' }, { status: 400 })
  const lists = await reorderBoardList(id, position)
  if (!lists.length) return NextResponse.json({ error: 'Lista no encontrada' }, { status: 404 })
  return NextResponse.json({ data: lists })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const deleted = await deleteBoardList(Number((await params).id))
  if (!deleted) return NextResponse.json({ error: 'No se puede eliminar la última lista' }, { status: 400 })
  return NextResponse.json({ data: true })
}
