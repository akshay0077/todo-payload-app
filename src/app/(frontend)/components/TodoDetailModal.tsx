import { motion } from 'framer-motion'
import { Todo } from '../types/todo'

interface TodoDetailModalProps {
  todo: Todo
  onClose: () => void
  onStatusChange: (id: string, status: Todo['status']) => void
  onDelete: (id: string) => void
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

export function TodoDetailModal({
  todo,
  onClose,
  onStatusChange,
  onDelete,
}: TodoDetailModalProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:right-auto md:w-[600px] md:-ml-[300px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl border border-gray-700/50 p-6 z-50 max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{todo.title}</h2>
              <span
                className={`text-sm font-medium px-2.5 py-1 rounded-full ${
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
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Created by {todo.createdBy.email}</span>
              <span>•</span>
              <span>{new Date(todo.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Status Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <div className="flex gap-2">
            {(['todo', 'in-progress', 'done'] as const).map((status) => (
              <button
                key={status}
                onClick={() => onStatusChange(todo.id, status)}
                className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  todo.status === status
                    ? status === 'todo'
                      ? 'bg-gray-500/20 text-gray-300 border-gray-500'
                      : status === 'in-progress'
                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500'
                        : 'bg-green-500/20 text-green-300 border-green-500'
                    : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-600'
                }`}
              >
                {status === 'todo'
                  ? 'To Do'
                  : status === 'in-progress'
                    ? 'In Progress'
                    : 'Done'}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        {todo.description && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              Description
            </h3>
            <div className="bg-black/20 rounded-lg p-4">
              <p className="text-gray-300 whitespace-pre-wrap">
                {todo.description}
              </p>
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Due Date */}
          {todo.dueDate && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <h3 className="text-sm font-medium text-gray-300 mb-1">
                Due Date
              </h3>
              <p className="text-white text-lg mb-1">
                {new Date(todo.dueDate).toLocaleDateString()}
              </p>
              {getTimeLeft(todo.dueDate) && (
                <span className={`text-sm ${getTimeLeft(todo.dueDate)?.color}`}>
                  {getTimeLeft(todo.dueDate)?.text}
                </span>
              )}
            </div>
          )}

          {/* Assigned To */}
          {todo.assignedTo && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <h3 className="text-sm font-medium text-gray-300 mb-1">
                Assigned To
              </h3>
              <p className="text-white text-lg">{todo.assignedTo.email}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            Last updated: {new Date(todo.updatedAt).toLocaleString()}
          </div>
          <button
            onClick={() => {
              onDelete(todo.id)
              onClose()
            }}
            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <svg
              className="w-4 h-4"
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
            Delete Task
          </button>
        </div>
      </motion.div>
    </>
  )
}
