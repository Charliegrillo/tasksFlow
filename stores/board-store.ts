import { create } from 'zustand'
import type { Board, BoardList, Client, Milestone, Space, BoardPaymentStatus } from '@/lib/db'

interface BoardState {
  clients: Client[]
  activeClient: number | null
  spaces: Space[]
  activeSpace: number | null
  boards: Board[]
  activeBoard: number | null
  allBoards: Board[]
  boardLists: BoardList[]
  milestones: Milestone[]
  selectedMilestoneId: number | null

  setClients: (clients: Client[]) => void
  setActiveClient: (id: number | null) => void
  setSpaces: (spaces: Space[]) => void
  setActiveSpace: (id: number | null) => void
  setBoards: (boards: Board[]) => void
  setActiveBoard: (id: number | null) => void
  setAllBoards: (boards: Board[]) => void
  setBoardLists: (lists: BoardList[]) => void
  setMilestones: (milestones: Milestone[]) => void
  setSelectedMilestoneId: (id: number | null) => void

  fetchClients: () => Promise<void>
  createClient: (data: { name: string; email?: string; company?: string }) => Promise<Client | null>
  updateClient: (id: number, data: Record<string, unknown>) => Promise<boolean>
  deleteClient: (id: number) => Promise<boolean>
  archiveClient: (id: number) => Promise<boolean>

  fetchSpaces: (clientId: number) => Promise<void>
  createSpace: (data: { name: string; color?: string; clientId: number }) => Promise<Space | null>
  updateSpace: (id: number, data: Record<string, unknown>) => Promise<boolean>
  deleteSpace: (id: number) => Promise<boolean>

  fetchBoards: (spaceId: number) => Promise<void>
  fetchAllBoards: (spaceIds: number[]) => Promise<void>
  createBoard: (data: { name: string; type: string; spaceId: number }) => Promise<Board | null>
  updateBoard: (id: number, data: Record<string, unknown>) => Promise<boolean>
  deleteBoard: (id: number) => Promise<boolean>
  archiveBoard: (id: number) => Promise<boolean>
  updatePaymentStatus: (id: number, status: BoardPaymentStatus) => Promise<boolean>

  fetchBoardLists: (boardId: number) => Promise<void>
  fetchAllBoardLists: () => Promise<void>
  createBoardList: (boardId: number, name: string) => Promise<BoardList | null>
  deleteBoardList: (id: number) => Promise<boolean>
  reorderBoardList: (listId: number, position: number) => Promise<void>

  fetchMilestones: (clientId: number) => Promise<void>
  createMilestone: (data: { name: string; color: string; clientId: number }) => Promise<Milestone | null>
  updateMilestone: (id: number, data: Record<string, unknown>) => Promise<boolean>
  deleteMilestone: (id: number) => Promise<boolean>
  archiveMilestone: (id: number) => Promise<boolean>
}

export const useBoardStore = create<BoardState>((set, get) => ({
  clients: [],
  activeClient: null,
  spaces: [],
  activeSpace: null,
  boards: [],
  activeBoard: null,
  allBoards: [],
  boardLists: [],
  milestones: [],
  selectedMilestoneId: null,

  setClients: (clients) => set({ clients }),
  setActiveClient: (id) => set({ activeClient: id }),
  setSpaces: (spaces) => set({ spaces }),
  setActiveSpace: (id) => set({ activeSpace: id }),
  setBoards: (boards) => set({ boards }),
  setActiveBoard: (id) => set({ activeBoard: id }),
  setAllBoards: (boards) => set({ allBoards: boards }),
  setBoardLists: (lists) => set({ boardLists: lists }),
  setMilestones: (milestones) => set({ milestones }),
  setSelectedMilestoneId: (id) => set({ selectedMilestoneId: id }),

  fetchClients: async () => {
    try {
      const res = await fetch('/api/clients')
      const { data } = await res.json()
      set({ clients: data ?? [] })
    } catch {
      set({ clients: [] })
    }
  },

  createClient: async (data) => {
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) return null
    const { data: client } = await res.json()
    set((s) => ({ clients: [...s.clients, client] }))
    return client
  },

  updateClient: async (id, data) => {
    const res = await fetch(`/api/clients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) return false
    const { data: updated } = await res.json()
    set((s) => ({ clients: s.clients.map((c) => (c.id === updated.id ? updated : c)) }))
    return true
  },

  deleteClient: async (id) => {
    const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    if (!res.ok) return false
    set((s) => {
      const remaining = s.clients.filter((c) => c.id !== id)
      return { clients: remaining, activeClient: remaining[0]?.id ?? null }
    })
    return true
  },

  archiveClient: async (id) => {
    const res = await fetch(`/api/clients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: true }),
    })
    if (!res.ok) return false
    set((s) => {
      const remaining = s.clients.filter((c) => c.id !== id)
      return { clients: remaining, activeClient: s.activeClient === id ? remaining[0]?.id ?? null : s.activeClient }
    })
    return true
  },

  fetchSpaces: async (clientId) => {
    try {
      const res = await fetch(`/api/spaces?clientId=${clientId}`)
      const { data } = await res.json()
      set({ spaces: data ?? [], activeSpace: data?.[0]?.id ?? null })
    } catch {
      set({ spaces: [], activeSpace: null })
    }
  },

  createSpace: async (data) => {
    const res = await fetch('/api/spaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) return null
    const { data: space } = await res.json()
    set((s) => ({ spaces: [...s.spaces, space] }))
    return space
  },

  updateSpace: async (id, data) => {
    const res = await fetch(`/api/spaces/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) return false
    const { data: updated } = await res.json()
    set((s) => ({ spaces: s.spaces.map((sp) => (sp.id === updated.id ? updated : sp)) }))
    return true
  },

  deleteSpace: async (id) => {
    const res = await fetch(`/api/spaces/${id}`, { method: 'DELETE' })
    if (!res.ok) return false
    set((s) => {
      const remaining = s.spaces.filter((sp) => sp.id !== id)
      return { spaces: remaining, activeSpace: remaining[0]?.id ?? null }
    })
    return true
  },

  fetchBoards: async (spaceId) => {
    try {
      const res = await fetch(`/api/boards?spaceId=${spaceId}`)
      const { data } = await res.json()
      set({ boards: data ?? [] })
    } catch {
      set({ boards: [] })
    }
  },

  fetchAllBoards: async (spaceIds) => {
    try {
      const results = await Promise.all(spaceIds.map((sid) => fetch(`/api/boards?spaceId=${sid}`).then((r) => r.json())))
      const all = results.flatMap((r) => r.data ?? [])
      set({ allBoards: all })
    } catch {
      set({ allBoards: [] })
    }
  },

  createBoard: async (data) => {
    const res = await fetch('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) return null
    const { data: board } = await res.json()
    set((s) => ({ boards: [...s.boards, board], allBoards: [...s.allBoards, board] }))
    return board
  },

  updateBoard: async (id, data) => {
    const res = await fetch(`/api/boards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) return false
    const { data: updated } = await res.json()
    set((s) => ({
      boards: s.boards.map((b) => (b.id === updated.id ? updated : b)),
      allBoards: s.allBoards.map((b) => (b.id === updated.id ? updated : b)),
    }))
    return true
  },

  deleteBoard: async (id) => {
    const res = await fetch(`/api/boards/${id}`, { method: 'DELETE' })
    if (!res.ok) return false
    set((s) => {
      const remaining = s.boards.filter((b) => b.id !== id)
      return {
        boards: remaining,
        allBoards: s.allBoards.filter((b) => b.id !== id),
        activeBoard: s.activeBoard === id ? remaining[0]?.id ?? null : s.activeBoard,
      }
    })
    return true
  },

  archiveBoard: async (id) => {
    const res = await fetch(`/api/boards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: true }),
    })
    if (!res.ok) return false
    set((s) => {
      const remaining = s.boards.filter((b) => b.id !== id)
      return {
        boards: remaining,
        allBoards: s.allBoards.filter((b) => b.id !== id),
        activeBoard: s.activeBoard === id ? remaining[0]?.id ?? null : s.activeBoard,
      }
    })
    return true
  },

  updatePaymentStatus: async (id, status) => {
    const res = await fetch(`/api/boards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentStatus: status }),
    })
    if (!res.ok) return false
    const { data: updated } = await res.json()
    set((s) => ({
      boards: s.boards.map((b) => (b.id === updated.id ? updated : b)),
      allBoards: s.allBoards.map((b) => (b.id === updated.id ? updated : b)),
      activeBoard: updated.paymentStatus !== 'pendiente' && s.activeBoard === id ? null : s.activeBoard,
    }))
    return true
  },

  fetchBoardLists: async (boardId) => {
    try {
      const res = await fetch(`/api/lists?boardId=${boardId}`)
      const { data } = await res.json()
      set({ boardLists: data ?? [] })
    } catch {
      set({ boardLists: [] })
    }
  },

  fetchAllBoardLists: async () => {
    const { allBoards } = get()
    try {
      const results = await Promise.all(allBoards.map((b) => fetch(`/api/lists?boardId=${b.id}`).then((r) => r.json())))
      const all = results.flatMap((r) => r.data ?? [])
      const seen = new Set<string>()
      const unique = all.filter((l: BoardList) => {
        if (seen.has(l.name)) return false
        seen.add(l.name)
        return true
      })
      set({ boardLists: unique })
    } catch {
      set({ boardLists: [] })
    }
  },

  createBoardList: async (boardId, name) => {
    const res = await fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardId, name }),
    })
    if (!res.ok) return null
    const { data: list } = await res.json()
    set((s) => ({ boardLists: [...s.boardLists, list] }))
    return list
  },

  deleteBoardList: async (id) => {
    const res = await fetch(`/api/lists/${id}`, { method: 'DELETE' })
    if (!res.ok) return false
    set((s) => ({ boardLists: s.boardLists.filter((l) => l.id !== id) }))
    return true
  },

  reorderBoardList: async (listId, position) => {
    const { boardLists } = get()
    const currentIndex = boardLists.findIndex((l) => l.id === listId)
    if (currentIndex === -1) return
    const reordered = [...boardLists]
    const [moved] = reordered.splice(currentIndex, 1)
    reordered.splice(position, 0, moved)
    set({ boardLists: reordered })
    await fetch(`/api/lists/${listId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position }),
    })
  },

  fetchMilestones: async (clientId) => {
    try {
      const res = await fetch(`/api/milestones?clientId=${clientId}`)
      const { data } = await res.json()
      set({ milestones: data ?? [] })
    } catch {
      set({ milestones: [] })
    }
  },

  createMilestone: async (data) => {
    const res = await fetch('/api/milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) return null
    const { data: milestone } = await res.json()
    set((s) => ({ milestones: [...s.milestones, milestone] }))
    return milestone
  },

  updateMilestone: async (id, data) => {
    const res = await fetch(`/api/milestones/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) return false
    const { data: updated } = await res.json()
    set((s) => ({ milestones: s.milestones.map((m) => (m.id === updated.id ? updated : m)) }))
    return true
  },

  deleteMilestone: async (id) => {
    const res = await fetch(`/api/milestones/${id}`, { method: 'DELETE' })
    if (!res.ok) return false
    set((s) => ({ milestones: s.milestones.filter((m) => m.id !== id) }))
    return true
  },

  archiveMilestone: async (id) => {
    const res = await fetch(`/api/milestones/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: true }),
    })
    if (!res.ok) return false
    set((s) => ({
      milestones: s.milestones.filter((m) => m.id !== id),
      selectedMilestoneId: s.selectedMilestoneId === id ? null : s.selectedMilestoneId,
    }))
    return true
  },
}))
