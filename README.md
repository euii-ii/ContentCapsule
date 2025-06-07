# YouTube Summary AI

A powerful AI-powered application that generates comprehensive study guides and briefing documents from YouTube videos using Google's Gemini AI.

## Features

### 🎥 YouTube Video Integration
- Add YouTube videos by URL
- Automatic transcript extraction
- Video management and selection

### 🤖 AI-Powered Content Generation
- **Study Guides**: Comprehensive study materials with key concepts, definitions, and study questions
- **Briefing Documents**: Professional briefing docs with executive summaries and actionable insights
- Powered by Google Gemini AI for high-quality content generation

### 💬 Interactive Chat Interface
- Chat with AI about your videos
- Real-time message timestamps
- Loading indicators and status updates

### 🎨 Modern UI/UX
- Dark/Light theme support
- Responsive design
- Toast notifications for user feedback
- Modal dialogs for content viewing

## How to Use

### 1. Add a YouTube Video
1. Click the "Add" button in the sources sidebar
2. Paste a YouTube URL in the input field
3. Click "Add Source" to add the video

### 2. Generate AI Content
1. Select a video from the sources list
2. In the Studio panel (right sidebar), click either:
   - **Study guide** - Generates comprehensive study materials
   - **Briefing doc** - Creates professional briefing documents

### 3. View and Export Content
- Generated content opens in a modal viewer
- Copy content to clipboard
- Download as Markdown file
- Professional formatting with proper headings and structure

## Technical Implementation

### API Integration
- **Gemini AI**: Google's generative AI for content creation
- **YouTube Transcript API**: Automatic transcript extraction
- **Next.js API Routes**: Backend API handling

### Key Components
- `useYouTubeAI` hook for AI operations
- `ContentViewer` component for displaying generated content
- `ClientTimestamp` component for hydration-safe time display

### Environment Variables
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env.local`
4. Run the development server:
   ```bash
   npm run dev
   ```

## Requirements

- Node.js 18+
- Valid YouTube videos with available captions/transcripts
- Google Gemini API key

## Error Handling

The application includes comprehensive error handling for:
- Invalid YouTube URLs
- Videos without transcripts
- API rate limits
- Network connectivity issues

## Future Enhancements

- Audio summary generation
- Multiple language support
- Video thumbnail extraction
- Advanced search and filtering
- Export to various formats (PDF, DOCX)

## Contributing

Feel free to submit issues and enhancement requests!
