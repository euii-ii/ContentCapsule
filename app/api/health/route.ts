import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        hasYouTubeKey: !!process.env.YOUTUBE_API_KEY,
        hasMongoUri: !!process.env.MONGODB_URI,
        hasClerkKeys: !!(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)
      },
      services: {
        clerk: 'unknown',
        mongodb: 'unknown',
        gemini: 'unknown'
      }
    }

    // Test Clerk authentication
    try {
      await auth()
      healthCheck.services.clerk = 'available'
    } catch (error) {
      healthCheck.services.clerk = 'error'
      console.warn('Health check - Clerk auth error:', error)
    }

    // Test MongoDB connection
    try {
      const connectToDatabase = (await import('@/lib/mongodb')).default
      await connectToDatabase()
      healthCheck.services.mongodb = 'available'
    } catch (error) {
      healthCheck.services.mongodb = 'error'
      console.warn('Health check - MongoDB error:', error)
    }

    // Test Gemini API
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai')
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
        // Just check if we can create the model instance
        healthCheck.services.gemini = 'available'
      } catch (error) {
        healthCheck.services.gemini = 'error'
        console.warn('Health check - Gemini API error:', error)
      }
    } else {
      healthCheck.services.gemini = 'no-key'
    }

    return NextResponse.json(healthCheck)

  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
