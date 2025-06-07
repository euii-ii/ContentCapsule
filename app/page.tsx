"use client"

import { useState, useEffect, useRef } from "react"
import {
  YoutubeIcon,
  PlusIcon,
  SettingsIcon,
  ShareIcon,
  UploadIcon,
  LinkIcon,
  FileTextIcon,
  ClipboardIcon,
  SearchIcon,
  PlayIcon,
  CheckIcon,
  SendIcon,
  MessageCircleIcon,
  BotIcon,
  UserIcon,
  Loader2,
  Copy,
  History,
  Headphones,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useYouTubeAI, GeneratedContent } from "@/hooks/use-youtube-ai"
import { useUserInitialization } from "@/hooks/use-user-initialization"
import { ContentViewer } from "@/components/content-viewer"
import { NotesModal } from "@/components/notes-modal"
import { UserProfile } from "@/components/user-profile"
import { HistoryModal } from "@/components/history-modal"
import { AudioPodcast } from "@/components/audio-podcast"
import { toast } from "sonner"

type Message = {
  id: number
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

// Client-side timestamp component to prevent hydration mismatch
function ClientTimestamp({ timestamp }: { timestamp: Date }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder during SSR to match what the server renders
    return <span className="text-xs opacity-70">--:--</span>
  }

  return (
    <span className="text-xs opacity-70">
      {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </span>
  )
}

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [initialMessageAdded, setInitialMessageAdded] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [isContentViewerOpen, setIsContentViewerOpen] = useState(false)
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isAudioPodcastOpen, setIsAudioPodcastOpen] = useState(false)
  const [audioPodcastContent, setAudioPodcastContent] = useState<string>("")
  const [audioPodcastTitle, setAudioPodcastTitle] = useState<string>("")
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)

  const { generateContent, isGenerating, error, clearError } = useYouTubeAI()
  const { userData, isInitializing, isUserReady } = useUserInitialization()
  const [sources, setSources] = useState<any[]>([])
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedSource, setSelectedSource] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Add initial message after component mounts to avoid hydration issues
    if (!initialMessageAdded) {
      setMessages([
        {
          id: 1,
          content:
            "👋 **Welcome to YouTube Summary AI!**\n\nI'm your AI assistant ready to help you analyze YouTube videos. Here's what I can do:\n\n🎥 **Add Videos**: Click 'Add' to include YouTube videos\n📚 **Study Guides**: Generate comprehensive study materials\n📋 **Briefing Docs**: Create professional briefing documents\n📝 **Notes**: Add personal notes for any video\n💬 **Chat**: Ask me questions about your videos\n\n💡 **Tip**: All generated content will appear right here in our chat for easy access!\n\n🚀 **Get started by clicking 'Add' in the sidebar to add your first YouTube video!**",
          sender: "ai",
          timestamp: new Date(),
        },
      ])
      setInitialMessageAdded(true)
    }
  }, [initialMessageAdded])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleGenerateContent = async (type: 'study-guide' | 'briefing-doc') => {
    if (!selectedSource?.url) {
      toast.error("Please select a YouTube video first")
      return
    }

    // Validate YouTube URL
    if (!selectedSource.url.includes('youtube.com') && !selectedSource.url.includes('youtu.be')) {
      toast.error("Please select a valid YouTube video")
      return
    }

    clearError()
    toast.info(`Generating ${type.replace('-', ' ')}... This may take 10-30 seconds.`)

    // Add a loading message to chat
    const loadingMessage: Message = {
      id: messages.length + 1,
      content: `🤖 Generating ${type.replace('-', ' ')} for "${selectedSource.title}"...\n\nPlease wait while I analyze the video transcript and create comprehensive content for you.`,
      sender: "ai",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, loadingMessage])

    const content = await generateContent(selectedSource.url, type)

    if (content) {
      // Add the generated content to chat
      const contentMessage: Message = {
        id: messages.length + 2,
        content: `✅ **${type.replace('-', ' ').toUpperCase()} GENERATED**\n\n${content.content}`,
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, contentMessage])

      // Also show in modal for easy copying/downloading
      setGeneratedContent(content)
      setIsContentViewerOpen(true)
      toast.success(`${type.replace('-', ' ')} generated successfully!`)
    } else if (error) {
      // Add error message to chat with helpful suggestions
      const isTranscriptError = error.includes('transcript') || error.includes('captions')
      const errorMessage: Message = {
        id: messages.length + 2,
        content: `❌ **Error generating ${type.replace('-', ' ')}**\n\n${error}\n\n💡 **What you can try:**\n${isTranscriptError
          ? '• Wait a moment and try again (transcript services can be temporarily busy)\n• Make sure the video has captions/subtitles enabled\n• Try a different video with clear captions\n• Check if the video is publicly accessible'
          : '• Try again in a few moments\n• Check your internet connection\n• Try a different video'
        }\n\n🔄 **Tip**: Click the "${type.replace('-', ' ')}" button again to retry!`,
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      toast.error(`Failed to generate ${type.replace('-', ' ')}. See chat for details.`)
    }
  }

  const handleAddNote = () => {
    if (!selectedSource?.url) {
      toast.error("Please select a YouTube video first")
      return
    }

    setIsNotesModalOpen(true)
  }

  const handleGenerateAudioPodcast = async () => {
    if (!selectedSource?.url) {
      toast.error("Please select a YouTube video first")
      return
    }

    // Validate YouTube URL
    if (!selectedSource.url.includes('youtube.com') && !selectedSource.url.includes('youtu.be')) {
      toast.error("Please select a valid YouTube video")
      return
    }

    setIsGeneratingAudio(true)
    clearError()
    toast.info("Generating audio podcast content... This may take 10-30 seconds.")

    // Add a loading message to chat
    const loadingMessage: Message = {
      id: messages.length + 1,
      content: `🎧 Generating audio podcast for "${selectedSource.title}"...\n\nPlease wait while I analyze the video transcript and create optimized content for audio consumption.`,
      sender: "ai",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, loadingMessage])

    try {
      // Generate content specifically optimized for audio
      const content = await generateContent(selectedSource.url, 'study-guide')

      if (content) {
        // Set up audio podcast content
        setAudioPodcastContent(content.content)
        setAudioPodcastTitle(`Audio Podcast - ${selectedSource.title}`)
        setIsAudioPodcastOpen(true)

        // Add success message to chat
        const successMessage: Message = {
          id: messages.length + 2,
          content: `🎧 **AUDIO PODCAST READY**\n\nYour audio podcast has been generated and is ready to play! The content has been optimized for audio consumption with:\n\n✅ **Clean narration**: Markdown formatting removed\n✅ **Natural flow**: Optimized for speech synthesis\n✅ **Professional quality**: Enhanced for listening experience\n\n🎵 **Click the audio player to start listening!**\n\nYou can adjust voice, speed, and volume to your preference.`,
          sender: "ai",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, successMessage])
        toast.success("Audio podcast generated successfully!")
      } else if (error) {
        // Add error message to chat
        const errorMessage: Message = {
          id: messages.length + 2,
          content: `❌ **Error generating audio podcast**\n\n${error}\n\n💡 **What you can try:**\n• Wait a moment and try again\n• Make sure the video has captions/subtitles enabled\n• Try a different video with clear captions\n• Check if the video is publicly accessible\n\n🔄 **Tip**: Click the "Audio Podcast" button again to retry!`,
          sender: "ai",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
        toast.error("Failed to generate audio podcast. See chat for details.")
      }
    } catch (err) {
      console.error('Error generating audio podcast:', err)
      const errorMessage: Message = {
        id: messages.length + 2,
        content: `❌ **Error generating audio podcast**\n\nUnexpected error occurred. Please try again.\n\n🔄 **Tip**: Click the "Audio Podcast" button again to retry!`,
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      toast.error("Failed to generate audio podcast")
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const handleNoteSaved = (note: string, analysis?: string) => {
    const userMessage: Message = {
      id: messages.length + 1,
      content: note,
      sender: "user",
      timestamp: new Date(),
    }

    const aiMessage: Message = {
      id: messages.length + 2,
      content: analysis
        ? `📝 **Note saved for "${selectedSource?.title}"**\n\n✨ **AI Analysis:**\n\n${analysis}\n\n💡 **Your note has been saved and analyzed!** You can reference this note when generating study guides or briefing documents.`
        : `📝 **Note saved for "${selectedSource?.title}"**\n\nYour note has been recorded and associated with this video. You can reference this note when generating study guides or briefing documents.`,
      sender: "ai",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage, aiMessage])
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage("")
    setIsLoading(true)

    try {
      // Call the chat API to get AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          videoUrl: selectedSource?.url || null,
          videoTitle: selectedSource?.title || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get AI response')
      }

      const data = await response.json()

      const aiMessage: Message = {
        id: messages.length + 2,
        content: data.response,
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: messages.length + 2,
        content: `❌ **Error**: ${error instanceof Error ? error.message : 'Failed to get AI response'}\n\nPlease try again or check your connection.`,
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      toast.error("Failed to get AI response")
    } finally {
      setIsLoading(false)
    }
  }

  const addYouTubeSource = async () => {
    if (!videoUrl) return

    // Validate YouTube URL format
    const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]

    if (!videoId) {
      toast.error("Please enter a valid YouTube URL")
      return
    }

    // Show loading message
    toast.info("Fetching video information...")

    try {
      // Try to get video metadata from YouTube API
      const response = await fetch('/api/test-youtube-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl })
      })

      let videoTitle = `YouTube Video (${videoId})`
      let duration = "Unknown"
      let views = "Unknown"
      let likes = "Unknown"
      let channelTitle = "Unknown"

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          videoTitle = data.title
          duration = formatDuration(data.duration)
          views = formatNumber(data.viewCount)
          likes = formatNumber(data.likeCount)
          channelTitle = data.channelTitle
        }
      }

      const newSource = {
        id: sources.length + 1,
        title: videoTitle,
        type: "youtube",
        url: videoUrl,
        duration: duration,
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        views: views,
        likes: likes,
      }

      setSources([...sources, newSource])
      setSelectedSource(newSource)
      setVideoUrl("")
      setIsUploadModalOpen(false)

      toast.success("YouTube video added successfully!")

      const aiMessage: Message = {
        id: messages.length + 1,
        content: `✅ **YouTube video added successfully!**\n\n📹 **Video**: ${videoTitle}\n👤 **Channel**: ${channelTitle}\n⏱️ **Duration**: ${duration}\n👀 **Views**: ${views}\n\n🎯 **What you can do now:**\n• 📚 **Study guide** - Generate comprehensive study materials\n• 📋 **Briefing doc** - Create professional briefing documents\n• 📝 **Add note** - Save personal notes about this video\n• 💬 **Ask questions** - Chat with AI about the video content\n\n💬 **All generated content will appear in this chat** for easy access and copying!\n\n💡 **Enhanced with YouTube API**: Better content generation with video metadata!`,
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])

    } catch (error) {
      toast.error("Failed to fetch video information, but video was added")

      // Fallback to basic video info
      const newSource = {
        id: sources.length + 1,
        title: `YouTube Video (${videoId})`,
        type: "youtube",
        url: videoUrl,
        duration: "Unknown",
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        views: "Unknown",
        likes: "Unknown",
      }

      setSources([...sources, newSource])
      setSelectedSource(newSource)
      setVideoUrl("")
      setIsUploadModalOpen(false)
    }
  }

  const formatDuration = (duration: string): string => {
    // Convert ISO 8601 duration (PT4M13S) to readable format (4:13)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return duration

    const hours = parseInt(match[1] || '0')
    const minutes = parseInt(match[2] || '0')
    const seconds = parseInt(match[3] || '0')

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatNumber = (num: string): string => {
    const number = parseInt(num)
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M'
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K'
    }
    return number.toString()
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <YoutubeIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">ContentCapsule</h1>
              <p className="text-sm text-muted-foreground">Powered by AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isInitializing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden md:inline">Initializing...</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryModalOpen(true)}
              className="flex items-center gap-2"
              disabled={!isUserReady}
              title={!isUserReady ? "Please wait for user initialization" : "View your summary history"}
            >
              <History className="h-4 w-4" />
              <span className="hidden md:inline">History</span>
            </Button>
            <UserProfile />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 pt-20">
        {/* Sources Sidebar */}
        <div className="w-80 border-r bg-muted/30">
          <div className="p-4 border-b">
            <div className="flex gap-2 mb-4">
              <Button size="sm" onClick={() => setIsUploadModalOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-1" />
                Add
              </Button>
              <Button size="sm" variant="outline">
                <SearchIcon className="h-4 w-4 mr-1" />
                Discover
              </Button>
            </div>

            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <YoutubeIcon className="h-5 w-5" />
                    Add New Source
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
                    <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Upload sources</h3>
                    <p className="text-muted-foreground mb-4">
                      Drag and drop or <button className="text-primary underline">choose file</button> to upload
                    </p>
                    <p className="text-sm text-muted-foreground">Supported: PDF, TXT, Markdown, Audio, Video</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Button variant="outline" className="h-16 justify-start">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                        <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                        </svg>
                      </div>
                      Google Drive
                    </Button>
                    <Button variant="outline" className="h-16 justify-start">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                        <LinkIcon className="h-4 w-4 text-white" />
                      </div>
                      Link
                    </Button>
                    <Button variant="outline" className="h-16 justify-start">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                        <ClipboardIcon className="h-4 w-4 text-white" />
                      </div>
                      Paste text
                    </Button>
                    <Button variant="outline" className="h-16 justify-start">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                        <FileTextIcon className="h-4 w-4 text-white" />
                      </div>
                      Google Docs
                    </Button>
                    <Button variant="outline" className="h-16 justify-start">
                      <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                        <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                        </svg>
                      </div>
                      Website
                    </Button>
                    <Button variant="outline" className="h-16 justify-start">
                      <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                        <YoutubeIcon className="h-4 w-4 text-white" />
                      </div>
                      YouTube
                    </Button>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold">Add YouTube Video</h3>
                    <div className="flex gap-4">
                      <Input
                        placeholder="https://youtube.com/watch?v=..."
                        className="flex-1"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                      />
                      <Button onClick={addYouTubeSource} disabled={!videoUrl}>
                        <PlayIcon className="h-4 w-4 mr-2" />
                        Add Source
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t">
                    <span className="text-sm font-medium">Source limit</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${Math.min((sources.length / 300) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{sources.length}/300</span>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" defaultChecked />
              <span>Select all sources</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {sources.length === 0 ? (
              <div className="text-center py-8">
                <YoutubeIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No videos added yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your first YouTube video to get started with AI analysis
                </p>
                <Button
                  size="sm"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="mx-auto"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add YouTube Video
                </Button>
              </div>
            ) : (
              sources.map((source) => (
                <div
                  key={source.id}
                  className={`rounded-lg cursor-pointer transition-colors ${
                    selectedSource?.id === source.id
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-muted/50 hover:bg-muted border border-transparent"
                  }`}
                  onClick={() => setSelectedSource(source)}
                >
                  <div className="flex items-center gap-3 p-3">
                    <input type="checkbox" defaultChecked onClick={(e) => e.stopPropagation()} />
                    <div className="relative">
                      <img
                        src={source.thumbnail || "/placeholder.svg"}
                        alt="Video thumbnail"
                        className="w-16 h-12 rounded object-cover"
                      />
                      <Badge className="absolute -bottom-1 -right-1 text-xs">{source.duration}</Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{source.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <YoutubeIcon className="h-3 w-3 text-red-500" />
                        <span>YouTube</span>
                        <span>•</span>
                        <span>{source.views}</span>
                      </div>
                    </div>
                  </div>
                  {selectedSource?.id === source.id && (
                    <div className="absolute right-2 top-2">
                      <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <CheckIcon className="h-3 w-3 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MessageCircleIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Chat with AI</h1>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Active</Badge>
                  <Badge>Pro</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-2xl rounded-lg p-4 ${
                    message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {message.sender === "ai" && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <BotIcon className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {message.sender === "user" ? "You" : "AI Assistant"}
                        </span>
                        <ClientTimestamp timestamp={message.timestamp} />
                        {message.sender === "ai" && message.content.length > 200 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 ml-auto"
                            onClick={async () => {
                              await navigator.clipboard.writeText(message.content)
                              toast.success("Content copied to clipboard!")
                            }}
                            title="Copy content"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="whitespace-pre-line prose prose-sm max-w-none">
                        {message.content}
                      </div>
                    </div>
                    {message.sender === "user" && (
                      <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <UserIcon className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-2xl rounded-lg p-4 bg-muted">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <BotIcon className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <span className="ml-2 text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-3 mb-2">
              <Input
                placeholder="Ask me anything about the videos..."
                className="flex-1"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Ask questions about your YouTube videos or request summaries, insights, and more!
            </p>
          </div>
        </div>

        {/* Studio Sidebar */}
        <div className="w-80 border-l bg-muted/30 p-4">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-lg font-semibold">Studio</h2>
            <Badge>Pro</Badge>
          </div>

          <div className="space-y-4">
            {selectedSource ? (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <YoutubeIcon className="h-4 w-4 text-red-500" />
                  Selected Video
                </h3>
                <p className="text-sm text-muted-foreground mb-2 truncate">
                  {selectedSource.title}
                </p>
                <Badge variant="secondary" className="text-xs">
                  Ready for AI processing
                </Badge>
              </Card>
            ) : (
              <Card className="p-4 bg-muted/50 border-dashed">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <YoutubeIcon className="h-4 w-4 text-muted-foreground" />
                  No Video Selected
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Add a YouTube video to start generating AI content
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="w-full"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Video
                </Button>
              </Card>
            )}



            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleAddNote}
                disabled={!selectedSource}
                title={!selectedSource ? "Please select a YouTube video first" : "Add a note for this video"}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add note
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleGenerateContent('study-guide')}
                disabled={isGenerating || !selectedSource}
                title={!selectedSource ? "Please select a YouTube video first" : "Generate AI study guide"}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileTextIcon className="h-4 w-4 mr-2" />
                )}
                Study guide
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleGenerateContent('briefing-doc')}
                disabled={isGenerating || !selectedSource}
                title={!selectedSource ? "Please select a YouTube video first" : "Generate AI briefing document"}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileTextIcon className="h-4 w-4 mr-2" />
                )}
                Briefing doc
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30"
                onClick={handleGenerateAudioPodcast}
                disabled={isGenerating || isGeneratingAudio || !selectedSource}
                title={!selectedSource ? "Please select a YouTube video first" : "Generate audio podcast from video content"}
              >
                {isGeneratingAudio ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-purple-600" />
                ) : (
                  <Headphones className="h-4 w-4 mr-2 text-purple-600" />
                )}
                <span className="text-purple-700 dark:text-purple-300">Audio Podcast</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ContentViewer
        content={generatedContent}
        isOpen={isContentViewerOpen}
        onClose={() => setIsContentViewerOpen(false)}
      />

      <NotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        videoTitle={selectedSource?.title || ""}
        videoUrl={selectedSource?.url || ""}
        onNoteSaved={handleNoteSaved}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      <AudioPodcast
        content={audioPodcastContent}
        title={audioPodcastTitle}
        isOpen={isAudioPodcastOpen}
        onClose={() => setIsAudioPodcastOpen(false)}
      />
    </div>
  )
}
