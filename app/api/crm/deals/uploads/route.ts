import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { createCrmDealAttachment } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const dealId = Number(formData.get('dealId'))

    if (!(file instanceof File) || !dealId) {
      return NextResponse.json({ error: 'Archivo y dealId requeridos' }, { status: 400 })
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo supera el límite de 25 MB' }, { status: 413 })
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const blob = await put(`crm/deals/${dealId}/${crypto.randomUUID()}-${safeName}`, file, { access: 'public', addRandomSuffix: false })

    return NextResponse.json({
      data: createCrmDealAttachment({
        dealId,
        name: file.name,
        pathname: blob.url,
        size: file.size,
        contentType: file.type || 'application/octet-stream',
      }),
    }, { status: 201 })
  } catch (error) {
    console.error('[crm] attachment upload failed', error)
    return NextResponse.json({ error: 'No se pudo subir el archivo' }, { status: 500 })
  }
}
