/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { authAPI } from '../services/api'
import secureStorage from '../utils/secureStorage'
import { captureError } from '../services/errorTracking'
import { STORAGE_KEYS } from '../constants'

// Create context
const AuthContext = createContext(null)

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = secureStorage.getItem(STORAGE_KEYS.TOKEN)
        const storedUser = secureStorage.getItem(STORAGE_KEYS.USER)

        if (token && storedUser) {
          // Verify token is still valid
          try {
            const response = await authAPI.me()
            const userData = response.data.user || response.data
            setUser(userData)
            secureStorage.setItem(STORAGE_KEYS.USER, userData)
          } catch (err) {
            // Token invalid, clear storage
            secureStorage.removeItem(STORAGE_KEYS.TOKEN)
            secureStorage.removeItem(STORAGE_KEYS.USER)
          }
        }
      } catch (err) {
        captureError(err, { context: 'Auth initialization' })
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Login
  const login = useCallback(async (credentials) => {
    setLoading(true)
    setError(null)

    try {
      const response = await authAPI.login(credentials)
      const { token, refreshToken, user: userData } = response.data

      // Store token and user (secureStorage already does JSON.stringify internally)
      secureStorage.setItem(STORAGE_KEYS.TOKEN, token)
      if (refreshToken) {
        secureStorage.setItem('refreshToken', refreshToken)
      }
      secureStorage.setItem(STORAGE_KEYS.USER, userData)

      setUser(userData)
      return { success: true, user: userData }
    } catch (err) {
      const message = err.response?.data?.error || 'Login xatosi'
      setError(message)
      captureError(err, { context: 'Login' })
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Register
  const register = useCallback(async (userData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await authAPI.register(userData)
      const { token, user: newUser } = response.data

      // Store token and user (secureStorage already does JSON.stringify internally)
      secureStorage.setItem(STORAGE_KEYS.TOKEN, token)
      secureStorage.setItem(STORAGE_KEYS.USER, newUser)

      setUser(newUser)
      return { success: true, user: newUser }
    } catch (err) {
      const message = err.response?.data?.error || 'Ro\'yxatdan o\'tish xatosi'
      setError(message)
      captureError(err, { context: 'Register' })
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Logout
  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch (err) {
      // Ignore logout errors
    } finally {
      // Clear storage and state
      secureStorage.removeItem(STORAGE_KEYS.TOKEN)
      secureStorage.removeItem('refreshToken')
      secureStorage.removeItem(STORAGE_KEYS.USER)
      setUser(null)
      setError(null)
    }
  }, [])

  // Update user profile
  const updateProfile = useCallback(async (updates) => {
    setLoading(true)
    setError(null)

    try {
      const response = await authAPI.updateProfile(updates)
      const updatedUser = response.data

      secureStorage.setItem(STORAGE_KEYS.USER, updatedUser)
      setUser(updatedUser)

      return { success: true, user: updatedUser }
    } catch (err) {
      const message = err.response?.data?.error || 'Profil yangilash xatosi'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Check if user has role
  const hasRole = useCallback((role) => {
    if (!user) return false
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    return user.role === role
  }, [user])

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return hasRole('admin')
  }, [hasRole])

  // Check if user is teacher
  const isTeacher = useCallback(() => {
    return hasRole(['admin', 'teacher'])
  }, [hasRole])

  // Check if user is parent
  const isParent = useCallback(() => {
    return hasRole('parent')
  }, [hasRole])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    isAdmin,
    isTeacher,
    isParent,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

// HOC for protected routes
export const withAuth = (Component, requiredRole = null) => {
  const WrappedComponent = (props) => {
    const { isAuthenticated, hasRole, loading } = useAuth()

    if (loading) {
      return <div>Loading...</div>
    }

    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login'
      return null
    }

    if (requiredRole && !hasRole(requiredRole)) {
      // Redirect to unauthorized
      window.location.href = '/unauthorized'
      return null
    }

    return <Component {...props} />
  }

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default AuthContext
