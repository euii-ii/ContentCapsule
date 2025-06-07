import { NextRequest, NextResponse } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'

export async function POST(request: NextRequest) {
  try {
    const { url, type } = await request.json()
    console.log('Mock API - Received request:', { url, type })

    if (!url) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 })
    }

    // Extract video ID from YouTube URL
    const videoId = extractVideoId(url)
    console.log('Mock API - Extracted video ID:', videoId)
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL format. Please use a valid YouTube URL.' }, { status: 400 })
    }

    // Get transcript with retry logic
    let transcript = ''
    let transcriptError = null

    // Try to fetch transcript with retries
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Mock API - Fetching transcript for video ID: ${videoId} (attempt ${attempt}/3)`)
        const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId)
        transcript = transcriptArray.map(item => item.text).join(' ').trim()
        console.log('Mock API - Transcript length:', transcript.length)

        if (transcript && transcript.length >= 50) {
          console.log('Mock API - Transcript fetched successfully')
          break // Success, exit retry loop
        } else if (attempt < 3) {
          console.log(`Mock API - Transcript too short (${transcript.length} chars), retrying...`)
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          continue
        } else {
          // Final attempt failed
          transcriptError = `Video transcript is too short or empty (${transcript.length} characters). This video may not have sufficient captions available.`
        }
      } catch (error) {
        console.error(`Mock API - Error fetching transcript (attempt ${attempt}/3):`, error)
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

    // Generate mock content based on type
    console.log('Mock API - Generating mock content for type:', type)
    
    let content = ''
    if (type === 'study-guide') {
      content = `# Study Guide

## Main Topics & Key Concepts
Based on the video transcript (${transcript.length} characters), here are the key topics covered:

- **Primary Subject**: ${transcript.substring(0, 100)}...
- **Core Concepts**: The video discusses important principles and methodologies
- **Key Terminology**: Essential vocabulary and definitions are presented

## Important Definitions
- **Term 1**: Definition based on video content
- **Term 2**: Another important concept explained
- **Term 3**: Additional terminology covered

## Key Takeaways
1. The video provides comprehensive coverage of the subject matter
2. Multiple examples and case studies are presented
3. Practical applications are demonstrated throughout
4. The content builds progressively from basic to advanced concepts

## Study Questions
1. What are the main points discussed in the video?
2. How do the concepts relate to real-world applications?
3. What examples were provided to illustrate key points?
4. How can this knowledge be applied practically?

## Summary Points
- The video covers ${Math.floor(transcript.length / 100)} major topic areas
- Content is structured in a logical, progressive manner
- Multiple learning modalities are employed
- Practical examples enhance understanding

## Additional Resources to Explore
- Related videos on the same topic
- Academic papers and research
- Practical exercises and applications
- Community discussions and forums

*Note: This study guide was generated from a ${transcript.length}-character transcript.*`
    } else if (type === 'briefing-doc') {
      content = `# Professional Briefing Document

## Executive Summary
This briefing document provides a comprehensive analysis of the video content, which contains ${transcript.length} characters of transcript data. The material covers significant insights and actionable information relevant to the subject matter.

**Key Highlights:**
- Comprehensive coverage of core topics
- Practical applications and examples
- Strategic insights and recommendations
- Implementation considerations

## Key Points & Insights

### Primary Findings
The video content reveals several important insights:

1. **Strategic Overview**: ${transcript.substring(0, 150)}...
2. **Operational Considerations**: The content addresses practical implementation aspects
3. **Best Practices**: Multiple proven methodologies are discussed
4. **Industry Standards**: Current practices and benchmarks are referenced

### Critical Analysis
- The information presented is current and relevant
- Multiple perspectives are considered
- Evidence-based recommendations are provided
- Practical examples support theoretical concepts

## Main Arguments/Findings

### Core Arguments
1. **Argument 1**: The video establishes clear foundational principles
2. **Argument 2**: Supporting evidence is provided through examples
3. **Argument 3**: Practical applications are demonstrated effectively

### Supporting Evidence
- Transcript analysis reveals ${Math.floor(transcript.length / 50)} distinct topic areas
- Content structure follows logical progression
- Multiple validation points are provided

## Actionable Recommendations

### Immediate Actions
1. **Review Key Concepts**: Focus on the primary topics identified
2. **Implement Best Practices**: Apply the methodologies discussed
3. **Gather Additional Information**: Research related topics for deeper understanding

### Strategic Considerations
1. **Long-term Planning**: Consider how insights apply to broader objectives
2. **Resource Allocation**: Determine necessary resources for implementation
3. **Performance Metrics**: Establish measures for success

## Conclusion
The video content provides valuable insights with practical applications. The ${transcript.length}-character transcript contains substantial information that can inform decision-making and strategic planning.

## Next Steps
1. **Detailed Review**: Conduct thorough analysis of specific sections
2. **Stakeholder Engagement**: Share findings with relevant team members
3. **Implementation Planning**: Develop action plans based on recommendations
4. **Follow-up Analysis**: Monitor outcomes and adjust strategies as needed

*Document generated from video transcript analysis - ${new Date().toLocaleDateString()}*`
    } else {
      return NextResponse.json({ error: 'Invalid type. Must be "study-guide" or "briefing-doc"' }, { status: 400 })
    }

    console.log('Mock API - Generated content length:', content.length)

    return NextResponse.json({ 
      content,
      videoId,
      type,
      transcriptLength: transcript.length,
      note: 'This is a mock response while Gemini API issues are being resolved'
    })

  } catch (error) {
    console.error('Mock API - Error processing request:', error)
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
