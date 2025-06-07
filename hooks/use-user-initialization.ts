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
          throw new Error(`Failed to initialize user: ${response.statusText}`)
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
        setError(err instanceof Error ? err.message : 'Unknown error')
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
