import { NextResponse } from 'next/server'
import { listMilestones, createMilestone, listArchivedMilestones } from '@/lib/db'

export async function GET(req: Request) { const url = new URL(req.url); const clientId = Number(url.searchParams.get('clientId')); const archived = url.searchParams.get('archived') === 'true'; if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 }); if (archived) return NextResponse.json({ data: listArchivedMilestones(clientId) }); return NextResponse.json({ data: listMilestones(clientId) }) }

export async function POST(req: Request) { const { name, color, clientId } = await req.json(); if (!name || !clientId) return NextResponse.json({ error: 'name and clientId required' }, { status: 400 }); return NextResponse.json({ data: createMilestone(name, color ?? 'bg-violet-500', clientId) }, { status: 201 }) }
