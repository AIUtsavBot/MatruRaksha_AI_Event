import { createContext, useContext, useState, useEffect, useRef } from 'react'
import authService from '../services/auth'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const userRef = useRef(null)  // Track current user to avoid closure issues

  // Keep ref in sync with state
  useEffect(() => {
    userRef.current = user
  }, [user])

  useEffect(() => {
    let mounted = true

    // Check current session on mount - optimized flow
    const initAuth = async () => {
      try {
        // Get session - this is the main check needed
        const currentSession = await authService.getSession()
        console.log('🔐 Initial session check:', currentSession ? 'Found' : 'None')

        if (!mounted) return
        setSession(currentSession)

        // Only fetch user data if session exists (avoid unnecessary call)
        if (currentSession?.user) {
          // Use the session user data directly if possible to avoid extra network call
          const currentUser = await authService.getCurrentUser()
          console.log('👤 User loaded:', currentUser?.email, 'Role:', currentUser?.role)
          if (mounted) {
            setUser(currentUser)
            userRef.current = currentUser
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    // Listen to auth state changes
    const subscription = authService.onAuthStateChange((event, newSession, newUser) => {
      console.log('🔄 Auth state changed:', event)

      if (!mounted) return

      // Handle sign out
      if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out')
        setSession(null)
        setUser(null)
        userRef.current = null
        setLoading(false)
        return
      }

      // For TOKEN_REFRESHED, just update session but keep user
      if (event === 'TOKEN_REFRESHED') {
        console.log('↻ Token refreshed')
        setSession(newSession)
        // Don't touch user state - keep existing
        return
      }

      // Handle sign in or initial session
      if (newSession && newUser) {
        console.log('✅ User authenticated:', newUser?.email)
        setSession(newSession)
        setUser(newUser)
        userRef.current = newUser
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (userData) => {
    try {
      setLoading(true)
      const result = await authService.signUp(userData)
      return result
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const result = await authService.signIn(email, password)
      setUser(result.user)
      setSession(result.session)
      return result
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const result = await authService.signInWithGoogle()
      return result
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await authService.signOut()
      setUser(null)
      setSession(null)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates) => {
    try {
      const result = await authService.updateProfile(updates)
      // Refresh user data
      const updatedUser = await authService.getCurrentUser()
      setUser(updatedUser)
      return result
    } catch (error) {
      throw error
    }
  }

  const resetPassword = async (email) => {
    return await authService.resetPassword(email)
  }

  const updatePassword = async (newPassword) => {
    return await authService.updatePassword(newPassword)
  }

  const hasRole = (allowedRoles) => {
    return authService.hasRole(user, allowedRoles)
  }

  const isAdmin = () => hasRole(['ADMIN'])
  const isDoctor = () => hasRole(['DOCTOR', 'ADMIN'])
  const isAshaWorker = () => hasRole(['ASHA_WORKER', 'DOCTOR', 'ADMIN'])

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    hasRole,
    isAdmin,
    isDoctor,
    isAshaWorker,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
