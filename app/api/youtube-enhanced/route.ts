import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { YoutubeTranscript } from 'youtube-transcript'
import { auth } from '@clerk/nextjs/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { url, type } = await request.json()
    console.log('Enhanced API - Received request:', { url, type })

    if (!url) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 })
    }

    if (!process.env.YOUTUBE_API_KEY) {
      return NextResponse.json({ 
        error: 'YOUTUBE_API_KEY not found in environment variables' 
      }, { status: 500 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'GEMINI_API_KEY not found in environment variables' 
      }, { status: 500 })
    }

    // Extract video ID from YouTube URL
    const videoId = extractVideoId(url)
    console.log('Enhanced API - Extracted video ID:', videoId)
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL format. Please use a valid YouTube URL.' }, { status: 400 })
    }

    // Fetch video metadata from YouTube Data API
    console.log('Enhanced API - Fetching video metadata...')
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,statistics,contentDetails`
    
    const metadataResponse = await fetch(apiUrl)
    const metadataData = await metadataResponse.json()

    if (!metadataResponse.ok) {
      console.error('YouTube API error:', metadataData)
      return NextResponse.json({ 
        error: 'Failed to fetch video metadata from YouTube API',
        details: metadataData.error?.message || 'Unknown error'
      }, { status: metadataResponse.status })
    }

    if (!metadataData.items || metadataData.items.length === 0) {
      return NextResponse.json({ 
        error: 'Video not found or not accessible',
        videoId 
      }, { status: 404 })
    }

    const video = metadataData.items[0]
    const snippet = video.snippet
    const statistics = video.statistics
    const contentDetails = video.contentDetails

    // Get transcript with retry logic
    let transcript = ''
    let transcriptError = null

    // Try to fetch transcript with retries
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Enhanced API - Fetching transcript for video ID: ${videoId} (attempt ${attempt}/3)`)
        const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId)
        transcript = transcriptArray.map(item => item.text).join(' ').trim()
        console.log('Enhanced API - Transcript length:', transcript.length)

        if (transcript && transcript.length >= 50) {
          console.log('Enhanced API - Transcript fetched successfully')
          break // Success, exit retry loop
        } else if (attempt < 3) {
          console.log(`Enhanced API - Transcript too short (${transcript.length} chars), retrying...`)
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          continue
        } else {
          // Final attempt failed
          transcriptError = `Video transcript is too short or empty (${transcript.length} characters). This video may not have sufficient captions available.`
        }
      } catch (error) {
        console.error(`Enhanced API - Error fetching transcript (attempt ${attempt}/3):`, error)
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

    // Generate enhanced content with both metadata and transcript
    console.log('Enhanced API - Generating content with Gemini AI for type:', type)
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    // Create enhanced context with video metadata
    const videoContext = `
Video Title: ${snippet.title}
Channel: ${snippet.channelTitle}
Published: ${snippet.publishedAt}
Duration: ${contentDetails.duration}
Views: ${statistics.viewCount}
Likes: ${statistics.likeCount}
Description: ${snippet.description?.substring(0, 500)}...
Tags: ${snippet.tags?.join(', ') || 'None'}
`

    let prompt = ''
    if (type === 'study-guide') {
      prompt = `Create a comprehensive study guide for this YouTube video. Use both the video metadata and transcript to create detailed content.

VIDEO INFORMATION:
${videoContext}

INSTRUCTIONS:
Create a study guide with the following sections:
1. **Video Overview** - Summary of the video including title, channel, and key details
2. **Main Topics & Key Concepts** - Core subjects covered
3. **Important Definitions** - Key terms and their meanings
4. **Detailed Content Breakdown** - Section-by-section analysis
5. **Key Takeaways** - Most important points to remember
6. **Study Questions** - Questions to test understanding
7. **Additional Resources** - Related topics to explore

Format the response in clear markdown with proper headings and bullet points.

VIDEO TRANSCRIPT:
${transcript.substring(0, 8000)}`
    } else if (type === 'briefing-doc') {
      prompt = `Create a professional briefing document for this YouTube video. Use both the video metadata and transcript to create comprehensive content.

VIDEO INFORMATION:
${videoContext}

INSTRUCTIONS:
Create a briefing document with the following sections:
1. **Executive Summary** - High-level overview of the video content
2. **Video Details** - Title, channel, metrics, and publication info
3. **Content Analysis** - Detailed breakdown of the video content
4. **Key Points & Insights** - Most important information presented
5. **Main Arguments/Findings** - Core messages and conclusions
6. **Actionable Recommendations** - What viewers should do with this information
7. **Conclusion** - Summary and final thoughts
8. **Appendix** - Additional details and context

Format as a professional briefing document in markdown.

VIDEO TRANSCRIPT:
${transcript.substring(0, 8000)}`
    } else {
      return NextResponse.json({ error: 'Invalid type. Must be "study-guide" or "briefing-doc"' }, { status: 400 })
    }

    console.log('Enhanced API - Sending prompt to Gemini AI...')
    const startTime = Date.now()
    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()
    const processingTime = Date.now() - startTime
    console.log('Enhanced API - Generated content length:', content.length)

    // Save to history if user is authenticated
    try {
      const { userId } = await auth()
      if (userId) {
        console.log('Enhanced API - Saving to history for user:', userId)

        // Save to database
        const historyResponse = await fetch(`${request.nextUrl.origin}/api/history`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoUrl: url,
            videoTitle: snippet.title,
            channelName: snippet.channelTitle,
            videoDuration: contentDetails.duration,
            videoViews: statistics.viewCount,
            videoThumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
            contentType: type,
            content: content,
            metadata: {
              transcriptLength: transcript.length,
              apiUsed: 'enhanced',
              processingTime: processingTime
            }
          })
        })

        if (historyResponse.ok) {
          console.log('Enhanced API - Successfully saved to history')
        } else {
          console.error('Enhanced API - Failed to save to history:', await historyResponse.text())
        }
      }
    } catch (historyError) {
      console.error('Enhanced API - Error saving to history:', historyError)
      // Don't fail the main request if history saving fails
    }

    return NextResponse.json({
      content,
      videoId,
      type,
      videoMetadata: {
        title: snippet.title,
        channelTitle: snippet.channelTitle,
        publishedAt: snippet.publishedAt,
        duration: contentDetails.duration,
        viewCount: statistics.viewCount,
        likeCount: statistics.likeCount,
        thumbnails: snippet.thumbnails
      },
      transcriptLength: transcript.length,
      enhanced: true,
      saved: !!userId
    })

  } catch (error) {
    console.error('Enhanced API - Error processing request:', error)
    return NextResponse.json({ 
      error: 'Failed to process video. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function extractVideoId(url: string): string | null {
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
