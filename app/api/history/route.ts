import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectToDatabase from '@/lib/mongodb'
import SummaryHistory from '@/lib/models/SummaryHistory'
import User from '@/lib/models/User'

// Helper function to extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

// GET - Fetch user's summary history
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const contentType = searchParams.get('type')
    const videoId = searchParams.get('videoId')

    // Build query
    const query: any = { userId }
    if (contentType) query.contentType = contentType
    if (videoId) query.videoId = videoId

    // Get total count for pagination
    const total = await SummaryHistory.countDocuments(query)

    // Fetch history with pagination
    const history = await SummaryHistory.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: history,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('History API - Error fetching history:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch history' 
    }, { status: 500 })
  }
}

// POST - Save new summary to history
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      videoUrl,
      videoTitle,
      channelName,
      videoDuration,
      videoViews,
      videoThumbnail,
      contentType,
      content,
      analysis,
      metadata
    } = await request.json()

    if (!videoUrl || !videoTitle || !contentType || !content) {
      return NextResponse.json({ 
        error: 'Missing required fields: videoUrl, videoTitle, contentType, content' 
      }, { status: 400 })
    }

    await connectToDatabase()

    // Get user info from Clerk
    const user = await User.findOne({ clerkId: userId })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const videoId = extractVideoId(videoUrl)
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }

    // Create new history entry
    const historyEntry = new SummaryHistory({
      userId,
      userEmail: user.email,
      videoUrl,
      videoTitle,
      videoId,
      channelName,
      videoDuration,
      videoViews,
      videoThumbnail,
      contentType,
      content,
      analysis,
      metadata: {
        ...metadata,
        generatedAt: new Date()
      }
    })

    await historyEntry.save()

    // Update user usage statistics
    const usageField = `usage.${contentType === 'study-guide' ? 'studyGuides' : 
                                contentType === 'briefing-doc' ? 'briefingDocs' :
                                contentType === 'note' ? 'notes' : 'chatMessages'}`
    
    await User.findByIdAndUpdate(user._id, {
      $inc: { [usageField]: 1 },
      lastLoginAt: new Date()
    })

    console.log(`History API - Saved ${contentType} for user ${userId}`)

    return NextResponse.json({
      success: true,
      data: historyEntry,
      message: 'Summary saved to history successfully'
    })

  } catch (error) {
    console.error('History API - Error saving to history:', error)
    return NextResponse.json({ 
      error: 'Failed to save to history' 
    }, { status: 500 })
  }
}

// DELETE - Delete specific history entry
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const historyId = searchParams.get('id')

    if (!historyId) {
      return NextResponse.json({ error: 'History ID required' }, { status: 400 })
    }

    await connectToDatabase()

    // Delete only if it belongs to the user
    const result = await SummaryHistory.findOneAndDelete({
      _id: historyId,
      userId
    })

    if (!result) {
      return NextResponse.json({ error: 'History entry not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'History entry deleted successfully'
    })

  } catch (error) {
    console.error('History API - Error deleting history:', error)
    return NextResponse.json({ 
      error: 'Failed to delete history entry' 
    }, { status: 500 })
  }
}
