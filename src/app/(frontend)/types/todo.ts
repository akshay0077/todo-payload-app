export interface Todo {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'high' | 'medium' | 'low'
  dueDate?: string
  assignedTo?: { id: string; email: string }
  tenant: { id: string }
  createdBy: { id: string; email: string }
  createdAt: string
  updatedAt: string
}
