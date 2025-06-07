"use client"

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

interface UserData {
  _id: string
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  profileImage?: string
  plan: 'free' | 'pro' | 'premium'
  usage: {
    studyGuides: number
    briefingDocs: number
    notes: number
    chatMessages: number
    monthlyReset: Date
  }
  preferences: {
    theme?: 'light' | 'dark' | 'system'
    language?: string
    notifications?: boolean
  }
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date
}

export function useUserInitialization() {
  const { user, isSignedIn, isLoaded } = useUser()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeUser = async () => {
      if (!isLoaded || !isSignedIn || !user) {
        setUserData(null)
        return
      }

      setIsInitializing(true)
      setError(null)

      try {
        console.log('Initializing user in database...', user.id)

        // Call the user API to get or create user
        const response = await fetch('/api/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          // Get more detailed error information
          let errorMessage = `Failed to initialize user: ${response.statusText}`
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch {
            // If we can't parse the error response, use the status text
          }

          console.error('User initialization failed:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url
          })

          // For deployment, we'll be more lenient with user initialization
          if (response.status === 500) {
            console.warn('Database connection may be unavailable, continuing without user data')
            setUserData(null)
            setError(null) // Don't show error to user for database issues
            return
          }

          throw new Error(errorMessage)
        }

        const result = await response.json()

        if (result.success) {
          setUserData(result.data)
          console.log('User initialized successfully:', result.data.email)
        } else {
          throw new Error(result.error || 'Failed to initialize user')
        }

      } catch (err) {
        console.error('Error initializing user:', err)

        // For deployment, be more lenient with errors
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'

        if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
          // Authentication issue - this is expected in some cases
          console.log('User not authenticated, continuing without user data')
          setUserData(null)
          setError(null)
        } else if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
          // Server error - likely database connection issue
          console.warn('Server error during user initialization, continuing without user data')
          setUserData(null)
          setError(null)
        } else {
          // Other errors - show to user
          setError(errorMessage)
        }
      } finally {
        setIsInitializing(false)
      }
    }

    initializeUser()
  }, [isLoaded, isSignedIn, user])

  const updateUserData = async (updates: Partial<UserData>) => {
    if (!userData) return null

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update user data')
      }

      const result = await response.json()
      
      if (result.success) {
        setUserData(result.data)
        return result.data
      } else {
        throw new Error(result.error || 'Failed to update user')
      }

    } catch (err) {
      console.error('Error updating user:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    }
  }

  const getUserStats = async () => {
    if (!userData) return null

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'stats' }),
      })

      if (!response.ok) {
        throw new Error('Failed to get user stats')
      }

      const result = await response.json()
      
      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error || 'Failed to get stats')
      }

    } catch (err) {
      console.error('Error getting user stats:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    }
  }

  return {
    userData,
    isInitializing,
    error,
    updateUserData,
    getUserStats,
    isUserReady: isLoaded && isSignedIn && userData && !isInitializing
  }
}
