import { del, get } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { deleteAttachment } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  const pathname = request.nextUrl.searchParams.get('pathname')
  if (!pathname || !id) return NextResponse.json({ error: 'Archivo inválido' }, { status: 400 })
  try {
    const result = await get(pathname, { access: 'private' })
    if (!result) return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
    return new NextResponse(result.stream, { headers: { 'Content-Type': result.blob.contentType || 'application/octet-stream', 'Content-Disposition': `inline; filename="${encodeURIComponent(result.blob.pathname.split('/').pop() || 'archivo')}"`, 'Cache-Control': 'private, no-cache' } })
  } catch { return NextResponse.json({ error: 'No se pudo leer el archivo' }, { status: 500 }) }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const attachment = deleteAttachment(Number((await params).id))
  if (!attachment) return NextResponse.json({ error: 'Adjunto no encontrado' }, { status: 404 })
  await del(attachment.pathname)
  return NextResponse.json({ ok: true })
}
