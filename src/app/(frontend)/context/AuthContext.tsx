'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { checkAuthentication, logout as logoutUtil } from '../utils/auth'

/**
 * User interface representing authenticated user data
 */
interface User {
  id: string
  name: string
  email: string
  tenant?: {
    id: string
  }
}

/**
 * Authentication context interface
 */
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
}

// Create context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Authentication Provider component
 * Manages authentication state and provides auth-related functions
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check authentication on initial load
    // We don't need to check for admin paths here anymore
    // The middleware will handle that
    checkAuth()
  }, [])

  /**
   * Check if user is authenticated
   * @returns Promise resolving to authentication status
   */
  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      const { isAuthenticated, user, error } = await checkAuthentication()

      if (isAuthenticated && user) {
        setUser(user)
        setIsAuthenticated(true)
        setError(null)
        setIsLoading(false)
        return true
      } else {
        setUser(null)
        setIsAuthenticated(false)
        setError(error || 'Authentication failed')
        setIsLoading(false)
        return false
      }
    } catch (err) {
      setUser(null)
      setIsAuthenticated(false)
      setError('Something went wrong')
      setIsLoading(false)
      return false
    }
  }

  /**
   * Log in a user with email and password
   * @param email User email
   * @param password User password
   * @returns Promise resolving to login success status
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      if (res.ok) {
        // After successful login, check auth to get user data
        const success = await checkAuth()
        return success
      } else {
        setError('Invalid email or password')
        setIsLoading(false)
        return false
      }
    } catch (err) {
      setError('Something went wrong')
      setIsLoading(false)
      return false
    }
  }

  /**
   * Log out the current user
   */
  const handleLogout = async (): Promise<void> => {
    try {
      setIsLoading(true)
      const { success, error: logoutError } = await logoutUtil()

      if (success) {
        setUser(null)
        setIsAuthenticated(false)
        router.push('/login')
      } else {
        setError(logoutError || 'Failed to logout')
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  // Context value
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout: handleLogout,
    checkAuth,
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

/**
 * Custom hook to use the auth context
 * @returns Authentication context
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
