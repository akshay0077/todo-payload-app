'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

/**
 * User avatar component
 */
const UserAvatar = ({ name }: { name?: string }) => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
    {name ? (
      name.substring(0, 1).toUpperCase()
    ) : (
      <div className="w-6 h-6 bg-gray-500 rounded-full"></div>
    )}
  </div>
)

/**
 * Loading skeleton for navbar
 */
const NavbarSkeleton = () => (
  <div className="bg-gray-900 border-b border-gray-800 py-3 px-4">
    <div className="max-w-3xl mx-auto flex justify-between items-center">
      <div className="h-6 w-24 bg-gray-800 rounded animate-pulse"></div>
    </div>
  </div>
)

/**
 * Logout button component
 */
interface LogoutButtonProps {
  onClick: () => Promise<void>
  isLoading: boolean
}

const LogoutButton = ({ onClick, isLoading }: LogoutButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    disabled={isLoading}
    className={`px-4 py-2 rounded-md font-medium transition-colors ${
      isLoading
        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
    }`}
  >
    {isLoading ? (
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        <span>Logging out...</span>
      </div>
    ) : (
      'Logout'
    )}
  </motion.button>
)

/**
 * Navbar component
 * Displays user information and logout button
 */
export default function Navbar() {
  const { user, logout, isLoading } = useAuth()
  const [isLogoutLoading, setIsLogoutLoading] = useState(false)
  const [error, setError] = useState('')

  /**
   * Handle logout button click
   */
  const handleLogout = async () => {
    try {
      setIsLogoutLoading(true)
      await logout()
    } catch (err) {
      setError('Failed to logout')
      console.error('Logout error:', err)
      setIsLogoutLoading(false)
    }
  }

  // Show loading skeleton while fetching user data
  if (isLoading) {
    return <NavbarSkeleton />
  }

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-900 border-b border-gray-800 py-3 px-4 shadow-md"
    >
      <div className="max-w-3xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <UserAvatar name={user?.name} />

          <div>
            <p className="text-white font-medium">{user?.name}</p>
            <p className="text-gray-400 text-xs">{user?.email}</p>
          </div>
        </div>

        <LogoutButton onClick={handleLogout} isLoading={isLogoutLoading} />
      </div>
    </motion.div>
  )
}
