'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkAuthentication } from '../utils/auth'

/**
 * Higher-order component to protect routes that require authentication
 * @param Component The component to wrap
 * @returns A new component that checks for authentication before rendering
 */
export default function withAuth(Component: React.ComponentType<any>) {
  return function AuthenticatedComponent(props: any) {
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const router = useRouter()

    useEffect(() => {
      const checkAuth = async () => {
        const { isAuthenticated } = await checkAuthentication()

        if (!isAuthenticated) {
          router.push('/login')
          return
        }

        setIsAuthenticated(true)
        setIsLoading(false)
      }

      checkAuth()
    }, [router])

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black bg-gradient-to-br from-gray-900 to-black">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/30">
              <svg
                className="w-8 h-8 text-white animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-medium text-white">Loading...</h1>
            <p className="text-gray-400 mt-2">Checking authentication status</p>
          </div>
        </div>
      )
    }

    return isAuthenticated ? <Component {...props} /> : null
  }
}
