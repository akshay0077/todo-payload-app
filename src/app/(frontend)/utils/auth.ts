/**
 * Authentication utility functions
 */

/**
 * Response from authentication check
 */
interface AuthCheckResponse {
  isAuthenticated: boolean
  user?: any
  error?: string
}

/**
 * Response from logout operation
 */
interface LogoutResponse {
  success: boolean
  error?: string
}

/**
 * Check if the user is authenticated by validating the token
 * @returns Promise with authentication status, user data if authenticated, and error if any
 */
export const checkAuthentication = async (): Promise<AuthCheckResponse> => {
  try {
    const res = await fetch('/api/users/me', {
      method: 'GET',
      credentials: 'include',
    })

    if (!res.ok) {
      return {
        isAuthenticated: false,
        error:
          res.status === 401
            ? 'Authentication failed'
            : `Server error: ${res.status}`,
      }
    }

    const data = await res.json()
    return { isAuthenticated: true, user: data.user }
  } catch (error) {
    console.error('Error checking authentication:', error)
    return {
      isAuthenticated: false,
      error: error instanceof Error ? error.message : 'Something went wrong',
    }
  }
}

/**
 * Logout the user
 * @returns Promise with logout operation result
 */
export const logout = async (): Promise<LogoutResponse> => {
  try {
    const res = await fetch('/api/users/logout', {
      method: 'POST',
      credentials: 'include',
    })

    if (!res.ok) {
      return {
        success: false,
        error: `Logout failed with status: ${res.status}`,
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error logging out:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Something went wrong',
    }
  }
}
