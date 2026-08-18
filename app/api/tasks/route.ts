import { NextResponse } from 'next/server'
import { createTask, listTasks } from '@/lib/db'

export async function GET() { return NextResponse.json({ data: listTasks() }) }
export async function POST(request: Request) {
  const body = await request.json()
  if (!body.title?.trim()) return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 })
  return NextResponse.json({ data: createTask(body) }, { status: 201 })
}
