import mongoose, { Schema, Document } from 'mongoose'

export interface ISummaryHistory extends Document {
  userId: string
  userEmail: string
  videoUrl: string
  videoTitle: string
  videoId: string
  channelName?: string
  videoDuration?: string
  videoViews?: string
  videoThumbnail?: string
  contentType: 'study-guide' | 'briefing-doc' | 'note' | 'chat'
  content: string
  analysis?: string
  metadata?: {
    transcriptLength?: number
    generatedAt: Date
    apiUsed?: string
    processingTime?: number
  }
  createdAt: Date
  updatedAt: Date
}

const SummaryHistorySchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  videoTitle: {
    type: String,
    required: true
  },
  videoId: {
    type: String,
    required: true,
    index: true
  },
  channelName: {
    type: String
  },
  videoDuration: {
    type: String
  },
  videoViews: {
    type: String
  },
  videoThumbnail: {
    type: String
  },
  contentType: {
    type: String,
    enum: ['study-guide', 'briefing-doc', 'note', 'chat'],
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  analysis: {
    type: String
  },
  metadata: {
    transcriptLength: Number,
    generatedAt: {
      type: Date,
      default: Date.now
    },
    apiUsed: String,
    processingTime: Number
  }
}, {
  timestamps: true
})

// Create compound indexes for efficient queries
SummaryHistorySchema.index({ userId: 1, createdAt: -1 })
SummaryHistorySchema.index({ userId: 1, contentType: 1, createdAt: -1 })
SummaryHistorySchema.index({ videoId: 1, userId: 1 })

export default mongoose.models.SummaryHistory || mongoose.model<ISummaryHistory>('SummaryHistory', SummaryHistorySchema)
