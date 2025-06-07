# ContentCapsule - YouTube Summary AI with Audio Podcast

A comprehensive AI-powered application that transforms YouTube videos into study guides, briefing documents, notes, and audio podcasts using advanced AI technology.

## 🚀 Features

### 🎥 YouTube Video Integration
- Add YouTube videos by URL with automatic validation
- Automatic transcript extraction and processing
- Video metadata extraction (title, channel, duration, views)
- Video management and selection interface

### 🤖 AI-Powered Content Generation
- **Study Guides**: Comprehensive study materials with key concepts, definitions, and study questions
- **Briefing Documents**: Professional briefing docs with executive summaries and actionable insights
- **Notes System**: Add personal notes with AI analysis and enhancement
- **Interactive Chat**: Ask questions about video content with context-aware responses
- Powered by Google Gemini AI for high-quality content generation

### 🎧 Audio Podcast Feature
- **Text-to-Speech**: Convert any generated summary into spoken audio
- **Voice Selection**: Choose from available system voices
- **Playback Controls**: Play, pause, stop, skip, speed control (0.5x-2x)
- **Professional Audio Player**: Full-featured podcast-style interface
- **Content Optimization**: Automatic markdown cleanup for natural speech

### 👤 User Authentication & History
- **Clerk Authentication**: Secure sign-in/sign-up with multiple providers
- **MongoDB Integration**: Persistent storage of user data and content
- **History Management**: Browse, filter, and manage all generated content
- **Usage Analytics**: Track content generation patterns and statistics
- **Cross-Device Sync**: Access your content from any device

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Theme**: Automatic theme switching with system preference
- **Professional Interface**: Clean, intuitive design with modern components
- **Toast Notifications**: Real-time feedback for user actions
- **Modal Dialogs**: Immersive content viewing experience

## 🛠️ Technical Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Beautiful icon library

### Backend & APIs
- **Next.js API Routes**: Serverless backend functions
- **MongoDB Atlas**: Cloud database with Mongoose ODM
- **Clerk**: Authentication and user management
- **Google Gemini AI**: Advanced language model for content generation
- **YouTube Transcript API**: Automatic transcript extraction
- **Web Speech API**: Browser-based text-to-speech

### Key Features
- **Real-time Processing**: Live content generation with progress indicators
- **Error Handling**: Comprehensive error management and user feedback
- **Performance Optimization**: Efficient API calls and caching
- **Security**: Secure authentication and data protection

## 🚀 Quick Start

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/euii-ii/ContentCapsule.git
cd ContentCapsule

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### 2. Environment Setup
Create `.env.local` with the following variables:
```env
# AI & APIs
GEMINI_API_KEY=your_gemini_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here

# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication (optional - works in keyless mode)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### 3. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to start using the application!

## 📖 How to Use

### 1. Add YouTube Videos
1. Click the "Add" button in the sources sidebar
2. Paste a YouTube URL
3. Video automatically appears with metadata

### 2. Generate AI Content
1. Select a video from your sources
2. Choose from the Studio options:
   - **Study Guide**: Comprehensive learning materials
   - **Briefing Doc**: Executive summary and insights
   - **Audio Podcast**: Generate and listen to audio version
   - **Add Note**: Personal notes with AI analysis

### 3. Interactive Features
- **Chat**: Ask questions about video content
- **History**: View all your generated content
- **Audio Player**: Listen to summaries as podcasts
- **Export**: Copy or download content

### 4. Audio Podcast Experience
1. Generate any content (study guide, briefing doc)
2. Click "Audio Podcast" button
3. Choose voice and adjust settings
4. Enjoy hands-free content consumption

## 🎯 Use Cases

### 📚 Education & Learning
- **Students**: Convert lectures into study guides and audio reviews
- **Researchers**: Generate briefing docs from academic videos
- **Professionals**: Create summaries of training materials

### 💼 Business & Productivity
- **Teams**: Share audio summaries of important presentations
- **Executives**: Get briefing docs from conference talks
- **Content Creators**: Analyze competitor content

### ♿ Accessibility
- **Visual Impairments**: Audio podcast feature for hands-free consumption
- **Learning Disabilities**: Multiple content formats for different learning styles
- **Multitasking**: Listen to summaries while doing other tasks

## 🔧 Advanced Features

### Content Management
- **History Filtering**: Filter by content type (study-guide, briefing-doc, note, chat)
- **Search Functionality**: Find specific content quickly
- **Bulk Operations**: Manage multiple items at once

### Audio Customization
- **Voice Selection**: Multiple system voices with language support
- **Speed Control**: Adjust playback speed from 0.5x to 2x
- **Volume Control**: Full audio management with mute option

### User Analytics
- **Usage Tracking**: Monitor content generation patterns
- **Statistics**: View detailed usage statistics
- **Progress Tracking**: See your learning journey

## 🔒 Security & Privacy

- **Secure Authentication**: Clerk-powered authentication system
- **Data Encryption**: All data encrypted in transit and at rest
- **User Isolation**: Strict data separation between users
- **Privacy Controls**: Full control over your data and content

## 📱 Mobile Experience

- **Responsive Design**: Optimized for all screen sizes
- **Touch-Friendly**: Mobile-optimized controls and interactions
- **Offline Capability**: View saved content without internet
- **Progressive Web App**: Install as mobile app

## 🚀 Future Roadmap

### Enhanced Audio Features
- **Cloud TTS Integration**: High-quality neural voices
- **Audio Downloads**: Save audio files locally
- **Background Music**: Optional ambient audio
- **Playlist Support**: Queue multiple summaries

### Advanced AI Features
- **Multi-language Support**: Generate content in different languages
- **Custom AI Models**: Fine-tuned models for specific domains
- **Batch Processing**: Process multiple videos simultaneously

### Collaboration Features
- **Team Workspaces**: Share content with team members
- **Comments & Annotations**: Collaborative note-taking
- **Export Integrations**: Direct export to popular platforms

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for powerful content generation
- Clerk for seamless authentication
- MongoDB Atlas for reliable data storage
- The open-source community for amazing tools and libraries

---

**ContentCapsule** - Transform any YouTube video into comprehensive learning materials and audio podcasts with the power of AI! 🎧📚✨
