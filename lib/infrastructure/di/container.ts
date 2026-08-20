import { TaskRepository } from '@/lib/infrastructure/repositories/task-repository'
import { BoardRepository } from '@/lib/infrastructure/repositories/board-repository'
import { ClientRepository } from '@/lib/infrastructure/repositories/client-repository'
import { SpaceRepository } from '@/lib/infrastructure/repositories/space-repository'
import { BudgetRepository } from '@/lib/infrastructure/repositories/budget-repository'
import { ContactRepository } from '@/lib/infrastructure/repositories/contact-repository'
import { CrmRepository } from '@/lib/infrastructure/repositories/crm-repository'
import { MilestoneRepository } from '@/lib/infrastructure/repositories/milestone-repository'
import { CommentRepository } from '@/lib/infrastructure/repositories/comment-repository'
import { ChecklistRepository } from '@/lib/infrastructure/repositories/checklist-repository'
import { UserRepository } from '@/lib/infrastructure/repositories/user-repository'
import { TaskService } from '@/lib/services/task-service'
import { BoardService } from '@/lib/services/board-service'
import { ClientService } from '@/lib/services/client-service'
import { SpaceService } from '@/lib/services/space-service'
import { BudgetService } from '@/lib/services/budget-service'
import { InvoiceService } from '@/lib/services/invoice-service'
import { CrmService } from '@/lib/services/crm-service'
import { AuthService } from '@/lib/services/auth-service'

const taskRepo = new TaskRepository()
const boardRepo = new BoardRepository()
const clientRepo = new ClientRepository()
const spaceRepo = new SpaceRepository()
const budgetRepo = new BudgetRepository()
const contactRepo = new ContactRepository()
const crmRepo = new CrmRepository()
const milestoneRepo = new MilestoneRepository()
const commentRepo = new CommentRepository()
const checklistRepo = new ChecklistRepository()
const userRepo = new UserRepository()

export const container = {
  taskService: new TaskService(taskRepo, commentRepo, checklistRepo),
  boardService: new BoardService(boardRepo, spaceRepo),
  clientService: new ClientService(clientRepo, spaceRepo),
  spaceService: new SpaceService(spaceRepo),
  budgetService: new BudgetService(budgetRepo),
  invoiceService: new InvoiceService(clientRepo, spaceRepo, boardRepo, budgetRepo),
  crmService: new CrmService(crmRepo, contactRepo),
  authService: new AuthService(userRepo),

  // Repositories (for direct access when needed)
  taskRepo,
  boardRepo,
  clientRepo,
  spaceRepo,
  budgetRepo,
  contactRepo,
  crmRepo,
  milestoneRepo,
  commentRepo,
  checklistRepo,
  userRepo,
}
