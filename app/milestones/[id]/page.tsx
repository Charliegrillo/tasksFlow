'use client'

import { useEffect, useState } from 'react'
import KanbanBoard from '@/components/kanban-board'

export default function MilestoneReportPage({ params }: { params: Promise<{ id: string }> }) {
  const [milestoneId, setMilestoneId] = useState<Promise<string> | null>(null)

  useEffect(() => {
    params.then(p => setMilestoneId(Promise.resolve(p.id)))
  }, [params])

  return <KanbanBoard milestoneId={milestoneId ?? undefined} />
}
