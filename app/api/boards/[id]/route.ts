import { NextResponse } from 'next/server'
import { container } from '@/lib/infrastructure/di/container'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  if (body.archived === true) {
    const board = await container.boardService.archive(Number(id))
    return board ? NextResponse.json({ data: board }) : NextResponse.json({ error: 'Tablero no encontrado' }, { status: 404 })
  }
  if (body.archived === false) {
    const board = await container.boardService.unarchive(Number(id))
    return board ? NextResponse.json({ data: board }) : NextResponse.json({ error: 'Tablero no encontrado' }, { status: 404 })
  }
  const board = await container.boardService.update(Number(id), body)
  return board ? NextResponse.json({ data: board }) : NextResponse.json({ error: 'Tablero no encontrado' }, { status: 404 })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deleted = await container.boardService.delete(Number(id))
  if (!deleted) return NextResponse.json({ error: 'No se puede eliminar el tablero o es el último disponible' }, { status: 409 })
  return new NextResponse(null, { status: 204 })
}
