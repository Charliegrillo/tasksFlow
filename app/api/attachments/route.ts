import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { createAttachment, listAttachments } from '@/lib/db'

export async function GET(request: NextRequest) {
  const taskId = Number(request.nextUrl.searchParams.get('taskId'))
  return NextResponse.json({ data: await listAttachments(taskId || undefined) })
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const taskId = Number(formData.get('taskId'))
    if (!(file instanceof File) || !taskId) return NextResponse.json({ error: 'Archivo y tarea requeridos' }, { status: 400 })
    if (file.size > 25 * 1024 * 1024) return NextResponse.json({ error: 'El archivo supera el límite de 25 MB' }, { status: 413 })
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const blob = await put(`tasks/${taskId}/${crypto.randomUUID()}-${safeName}`, file, { access: 'public', addRandomSuffix: false })
    return NextResponse.json({ data: { ...await createAttachment({ taskId, name: file.name, pathname: blob.url, size: file.size, contentType: file.type || 'application/octet-stream' }), url: blob.url } }, { status: 201 })
  } catch (error) {
    console.error('[v0] attachment upload failed', error)
    const message = error instanceof Error ? error.message : 'No se pudo subir el archivo'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
