import { useState } from 'react'

export interface GeneratedContent {
  content: string
  videoId: string
  type: 'study-guide' | 'briefing-doc'
}

export function useYouTubeAI() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateContent = async (url: string, type: 'study-guide' | 'briefing-doc'): Promise<GeneratedContent | null> => {
    setIsGenerating(true)
    setError(null)

    try {
      // Try the enhanced API first (with YouTube Data API)
      let response = await fetch('/api/youtube-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, type }),
      })

      // If enhanced API fails, try the regular API
      if (!response.ok) {
        console.log('Enhanced API failed, trying regular API...')
        response = await fetch('/api/youtube', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url, type }),
        })
      }

      // If both fail, try the mock API
      if (!response.ok) {
        console.log('Regular API failed, trying mock API...')
        response = await fetch('/api/youtube-mock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url, type }),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate content')
      }

      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    generateContent,
    isGenerating,
    error,
    clearError: () => setError(null)
  }
}
