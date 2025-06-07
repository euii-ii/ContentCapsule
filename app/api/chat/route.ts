import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { YoutubeTranscript } from 'youtube-transcript'
import { auth } from '@clerk/nextjs/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Helper function to extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

export async function POST(request: NextRequest) {
  try {
    const { message, videoUrl, videoTitle } = await request.json()
    console.log('Chat API - Received request:', { message, videoUrl, videoTitle })

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables')
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    let prompt = ''
    let transcript = ''

    // If a video is selected, get its transcript for context
    if (videoUrl) {
      try {
        const videoId = extractVideoId(videoUrl)
        if (videoId) {
          console.log('Chat API - Fetching transcript for video ID:', videoId)
          const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId)
          transcript = transcriptArray.map(item => item.text).join(' ')
          console.log('Chat API - Transcript length:', transcript.length)
        }
      } catch (error) {
        console.error('Chat API - Error fetching transcript:', error)
        // Continue without transcript - we can still provide general responses
      }
    }

    // Create context-aware prompt based on whether we have video content
    if (transcript && videoTitle) {
      prompt = `You are an AI assistant helping users understand and analyze YouTube videos. 

The user is asking about this video:
Title: "${videoTitle}"
URL: ${videoUrl}

Video Transcript (first 8000 characters):
${transcript.substring(0, 8000)}

User Question: "${message}"

Please provide a helpful, accurate response based on the video content. If the question is about specific details in the video, reference the transcript. If it's a general question, provide useful information while acknowledging the video context.

Guidelines:
- Be conversational and helpful
- Reference specific parts of the video when relevant
- If you can't find the answer in the transcript, say so clearly
- Provide actionable insights when possible
- Keep responses focused and well-structured
- Use markdown formatting for better readability`
    } else if (videoUrl && videoTitle) {
      // Video selected but no transcript available
      prompt = `You are an AI assistant helping users with YouTube videos.

The user has selected this video: "${videoTitle}" (${videoUrl})

However, I couldn't access the video transcript (it may not have captions or may not be publicly available).

User Question: "${message}"

Please provide a helpful response. Since I don't have access to the video content, I'll:
- Acknowledge that I can't analyze the specific video content
- Provide general helpful information related to their question
- Suggest ways they might find the information they're looking for
- Offer to help with other aspects of video analysis

Be conversational, helpful, and honest about the limitations.`
    } else {
      // No video selected
      prompt = `You are an AI assistant for a YouTube Summary AI application.

The user hasn't selected a specific YouTube video yet.

User Question: "${message}"

Please provide a helpful response. Since no video is selected:
- Acknowledge that no video is currently selected
- Provide general helpful information if their question is about YouTube, video analysis, or study methods
- Suggest they select a YouTube video first if they want video-specific analysis
- Offer guidance on how to use the application effectively

Be conversational, helpful, and guide them toward productive use of the application.`
    }

    console.log('Chat API - Sending prompt to Gemini AI...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()
    console.log('Chat API - Generated response length:', content.length)

    // Save to history if user is authenticated and has video context
    try {
      const { userId } = await auth()
      if (userId && videoUrl && videoTitle) {
        console.log('Chat API - Saving chat to history for user:', userId)

        const historyResponse = await fetch(`${request.nextUrl.origin}/api/history`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoUrl: videoUrl,
            videoTitle: videoTitle,
            contentType: 'chat',
            content: `**User Question:** ${message}\n\n**AI Response:** ${content}`,
            metadata: {
              transcriptLength: transcript.length,
              apiUsed: 'chat',
              userQuestion: message
            }
          })
        })

        if (!historyResponse.ok) {
          console.error('Chat API - Failed to save to history:', await historyResponse.text())
        }
      }
    } catch (historyError) {
      console.error('Chat API - Error saving to history:', historyError)
    }

    return NextResponse.json({
      response: content,
      hasVideoContext: !!transcript,
      videoTitle: videoTitle || null,
      videoUrl: videoUrl || null
    })

  } catch (error) {
    console.error('Chat API - Error processing request:', error)
    return NextResponse.json({ 
      error: 'Failed to process your message. Please try again.' 
    }, { status: 500 })
  }
}
