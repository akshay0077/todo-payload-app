'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import withAuth from '../components/withAuth'
import { useAuth } from '../context/AuthContext'
import { TodoCard } from '../components/TodoCard'
import { TodoDetailModal } from '../components/TodoDetailModal'
import { Todo } from '../types/todo'

function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Todo['status']>('todo')
  const [priority, setPriority] = useState<Todo['priority']>('medium')
  const [dueDate, setDueDate] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user?.tenant) {
      fetchTodos()
        .then(() => setIsLoading(false))
        .catch((error: Error) => {
          console.error('Error fetching data:', error)
          setAuthError('Error fetching data')
        })
    } else {
      setIsLoading(false)
    }
  }, [user?.tenant])

  const fetchTodos = async (): Promise<void> => {
    try {
      const res = await fetch('/api/todos?depth=1', {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch todos')
      const data = await res.json()
      setTodos(data.docs || [])
    } catch (error) {
      console.error('Error fetching todos:', error)
      throw error
    }
  }

  const createTodo = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      if (!user?.tenant) {
        throw new Error('No tenant associated with user')
      }

      //@ts-ignores
      const tenantId = user.tenant.id || user.tenant

      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          status,
          priority,
          dueDate: dueDate || undefined,
          tenant: tenantId,
        }),
        credentials: 'include',
      })

      if (res.ok) {
        setTitle('')
        setDescription('')
        setStatus('todo')
        setPriority('medium')
        setDueDate('')
        setShowForm(false)
        await fetchTodos()
      } else {
        const error = await res.json()
        console.error('Error creating todo:', error)
        throw new Error(error.errors?.[0]?.message || 'Failed to create todo')
      }
    } catch (error) {
      console.error('Error creating todo:', error)
      setAuthError(
        error instanceof Error ? error.message : 'Failed to create todo'
      )
    }
  }

  const updateTodoStatus = async (
    id: string,
    newStatus: Todo['status']
  ): Promise<void> => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to update todo')
      await fetchTodos()
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  const deleteTodo = async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to delete todo')
      await fetchTodos()
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  // Group todos by status
  const todosByStatus = todos.reduce(
    (acc, todo) => {
      if (
        !searchQuery ||
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.description &&
          todo.description.toLowerCase().includes(searchQuery.toLowerCase()))
      ) {
        acc[todo.status].push(todo)
      }
      return acc
    },
    { todo: [], 'in-progress': [], done: [] } as Record<Todo['status'], Todo[]>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1120] text-white">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse"></div>
          <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse delay-100"></div>
          <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse delay-200"></div>
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1120] text-white">
        <div className="bg-red-900/40 p-6 rounded-lg border border-red-500">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
          <p>{authError}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0B1120] min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
              Task Board
            </h1>
            <p className="text-gray-400 mt-1">Manage your tasks efficiently</p>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white w-64"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-lg transition-colors duration-200 flex items-center gap-2"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Task
            </motion.button>
          </div>
        </div>

        {/* Create Todo Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <form
                onSubmit={createTodo}
                className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-6 shadow-xl"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Task Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add more details..."
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white h-24 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as Todo['status'])
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) =>
                        setPriority(e.target.value as Todo['priority'])
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md font-medium shadow-lg transition-colors duration-200"
                  >
                    Create Task
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* To Do Column */}
          <div className="bg-gray-800/20 rounded-xl border border-gray-700/50 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-300">To Do</h2>
              <span className="ml-auto bg-gray-700 px-2 py-1 rounded-full text-sm text-gray-300">
                {todosByStatus.todo.length}
              </span>
            </div>
            <div className="space-y-3">
              {todosByStatus.todo.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onStatusChange={updateTodoStatus}
                  onDelete={deleteTodo}
                  onClick={setSelectedTodo}
                />
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-gray-800/20 rounded-xl border border-gray-700/50 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-300">
                In Progress
              </h2>
              <span className="ml-auto bg-gray-700 px-2 py-1 rounded-full text-sm text-gray-300">
                {todosByStatus['in-progress'].length}
              </span>
            </div>
            <div className="space-y-3">
              {todosByStatus['in-progress'].map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onStatusChange={updateTodoStatus}
                  onDelete={deleteTodo}
                  onClick={setSelectedTodo}
                />
              ))}
            </div>
          </div>

          {/* Done Column */}
          <div className="bg-gray-800/20 rounded-xl border border-gray-700/50 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-300">Done</h2>
              <span className="ml-auto bg-gray-700 px-2 py-1 rounded-full text-sm text-gray-300">
                {todosByStatus.done.length}
              </span>
            </div>
            <div className="space-y-3">
              {todosByStatus.done.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onStatusChange={updateTodoStatus}
                  onDelete={deleteTodo}
                  onClick={setSelectedTodo}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Todo Detail Modal */}
      <AnimatePresence>
        {selectedTodo && (
          <TodoDetailModal
            todo={selectedTodo}
            onClose={() => setSelectedTodo(null)}
            onStatusChange={updateTodoStatus}
            onDelete={deleteTodo}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default withAuth(TodosPage)
