import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  profileImage?: string
  plan: 'free' | 'pro' | 'premium'
  usage: {
    studyGuides: number
    briefingDocs: number
    notes: number
    chatMessages: number
    monthlyReset: Date
  }
  preferences: {
    theme?: 'light' | 'dark' | 'system'
    language?: string
    notifications?: boolean
  }
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date
}

const UserSchema: Schema = new Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  profileImage: {
    type: String
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'premium'],
    default: 'free'
  },
  usage: {
    studyGuides: {
      type: Number,
      default: 0
    },
    briefingDocs: {
      type: Number,
      default: 0
    },
    notes: {
      type: Number,
      default: 0
    },
    chatMessages: {
      type: Number,
      default: 0
    },
    monthlyReset: {
      type: Date,
      default: () => {
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth() + 1, 1)
      }
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
