import { useEffect, useMemo } from 'react'
import { useTaskStore } from '@/stores/task-store'
import { useBoardStore } from '@/stores/board-store'
import type { Task } from '@/lib/db'

export function useTasks() {
  const tasks = useTaskStore((s) => s.tasks)
  const loading = useTaskStore((s) => s.loading)
  const selected = useTaskStore((s) => s.selected)
  const search = useTaskStore((s) => s.search)
  const filter = useTaskStore((s) => s.filter)
  const filterStatus = useTaskStore((s) => s.filterStatus)
  const filterMilestone = useTaskStore((s) => s.filterMilestone)
  const activeBoard = useBoardStore((s) => s.activeBoard)
  const selectedMilestoneId = useBoardStore((s) => s.selectedMilestoneId)
  const resolvedMilestoneId = null

  const visible = useMemo(() => {
    let base: Task[]
    if (selectedMilestoneId) {
      base = tasks.filter((t) => t.milestoneId === selectedMilestoneId)
    } else if (resolvedMilestoneId) {
      base = tasks.filter((t) => t.milestoneId === resolvedMilestoneId)
    } else if (activeBoard) {
      base = tasks.filter((t) => t.boardId === activeBoard)
    } else {
      base = []
    }

    return base
      .filter(
        (t) =>
          (filter === 'all' || t.priority === filter) &&
          (filterStatus === 'all' || t.status === filterStatus) &&
          (filterMilestone === 'all' ? true : filterMilestone === 'none' ? t.milestoneId == null : t.milestoneId === filterMilestone) &&
          t.title.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => a.position - b.position)
  }, [tasks, search, filter, filterStatus, filterMilestone, activeBoard, resolvedMilestoneId, selectedMilestoneId])

  const completed = useMemo(() => tasks.filter((t) => t.status === 'done').length, [tasks])

  return { tasks, loading, selected, visible, completed }
}
