import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function GET() {
  try {
    console.log('Testing Gemini API...')
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'GEMINI_API_KEY not found in environment variables' 
      }, { status: 500 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = "Say hello and confirm that the Gemini AI is working properly. Keep it short."
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    return NextResponse.json({ 
      success: true,
      content,
      message: 'Gemini API is working correctly'
    })

  } catch (error) {
    console.error('Error testing Gemini API:', error)
    return NextResponse.json({ 
      error: 'Failed to connect to Gemini API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
