import { NextResponse } from 'next/server'
import { listChecklists, addChecklist } from '@/lib/db'

export async function GET(req: Request) { const taskId = Number(new URL(req.url).searchParams.get('taskId')); if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 }); return NextResponse.json({ data: await listChecklists(taskId) }) }

export async function POST(req: Request) { const { taskId, title } = await req.json(); if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 }); return NextResponse.json({ data: await addChecklist(taskId, title) }, { status: 201 }) }
