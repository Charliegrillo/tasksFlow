import { NextResponse } from 'next/server'
import { deleteClient, updateClient, archiveClient, unarchiveClient } from '@/lib/db'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const input = await request.json()
  if (input.archived === true) {
    const result = await archiveClient(Number(id))
    if (!result) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    return NextResponse.json({ data: result })
  }
  if (input.archived === false) {
    const result = await unarchiveClient(Number(id))
    if (!result) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    return NextResponse.json({ data: result })
  }
  const data = await updateClient(Number(id), input)
  return data ? NextResponse.json({ data }) : NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; if (!await deleteClient(Number(id))) return NextResponse.json({ error: 'No se puede eliminar el último cliente' }, { status: 409 }); return new NextResponse(null, { status: 204 }) }
