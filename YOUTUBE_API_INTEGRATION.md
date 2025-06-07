# YouTube API Integration Guide

## 🔑 API Keys Setup

### Environment Variables
```env
GEMINI_API_KEY=AIzaSyCng-287QiVwb34PK6U-IFbnTLi6MQii5E
YOUTUBE_API_KEY=AIzaSyBKpy9V1pUxAyHHlvpaVZPxcFL7mGsIowc
```

## 🚀 New Features

### Enhanced Video Information
The application now fetches comprehensive video metadata from YouTube API:

- **Video Title**: Real title from YouTube
- **Channel Information**: Channel name and details
- **Video Statistics**: View count, like count, comment count
- **Duration**: Actual video duration (formatted)
- **Thumbnails**: High-quality video thumbnails
- **Description**: Video description for context
- **Tags**: Video tags for better categorization
- **Publication Date**: When the video was published

### Improved AI Content Generation
The enhanced API (`/api/youtube-enhanced`) combines:

1. **YouTube Data API**: Video metadata and context
2. **YouTube Transcript API**: Video captions/subtitles
3. **Gemini AI**: Advanced content generation

This results in much more accurate and contextual:
- Study guides with video-specific information
- Briefing documents with proper context
- Better understanding of video content

## 🔧 API Endpoints

### 1. Test YouTube API
**Endpoint**: `/api/test-youtube-api`
**Purpose**: Test YouTube API connectivity and fetch video metadata
**Usage**: Verify API key works and get video information

### 2. Enhanced Content Generation
**Endpoint**: `/api/youtube-enhanced`
**Purpose**: Generate AI content using both video metadata and transcript
**Features**:
- Includes video title, channel, views, duration in AI prompts
- Better context for content generation
- More accurate and relevant output

### 3. Fallback System
The application uses a three-tier fallback system:
1. **Enhanced API** (YouTube Data + Transcript + AI)
2. **Regular API** (Transcript + AI only)
3. **Mock API** (Fallback with sample content)

## 🎯 Testing the Integration

### Step 1: Test YouTube API
1. Add a YouTube video
2. Select the video
3. Click "Test YouTube API" button
4. Should show: "YouTube API working! Title: [video title] ([view count] views)"

### Step 2: Test Enhanced Content Generation
1. Add a YouTube video with captions
2. Click "Study guide" or "Briefing doc"
3. Generated content should include:
   - Video title and channel information
   - View count and duration
   - More contextual and accurate content

### Step 3: Verify Video Information
When adding videos, you should now see:
- Real video titles instead of generic names
- Actual view counts (formatted: 1.2M, 45K, etc.)
- Proper duration formatting (4:13, 1:23:45)
- Channel names

## 📊 Enhanced Content Quality

### Before (Transcript Only)
- Generic content based only on transcript
- No video context or metadata
- Limited understanding of video purpose

### After (YouTube API + Transcript)
- Video-specific content with proper context
- Includes channel, views, duration information
- Better understanding of video type and audience
- More accurate study guides and briefing docs

## 🔍 Example Enhanced Prompt

The AI now receives prompts like:
```
VIDEO INFORMATION:
Video Title: How to Build a Carousel Component in Next.js
Channel: Web Dev Simplified
Published: 2024-01-15
Duration: PT4M13S
Views: 125000
Likes: 3200
Description: Learn how to create a responsive carousel...
Tags: nextjs, react, carousel, tutorial

INSTRUCTIONS:
Create a study guide with the following sections...

VIDEO TRANSCRIPT:
Today you're going to learn how to build this sick carousel component...
```

## 🛠️ Technical Implementation

### Video Addition Process
1. User enters YouTube URL
2. Extract video ID from URL
3. Fetch metadata from YouTube Data API
4. Format duration, views, likes for display
5. Create source with real video information
6. Show enhanced confirmation message

### Content Generation Process
1. User clicks "Study guide" or "Briefing doc"
2. Try enhanced API first (YouTube Data + Transcript + AI)
3. If enhanced fails, try regular API (Transcript + AI)
4. If both fail, use mock API as fallback
5. Display generated content in chat

### Error Handling
- Invalid YouTube URLs
- API quota exceeded
- Videos without captions
- Private or restricted videos
- Network connectivity issues

## 📈 Benefits

### For Users
- More accurate and relevant content
- Better video information display
- Enhanced study guides with context
- Professional briefing documents

### For Developers
- Robust fallback system
- Comprehensive error handling
- Easy testing and debugging
- Scalable architecture

## 🔧 Troubleshooting

### YouTube API Issues
- Check API key validity
- Verify quota limits
- Ensure video is public and accessible

### Enhanced Content Generation
- Test each API tier individually
- Check both API keys are set
- Verify video has captions available

### Common Error Messages
- "YouTube API request failed" → Check API key
- "Video not found" → Video may be private/deleted
- "No transcript available" → Video lacks captions

## 🎉 Success Indicators

✅ **YouTube API Working**: Real video titles and metadata displayed
✅ **Enhanced Generation**: Content includes video context and information
✅ **Fallback System**: Graceful degradation when APIs fail
✅ **User Experience**: Seamless integration with chat interface
