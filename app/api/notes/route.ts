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
    const { note, videoUrl, videoTitle, type = 'save' } = await request.json()
    console.log('Notes API - Received request:', { note: note?.substring(0, 100), videoUrl, videoTitle, type })

    if (!note || !note.trim()) {
      return NextResponse.json({ error: 'Note content is required' }, { status: 400 })
    }

    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables')
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    // If type is 'analyze', provide AI analysis of the note
    if (type === 'analyze') {
      let transcript = ''
      let videoContext = ''
      
      // Try to get video transcript for context
      try {
        const videoId = extractVideoId(videoUrl)
        if (videoId) {
          console.log('Notes API - Fetching transcript for context:', videoId)
          const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId)
          transcript = transcriptArray.map(item => item.text).join(' ').trim()
          
          if (transcript && transcript.length > 100) {
            videoContext = `\n\nVideo Context (first 2000 characters):\n${transcript.substring(0, 2000)}`
          }
        }
      } catch (error) {
        console.log('Notes API - Could not fetch transcript, proceeding without context')
      }

      const analysisPrompt = `You are an AI assistant helping to analyze and enhance user notes about a YouTube video.

Video: "${videoTitle}"
URL: ${videoUrl}${videoContext}

User's Note:
"${note}"

Please provide a helpful analysis of this note including:

1. **Key Insights**: What are the main points or insights in this note?
2. **Connections**: How does this note relate to the video content?
3. **Suggestions**: What additional points or questions might be worth exploring?
4. **Organization**: How could this note be structured or categorized?
5. **Action Items**: Are there any actionable takeaways or next steps?

Format your response in clear markdown with proper headings. Be concise but insightful.`

      console.log('Notes API - Generating analysis with Gemini AI...')
      const result = await model.generateContent(analysisPrompt)
      const response = await result.response
      const analysis = response.text()
      console.log('Notes API - Generated analysis length:', analysis.length)

      // Save to history if user is authenticated
      try {
        const { userId } = await auth()
        if (userId) {
          console.log('Notes API - Saving analyzed note to history for user:', userId)

          const historyResponse = await fetch(`${request.nextUrl.origin}/api/history`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              videoUrl: videoUrl,
              videoTitle: videoTitle,
              contentType: 'note',
              content: note,
              analysis: analysis,
              metadata: {
                transcriptLength: transcript.length,
                apiUsed: 'notes-analyze'
              }
            })
          })

          if (!historyResponse.ok) {
            console.error('Notes API - Failed to save to history:', await historyResponse.text())
          }
        }
      } catch (historyError) {
        console.error('Notes API - Error saving to history:', historyError)
      }

      return NextResponse.json({
        success: true,
        note: note,
        analysis: analysis,
        videoTitle: videoTitle,
        videoUrl: videoUrl,
        hasVideoContext: !!transcript,
        type: 'analyze'
      })
    }

    // Default: just save the note (basic response)
    // Save to history if user is authenticated
    try {
      const { userId } = await auth()
      if (userId) {
        console.log('Notes API - Saving note to history for user:', userId)

        const historyResponse = await fetch(`${request.nextUrl.origin}/api/history`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoUrl: videoUrl,
            videoTitle: videoTitle,
            contentType: 'note',
            content: note,
            metadata: {
              apiUsed: 'notes-save'
            }
          })
        })

        if (!historyResponse.ok) {
          console.error('Notes API - Failed to save to history:', await historyResponse.text())
        }
      }
    } catch (historyError) {
      console.error('Notes API - Error saving to history:', historyError)
    }

    return NextResponse.json({
      success: true,
      note: note,
      videoTitle: videoTitle,
      videoUrl: videoUrl,
      message: 'Note saved successfully',
      type: 'save'
    })

  } catch (error) {
    console.error('Notes API - Error processing request:', error)
    return NextResponse.json({ 
      error: 'Failed to process note. Please try again.' 
    }, { status: 500 })
  }
}
