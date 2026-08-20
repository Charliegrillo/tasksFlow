import { NextResponse } from 'next/server'
import { listCrmDealComments, addCrmDealComment, listCrmDealAttachments, createCrmDealAttachment, deleteCrmDealAttachment, deleteCrmDealComment } from '@/lib/db'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dealId = Number(id)
  if (!dealId) return NextResponse.json({ error: 'dealId inválido' }, { status: 400 })

  return NextResponse.json({
    data: {
      comments: await listCrmDealComments(dealId),
      attachments: await listCrmDealAttachments(dealId),
    },
  })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const dealId = Number(id)

  if (!dealId) return NextResponse.json({ error: 'dealId inválido' }, { status: 400 })

  if (body.action === 'comment') {
    if (!body.content) return NextResponse.json({ error: 'content requerido' }, { status: 400 })
    return NextResponse.json({ data: await addCrmDealComment(dealId, body.author ?? 'Usuario', body.content) }, { status: 201 })
  }

  if (body.action === 'attachment') {
    if (!body.name || !body.pathname) return NextResponse.json({ error: 'name y pathname requeridos' }, { status: 400 })
    return NextResponse.json({ data: await createCrmDealAttachment({ dealId, name: body.name, pathname: body.pathname, size: body.size ?? 0, contentType: body.contentType ?? 'application/octet-stream' }) }, { status: 201 })
  }

  return NextResponse.json({ error: 'acción inválida' }, { status: 400 })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dealId = Number(id)
  const body = await req.json().catch(() => ({}))

  if (!dealId) return NextResponse.json({ error: 'dealId inválido' }, { status: 400 })

  if (body.type === 'comment' && body.commentId) {
    const deleted = await deleteCrmDealComment(Number(body.commentId))
    return deleted ? NextResponse.json({ data: null }) : NextResponse.json({ error: 'Comentario no encontrado' }, { status: 404 })
  }

  if (body.type === 'attachment' && body.attachmentId) {
    const deleted = await deleteCrmDealAttachment(Number(body.attachmentId))
    return deleted ? NextResponse.json({ data: null }) : NextResponse.json({ error: 'Adjunto no encontrado' }, { status: 404 })
  }

  return NextResponse.json({ error: 'tipo inválido' }, { status: 400 })
}
