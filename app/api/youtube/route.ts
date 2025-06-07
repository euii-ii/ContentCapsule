import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { YoutubeTranscript } from 'youtube-transcript'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { url, type } = await request.json()
    console.log('Received request:', { url, type })

    if (!url) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 })
    }

    // Extract video ID from YouTube URL
    const videoId = extractVideoId(url)
    console.log('Extracted video ID:', videoId)
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL format. Please use a valid YouTube URL.' }, { status: 400 })
    }

    // Get transcript with retry logic
    let transcript = ''
    let transcriptError = null

    // Try to fetch transcript with retries
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Fetching transcript for video ID: ${videoId} (attempt ${attempt}/3)`)
        const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId)
        transcript = transcriptArray.map(item => item.text).join(' ').trim()
        console.log('Transcript length:', transcript.length)
        console.log('First 100 characters:', transcript.substring(0, 100))

        if (transcript && transcript.length >= 50) {
          console.log('Transcript fetched successfully')
          break // Success, exit retry loop
        } else if (attempt < 3) {
          console.log(`Transcript too short (${transcript.length} chars), retrying...`)
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          continue
        } else {
          // Final attempt failed
          transcriptError = `Video transcript is too short or empty (${transcript.length} characters). This video may not have sufficient captions available.`
        }
      } catch (error) {
        console.error(`Error fetching transcript (attempt ${attempt}/3):`, error)
        transcriptError = error instanceof Error ? error.message : 'Unknown error'

        if (attempt < 3) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          continue
        }
      }
    }

    // If transcript fetching failed after all retries, return error
    if (!transcript || transcript.length < 50) {
      return NextResponse.json({
        error: transcriptError || 'Could not fetch video transcript. Please ensure the video has captions/subtitles available and is publicly accessible.',
        transcriptLength: transcript.length,
        videoId: videoId,
        suggestion: 'Try again in a few moments, or try a different video with captions.'
      }, { status: 400 })
    }

    // Generate content based on type
    console.log('Generating content with Gemini AI for type:', type)

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables')
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    let prompt = ''
    if (type === 'study-guide') {
      prompt = `Create a comprehensive study guide based on this YouTube video transcript. Include:

1. **Main Topics & Key Concepts**
2. **Important Definitions**
3. **Key Takeaways**
4. **Study Questions**
5. **Summary Points**
6. **Additional Resources to Explore**

Format the response in clear markdown with proper headings and bullet points.

Transcript: ${transcript.substring(0, 8000)}`  // Limit transcript length
    } else if (type === 'briefing-doc') {
      prompt = `Create a professional briefing document based on this YouTube video transcript. Include:

1. **Executive Summary**
2. **Key Points & Insights**
3. **Main Arguments/Findings**
4. **Actionable Recommendations**
5. **Conclusion**
6. **Next Steps**

Format as a professional briefing document in markdown.

Transcript: ${transcript.substring(0, 8000)}`  // Limit transcript length
    } else {
      return NextResponse.json({ error: 'Invalid type. Must be "study-guide" or "briefing-doc"' }, { status: 400 })
    }

    console.log('Sending prompt to Gemini AI...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()
    console.log('Generated content length:', content.length)

    return NextResponse.json({ 
      content,
      videoId,
      type 
    })

  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json({ 
      error: 'Failed to process video. Please try again.' 
    }, { status: 500 })
  }
}

function extractVideoId(url: string): string | null {
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/.*[?&]v=)([a-zA-Z0-9_-]{11})/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}
