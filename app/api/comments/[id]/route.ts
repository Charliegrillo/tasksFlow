import { NextResponse } from 'next/server'
import { updateComment, deleteComment } from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; const { content } = await req.json(); if (!content) return NextResponse.json({ error: 'content required' }, { status: 400 }); const result = await updateComment(Number(id), content); if (!result) return NextResponse.json({ error: 'not found' }, { status: 404 }); return NextResponse.json({ data: result }) }

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; const ok = await deleteComment(Number(id)); if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 }); return NextResponse.json({ ok: true }) }
