import { motion } from 'framer-motion'

interface Todo {
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

interface TodoCardProps {
  todo: Todo
  onStatusChange: (id: string, status: Todo['status']) => void
  onDelete: (id: string) => void
  onClick: (todo: Todo) => void
}

const getTimeLeft = (dueDateStr: string) => {
  if (!dueDateStr) return null

  const dueDate = new Date(dueDateStr)
  const today = new Date()
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { text: 'Overdue', color: 'text-red-500' }
  if (diffDays === 0) return { text: 'Due today', color: 'text-yellow-500' }
  if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-yellow-400' }
  if (diffDays < 7)
    return { text: `Due in ${diffDays} days`, color: 'text-green-400' }
  return { text: `Due in ${diffDays} days`, color: 'text-green-500' }
}

const getPriorityColor = (priority: Todo['priority']): string => {
  switch (priority) {
    case 'high':
      return 'text-red-400'
    case 'medium':
      return 'text-yellow-400'
    case 'low':
      return 'text-green-400'
    default:
      return 'text-gray-400'
  }
}

const getStatusColor = (status: Todo['status']): string => {
  switch (status) {
    case 'todo':
      return 'bg-gray-600'
    case 'in-progress':
      return 'bg-yellow-600'
    case 'done':
      return 'bg-green-600'
    default:
      return 'bg-gray-600'
  }
}

export function TodoCard({
  todo,
  onStatusChange,
  onDelete,
  onClick,
}: TodoCardProps) {
  const getStatusBadgeStyle = (status: Todo['status']) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      case 'in-progress':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'done':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onClick={() => onClick(todo)}
      className="bg-gray-800/40 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 group hover:shadow-lg cursor-pointer"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-medium text-white flex-1 break-words">
            {todo.title}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                todo.priority === 'high'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : todo.priority === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}
            >
              {todo.priority}
            </span>
          </div>
        </div>

        {/* Description */}
        {todo.description && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {todo.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            {todo.dueDate && (
              <span className={getTimeLeft(todo.dueDate)?.color}>
                {getTimeLeft(todo.dueDate)?.text}
              </span>
            )}
            {todo.assignedTo && (
              <span
                className="truncate max-w-[150px]"
                title={todo.assignedTo.email}
              >
                {todo.assignedTo.email}
              </span>
            )}
          </div>

          {/* Actions */}
          <div
            className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()} // Prevent card click when using actions
          >
            <div className="relative group/dropdown">
              <select
                value={todo.status}
                onChange={(e) =>
                  onStatusChange(todo.id, e.target.value as Todo['status'])
                }
                className={`appearance-none cursor-pointer px-2.5 py-1 text-xs border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getStatusBadgeStyle(todo.status)}`}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <button
              onClick={() => onDelete(todo.id)}
              className="p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded-full hover:bg-red-500/10"
              title="Delete task"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
