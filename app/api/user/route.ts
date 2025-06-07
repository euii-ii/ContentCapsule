import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import connectToDatabase from '@/lib/mongodb'
import User from '@/lib/models/User'

// GET - Get or create user profile
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Try to find existing user
    let user = await User.findOne({ clerkId: userId })

    if (!user) {
      // Get user info from Clerk
      const clerkUser = await currentUser()
      
      if (!clerkUser) {
        return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 })
      }

      // Create new user
      user = new User({
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        profileImage: clerkUser.imageUrl,
        plan: 'free',
        lastLoginAt: new Date()
      })

      await user.save()
      console.log(`User API - Created new user: ${user.email}`)
    } else {
      // Update last login
      user.lastLoginAt = new Date()
      await user.save()
    }

    return NextResponse.json({
      success: true,
      data: user
    })

  } catch (error) {
    console.error('User API - Error:', error)
    return NextResponse.json({ 
      error: 'Failed to get user profile' 
    }, { status: 500 })
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()

    await connectToDatabase()

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: updates },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('User API - Error updating profile:', error)
    return NextResponse.json({ 
      error: 'Failed to update profile' 
    }, { status: 500 })
  }
}

// GET user statistics
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json()

    if (action === 'stats') {
      await connectToDatabase()

      const user = await User.findOne({ clerkId: userId })
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Get summary statistics from SummaryHistory
      const SummaryHistory = (await import('@/lib/models/SummaryHistory')).default
      
      const stats = await SummaryHistory.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$contentType',
            count: { $sum: 1 },
            lastCreated: { $max: '$createdAt' }
          }
        }
      ])

      const totalSummaries = await SummaryHistory.countDocuments({ userId })

      return NextResponse.json({
        success: true,
        data: {
          user: {
            plan: user.plan,
            usage: user.usage,
            createdAt: user.createdAt
          },
          stats: {
            total: totalSummaries,
            byType: stats.reduce((acc, stat) => {
              acc[stat._id] = {
                count: stat.count,
                lastCreated: stat.lastCreated
              }
              return acc
            }, {})
          }
        }
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('User API - Error getting stats:', error)
    return NextResponse.json({ 
      error: 'Failed to get user statistics' 
    }, { status: 500 })
  }
}
