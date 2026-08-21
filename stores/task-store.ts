import { create } from 'zustand'
import type { Task, TaskStatus, TaskPriority, Attachment } from '@/lib/db'

interface TaskState {
  tasks: Task[]
  loading: boolean
  selected: Task | null
  attachments: Attachment[]
  attachmentCounts: Record<number, number>
  search: string
  filter: TaskPriority | 'all'
  filterStatus: TaskStatus | 'all'
  filterMilestone: number | 'all' | 'none'
  view: 'board' | 'list'

  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (task: Task) => void
  removeTask: (id: number) => void
  setSelected: (task: Task | null) => void
  moveTask: (id: number, status: TaskStatus, position: number) => void
  setAttachments: (attachments: Attachment[]) => void
  addAttachment: (attachment: Attachment) => void
  removeAttachment: (id: number) => void
  setAttachmentCounts: (counts: Record<number, number>) => void
  setSearch: (search: string) => void
  setFilter: (filter: TaskPriority | 'all') => void
  setFilterStatus: (status: TaskStatus | 'all') => void
  setFilterMilestone: (milestone: number | 'all' | 'none') => void
  setView: (view: 'board' | 'list') => void
  setLoading: (loading: boolean) => void
  fetchTasks: () => Promise<void>
  createTask: (data: { title: string; status?: TaskStatus; boardId?: number }) => Promise<Task | null>
  updateTaskField: (id: number, data: Record<string, unknown>) => Promise<boolean>
  deleteTask: (id: number) => Promise<boolean>
  fetchAttachments: (taskId: number) => Promise<void>
  uploadFiles: (taskId: number, files: FileList | File[]) => Promise<void>
  deleteAttachment: (attachment: Attachment) => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: true,
  selected: null,
  attachments: [],
  attachmentCounts: {},
  search: '',
  filter: 'all',
  filterStatus: 'all',
  filterMilestone: 'all',
  view: 'board',

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
  updateTask: (task) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === task.id ? task : t)) })),
  removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id), selected: s.selected?.id === id ? null : s.selected })),
  setSelected: (task) => set({ selected: task }),
  moveTask: (id, status, position) => set((s) => {
    const task = s.tasks.find((t) => t.id === id)
    if (!task) return s
    const updated = s.tasks.map((t) => (t.id === id ? { ...t, status, position } : t))
    const others = updated.filter((t) => t.status === status && t.id !== id).sort((a, b) => a.position - b.position)
    others.splice(position, 0, { ...task, status, position })
    return {
      tasks: updated.map((t) => {
        if (t.status !== status || t.id === id) return t
        const idx = others.findIndex((o) => o.id === t.id)
        return idx >= 0 ? { ...t, position: idx } : t
      }),
    }
  }),
  setAttachments: (attachments) => set({ attachments }),
  addAttachment: (attachment) => set((s) => ({ attachments: [attachment, ...s.attachments] })),
  removeAttachment: (id) => set((s) => ({ attachments: s.attachments.filter((a) => a.id !== id) })),
  setAttachmentCounts: (counts) => set({ attachmentCounts: counts }),
  setSearch: (search) => set({ search }),
  setFilter: (filter) => set({ filter }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterMilestone: (milestone) => set({ filterMilestone: milestone }),
  setView: (view) => set({ view }),
  setLoading: (loading) => set({ loading }),

  fetchTasks: async () => {
    try {
      const res = await fetch('/api/tasks')
      const { data } = await res.json()
      set({ tasks: data ?? [] })
    } catch {
      set({ tasks: [] })
    }
  },

  createTask: async (data) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) return null
    const { data: task } = await res.json()
    set((s) => ({ tasks: [...s.tasks, task] }))
    return task
  },

  updateTaskField: async (id, data) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) return false
    const { data: updated } = await res.json()
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === updated.id ? updated : t)),
      selected: s.selected?.id === updated.id ? { ...s.selected, ...updated } : s.selected,
    }))
    return true
  },

  deleteTask: async (id) => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (!res.ok) return false
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id), selected: s.selected?.id === id ? null : s.selected }))
    return true
  },

  fetchAttachments: async (taskId) => {
    const result = await fetch(`/api/attachments?taskId=${taskId}`).then((r) => r.json())
    const items = Array.isArray(result.data)
      ? result.data.filter((item: Attachment | null | undefined): item is Attachment => Boolean(item?.id && item.name))
      : []
    set({ attachments: items })
  },

  uploadFiles: async (taskId, files) => {
    const uploaded = await Promise.all(
      Array.from(files).map(async (file) => {
        const form = new FormData()
        form.append('taskId', String(taskId))
        form.append('file', file)
        const response = await fetch('/api/attachments', { method: 'POST', body: form })
        const payload = await response.json()
        if (!response.ok || !payload.data?.id) throw new Error(payload.error || `No se pudo subir ${file.name}`)
        return payload.data as Attachment
      })
    )
    const valid = uploaded.filter((item) => item?.id && item.name)
    set((s) => ({
      attachments: [...valid, ...s.attachments],
      attachmentCounts: { ...s.attachmentCounts, [taskId]: (s.attachmentCounts[taskId] ?? 0) + valid.length },
    }))
  },

  deleteAttachment: async (attachment) => {
    await fetch(`/api/attachments/${attachment.id}`, { method: 'DELETE' })
    set((s) => ({ attachments: s.attachments.filter((a) => a.id !== attachment.id) }))
  },
}))
