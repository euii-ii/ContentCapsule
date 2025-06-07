import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function GET() {
  try {
    console.log('Listing available Gemini models...')
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'GEMINI_API_KEY not found in environment variables' 
      }, { status: 500 })
    }

    // Try to list models
    const models = await genAI.listModels()
    
    const modelNames = models.map(model => ({
      name: model.name,
      displayName: model.displayName,
      description: model.description,
      supportedGenerationMethods: model.supportedGenerationMethods
    }))

    return NextResponse.json({ 
      success: true,
      models: modelNames,
      count: modelNames.length
    })

  } catch (error) {
    console.error('Error listing models:', error)
    return NextResponse.json({ 
      error: 'Failed to list models',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
