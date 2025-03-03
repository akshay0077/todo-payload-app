'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import withAuth from '../components/withAuth'
import { useAuth } from '../context/AuthContext'

interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  dueDate?: string
  category?: { id: string; name: string }
  user: { id: string; name: string; email: string }
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
}

interface TimeLeft {
  text: string
  color: string
}

function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Since we're using the AuthContext, we can directly fetch todos and categories
    Promise.all([fetchTodos(), fetchCategories()])
      .then(() => setIsLoading(false))
      .catch((error: Error) => {
        console.error('Error fetching data:', error)
        setAuthError('Error fetching data')
      })
  }, [])

  const fetchTodos = async (): Promise<void> => {
    try {
      const res = await fetch('/api/todos?depth=1', {
        credentials: 'include',
      })
      const data = await res.json()
      setTodos(data.docs || [])
    } catch (error) {
      console.error('Error fetching todos:', error)
      throw error
    }
  }

  const fetchCategories = async (): Promise<void> => {
    try {
      const res = await fetch('/api/categories', {
        credentials: 'include',
      })
      const data = await res.json()
      setCategories(data.docs || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  const createTodo = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          dueDate: dueDate || undefined,
          category: categoryId || undefined,
        }),
        credentials: 'include',
      })

      if (res.ok) {
        setTitle('')
        setDescription('')
        setDueDate('')
        setCategoryId('')
        setShowForm(false)
        await fetchTodos()
      }
    } catch (error) {
      console.error('Error creating todo:', error)
    }
  }

  const toggleTodo = async (id: string, completed: boolean): Promise<void> => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
        credentials: 'include',
      })
      await fetchTodos()
    } catch (error) {
      console.error('Error toggling todo:', error)
    }
  }

  const deleteTodo = async (id: string): Promise<void> => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      await fetchTodos()
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  const getTimeLeft = (dueDateStr: string): TimeLeft | null => {
    if (!dueDateStr) return null

    const dueDate = new Date(dueDateStr)
    const today = new Date()

    // Convert to milliseconds and then to days
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-500' }
    if (diffDays === 0) return { text: 'Due today', color: 'text-yellow-500' }
    if (diffDays === 1)
      return { text: 'Due tomorrow', color: 'text-yellow-400' }
    if (diffDays < 7)
      return { text: `Due in ${diffDays} days`, color: 'text-green-400' }
    return { text: `Due in ${diffDays} days`, color: 'text-green-500' }
  }

  // Filter todos based on status and search query
  const filteredTodos = todos
    .filter((todo) => {
      if (filterStatus === 'all') return true
      if (filterStatus === 'completed') return todo.completed
      return !todo.completed
    })
    .filter((todo) => {
      if (!searchQuery) return true
      return (
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.description &&
          todo.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
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
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
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
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-gray-800"
      >
        <div className="bg-gray-900 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
              My Tasks
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md font-medium shadow-lg transition-colors duration-200"
            >
              {showForm ? 'Cancel' : '+ New Task'}
            </motion.button>
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={createTodo}
                className="mb-8 overflow-hidden space-y-4 bg-gray-800/50 p-5 rounded-xl border border-gray-700"
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
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add more details about this task..."
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white h-24"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Due Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Category (Optional)
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-md font-medium hover:from-indigo-600 hover:to-purple-700 transition duration-200 shadow-lg"
                >
                  Add Task
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <div className="flex bg-gray-800 rounded-md">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-l-md transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-4 py-2 transition-colors ${
                    filterStatus === 'active'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterStatus('completed')}
                  className={`px-4 py-2 rounded-r-md transition-colors ${
                    filterStatus === 'completed'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {filteredTodos.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-gray-800/50 rounded-lg p-6 text-center border border-gray-700"
                >
                  <svg
                    className="w-16 h-16 text-gray-600 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-gray-400">
                    {searchQuery
                      ? 'No tasks match your search'
                      : filterStatus === 'completed'
                        ? 'No completed tasks found'
                        : filterStatus === 'active'
                          ? 'No active tasks found'
                          : 'No tasks yet. Create your first task!'}
                  </p>
                  {!showForm && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white text-sm transition-colors"
                    >
                      Create Task
                    </button>
                  )}
                </motion.div>
              ) : (
                filteredTodos.map((todo) => {
                  const timeLeft = todo.dueDate
                    ? getTimeLeft(todo.dueDate)
                    : null

                  return (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      whileHover={{ scale: 1.01 }}
                      className={`p-4 rounded-lg border transition-all duration-200 ${
                        todo.completed
                          ? 'bg-gray-800/30 border-gray-700'
                          : 'bg-gray-800/50 border-gray-700'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div>
                          <label className="cursor-pointer relative inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={todo.completed}
                              onChange={() =>
                                toggleTodo(todo.id, todo.completed)
                              }
                              className="sr-only peer"
                            />
                            <div className="w-5 h-5 border-2 border-gray-500 rounded-full peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-colors"></div>
                            <div className="absolute w-2 h-2 left-1.5 top-1.5 rounded-full bg-indigo-300 scale-0 peer-checked:scale-100 transition-transform"></div>
                          </label>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                            <h3
                              className={`font-medium ${
                                todo.completed
                                  ? 'line-through text-gray-500'
                                  : 'text-white'
                              }`}
                            >
                              {todo.title}
                            </h3>
                            {timeLeft && !todo.completed && (
                              <span
                                className={`text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-800 ${timeLeft.color}`}
                              >
                                {timeLeft.text}
                              </span>
                            )}
                          </div>

                          {todo.description && (
                            <p
                              className={`mt-1 text-sm ${
                                todo.completed
                                  ? 'text-gray-600'
                                  : 'text-gray-400'
                              }`}
                            >
                              {todo.description}
                            </p>
                          )}

                          <div className="mt-2 flex flex-wrap gap-2">
                            {todo.category && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-900/60 text-purple-300 border border-purple-800">
                                {todo.category.name}
                              </span>
                            )}
                            {todo.dueDate && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700/60 text-gray-300">
                                <svg
                                  className="mr-1 w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {new Date(todo.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                            <span>
                              Created:{' '}
                              {new Date(todo.createdAt).toLocaleString()}
                            </span>
                            <button
                              onClick={() => deleteTodo(todo.id)}
                              className="text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
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
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="bg-gray-900/70 border-t border-gray-800 px-6 py-4 text-xs text-gray-500 text-center">
          <p>
            {filterStatus === 'all'
              ? `Showing all tasks (${filteredTodos.length})`
              : filterStatus === 'active'
                ? `Showing active tasks (${filteredTodos.length})`
                : `Showing completed tasks (${filteredTodos.length})`}
            {' | '}
            Total: {todos.length} | Active:{' '}
            {todos.filter((t) => !t.completed).length} | Completed:{' '}
            {todos.filter((t) => t.completed).length}
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default withAuth(TodosPage)
