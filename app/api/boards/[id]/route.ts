import { NextResponse } from 'next/server'
import { deleteBoard, updateBoard, archiveBoard, unarchiveBoard } from '@/lib/db'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  if (body.archived === true) {
    const board = archiveBoard(Number(id))
    return board ? NextResponse.json({ data: board }) : NextResponse.json({ error: 'Tablero no encontrado' }, { status: 404 })
  }
  if (body.archived === false) {
    const board = unarchiveBoard(Number(id))
    return board ? NextResponse.json({ data: board }) : NextResponse.json({ error: 'Tablero no encontrado' }, { status: 404 })
  }
  const board = updateBoard(Number(id), body)
  return board ? NextResponse.json({ data: board }) : NextResponse.json({ error: 'Tablero no encontrado' }, { status: 404 })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deleted = deleteBoard(Number(id))
  if (!deleted) return NextResponse.json({ error: 'No se puede eliminar el tablero o es el último disponible' }, { status: 409 })
  return new NextResponse(null, { status: 204 })
}
