import { create } from 'zustand'
import type { Client, Space, Board, Milestone, Contact, TaskStatus, CrmStage, CrmDeal, CrmInteraction } from '@/lib/db'

type DialogState<T = Record<string, unknown>> = { open: boolean; mode: 'add' | 'edit'; data?: T }

interface ConfirmDialogState {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  variant?: 'destructive' | 'warning'
  onConfirm: () => void
}

interface UiState {
  sidebarCollapsed: boolean
  activeView: 'board' | 'crm' | 'contacts' | 'pipelines' | 'invoices' | null
  detailTab: 'details' | 'checklists' | 'attachments'
  budgetOpen: boolean
  archiveOpen: boolean
  spaceSecretsOpen: boolean
  spaceSecretsId: number | null
  archivedBoardsOpen: boolean
  archivedMilestonesOpen: boolean
  archivedClientsOpen: boolean
  showComments: boolean
  newTaskStatus: TaskStatus
  addingToColumn: TaskStatus | null
  columnInputs: Record<string, string>
  menu: TaskStatus | null
  isUploading: boolean
  uploadError: string | null
  newTitle: string

  draggedId: number | null
  draggingColumnId: number | null
  dragOver: TaskStatus | null
  dropIndex: number | null
  draggedListId: number | null

  clientDialog: DialogState<Client>
  spaceDialog: DialogState<Space>
  boardDialog: DialogState<Board>
  milestoneDialog: DialogState<Milestone>
  contactDialog: DialogState<Contact>
  newListDialog: { open: boolean; name: string }
  listMoveDialog: { open: boolean; listId: number | null; position: number }
  confirmDialog: ConfirmDialogState

  contacts: Contact[]
  crmStages: CrmStage[]
  crmDeals: CrmDeal[]
  crmInteractions: Record<number, CrmInteraction[]>

  setSidebarCollapsed: (collapsed: boolean) => void
  setActiveView: (view: 'board' | 'crm' | 'contacts' | 'pipelines' | 'invoices' | null) => void
  setDetailTab: (tab: 'details' | 'checklists' | 'attachments') => void
  setBudgetOpen: (open: boolean) => void
  setArchiveOpen: (open: boolean) => void
  setSpaceSecretsOpen: (open: boolean) => void
  setSpaceSecretsId: (id: number | null) => void
  setArchivedBoardsOpen: (open: boolean) => void
  setArchivedMilestonesOpen: (open: boolean) => void
  setArchivedClientsOpen: (open: boolean) => void
  setShowComments: (show: boolean) => void
  setNewTaskStatus: (status: TaskStatus) => void
  setAddingToColumn: (status: TaskStatus | null) => void
  setColumnInputs: (inputs: Record<string, string>) => void
  updateColumnInput: (key: string, value: string) => void
  setMenu: (menu: TaskStatus | null) => void
  setIsUploading: (uploading: boolean) => void
  setUploadError: (error: string | null) => void
  setNewTitle: (title: string) => void

  setDraggedId: (id: number | null) => void
  setDraggingColumnId: (id: number | null) => void
  setDragOver: (status: TaskStatus | null) => void
  setDropIndex: (index: number | null) => void
  setDraggedListId: (id: number | null) => void

  setClientDialog: (dialog: DialogState<Client>) => void
  setSpaceDialog: (dialog: DialogState<Space>) => void
  setBoardDialog: (dialog: DialogState<Board>) => void
  setMilestoneDialog: (dialog: DialogState<Milestone>) => void
  setContactDialog: (dialog: DialogState<Contact>) => void
  setNewListDialog: (dialog: { open: boolean; name: string }) => void
  setListMoveDialog: (dialog: { open: boolean; listId: number | null; position: number }) => void
  setConfirmDialog: (dialog: ConfirmDialogState) => void

  setContacts: (contacts: Contact[]) => void
  setCrmStages: (stages: CrmStage[]) => void
  setCrmDeals: (deals: CrmDeal[]) => void
  setCrmInteractions: (interactions: Record<number, CrmInteraction[]>) => void
  updateCrmInteractions: (dealId: number, interactions: CrmInteraction[]) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  activeView: null,
  detailTab: 'details',
  budgetOpen: false,
  archiveOpen: false,
  spaceSecretsOpen: false,
  spaceSecretsId: null,
  archivedBoardsOpen: false,
  archivedMilestonesOpen: false,
  archivedClientsOpen: false,
  showComments: false,
  newTaskStatus: 'backlog',
  addingToColumn: null,
  columnInputs: {},
  menu: null,
  isUploading: false,
  uploadError: null,
  newTitle: '',

  draggedId: null,
  draggingColumnId: null,
  dragOver: null,
  dropIndex: null,
  draggedListId: null,

  clientDialog: { open: false, mode: 'add' },
  spaceDialog: { open: false, mode: 'add' },
  boardDialog: { open: false, mode: 'add' },
  milestoneDialog: { open: false, mode: 'add' },
  contactDialog: { open: false, mode: 'add' },
  newListDialog: { open: false, name: '' },
  listMoveDialog: { open: false, listId: null, position: 1 },
  confirmDialog: { open: false, title: '', message: '', onConfirm: () => {} },

  contacts: [],
  crmStages: [],
  crmDeals: [],
  crmInteractions: {},

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setActiveView: (view) => set({ activeView: view }),
  setDetailTab: (tab) => set({ detailTab: tab }),
  setBudgetOpen: (open) => set({ budgetOpen: open }),
  setArchiveOpen: (open) => set({ archiveOpen: open }),
  setSpaceSecretsOpen: (open) => set({ spaceSecretsOpen: open }),
  setSpaceSecretsId: (id) => set({ spaceSecretsId: id }),
  setArchivedBoardsOpen: (open) => set({ archivedBoardsOpen: open }),
  setArchivedMilestonesOpen: (open) => set({ archivedMilestonesOpen: open }),
  setArchivedClientsOpen: (open) => set({ archivedClientsOpen: open }),
  setShowComments: (show) => set({ showComments: show }),
  setNewTaskStatus: (status) => set({ newTaskStatus: status }),
  setAddingToColumn: (status) => set({ addingToColumn: status }),
  setColumnInputs: (inputs) => set({ columnInputs: inputs }),
  updateColumnInput: (key, value) => set((s) => ({ columnInputs: { ...s.columnInputs, [key]: value } })),
  setMenu: (menu) => set({ menu: menu }),
  setIsUploading: (uploading) => set({ isUploading: uploading }),
  setUploadError: (error) => set({ uploadError: error }),
  setNewTitle: (title) => set({ newTitle: title }),

  setDraggedId: (id) => set({ draggedId: id }),
  setDraggingColumnId: (id) => set({ draggingColumnId: id }),
  setDragOver: (status) => set({ dragOver: status }),
  setDropIndex: (index) => set({ dropIndex: index }),
  setDraggedListId: (id) => set({ draggedListId: id }),

  setClientDialog: (dialog) => set({ clientDialog: dialog }),
  setSpaceDialog: (dialog) => set({ spaceDialog: dialog }),
  setBoardDialog: (dialog) => set({ boardDialog: dialog }),
  setMilestoneDialog: (dialog) => set({ milestoneDialog: dialog }),
  setContactDialog: (dialog) => set({ contactDialog: dialog }),
  setNewListDialog: (dialog) => set({ newListDialog: dialog }),
  setListMoveDialog: (dialog) => set({ listMoveDialog: dialog }),
  setConfirmDialog: (dialog) => set({ confirmDialog: dialog }),

  setContacts: (contacts) => set({ contacts }),
  setCrmStages: (stages) => set({ crmStages: stages }),
  setCrmDeals: (deals) => set({ crmDeals: deals }),
  setCrmInteractions: (interactions) => set({ crmInteractions: interactions }),
  updateCrmInteractions: (dealId, interactions) =>
    set((s) => ({ crmInteractions: { ...s.crmInteractions, [dealId]: interactions } })),
}))
