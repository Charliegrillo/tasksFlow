import { NextResponse } from 'next/server'
import { listComments, addComment } from '@/lib/db'

export async function GET(req: Request) { const taskId = Number(new URL(req.url).searchParams.get('taskId')); if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 }); return NextResponse.json({ data: listComments(taskId) }) }

export async function POST(req: Request) { const { taskId, author, content } = await req.json(); if (!taskId || !content) return NextResponse.json({ error: 'taskId and content required' }, { status: 400 }); return NextResponse.json({ data: addComment(taskId, author ?? 'Usuario', content) }, { status: 201 }) }
