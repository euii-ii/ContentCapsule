"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward,
  Download,
  Settings,
  Headphones,
  Mic
} from "lucide-react"
import { toast } from "sonner"

interface AudioPodcastProps {
  content: string
  title: string
  isOpen: boolean
  onClose: () => void
}

interface Voice {
  name: string
  lang: string
  gender?: string
}

export function AudioPodcast({ content, title, isOpen, onClose }: AudioPodcastProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [selectedVoice, setSelectedVoice] = useState<string>("")
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string>("")

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices()
      const voiceList = voices.map(voice => ({
        name: voice.name,
        lang: voice.lang,
        gender: voice.name.toLowerCase().includes('female') ? 'female' : 
                voice.name.toLowerCase().includes('male') ? 'male' : undefined
      }))
      setAvailableVoices(voiceList)
      
      // Set default voice (prefer English voices)
      const englishVoice = voices.find(voice => voice.lang.startsWith('en'))
      if (englishVoice && !selectedVoice) {
        setSelectedVoice(englishVoice.name)
      }
    }

    loadVoices()
    speechSynthesis.addEventListener('voiceschanged', loadVoices)

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }, [selectedVoice])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        speechSynthesis.cancel()
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  // Prepare content for speech (remove markdown formatting)
  const prepareContentForSpeech = (text: string): string => {
    return text
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
      .replace(/`(.*?)`/g, '$1') // Remove code formatting
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
      .replace(/^\s*[-*+]\s/gm, '') // Remove bullet points
      .replace(/^\s*\d+\.\s/gm, '') // Remove numbered lists
      .replace(/\n{2,}/g, '. ') // Replace multiple newlines with periods
      .replace(/\n/g, ' ') // Replace single newlines with spaces
      .trim()
  }

  const generateAudio = async () => {
    if (!content) {
      toast.error("No content available for audio generation")
      return
    }

    setIsGenerating(true)
    toast.info("Generating audio podcast... This may take a moment.")

    try {
      const cleanContent = prepareContentForSpeech(content)
      const voice = availableVoices.find(v => v.name === selectedVoice)
      
      if (!voice) {
        throw new Error("Selected voice not available")
      }

      // Create speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(cleanContent)
      const speechVoice = speechSynthesis.getVoices().find(v => v.name === selectedVoice)
      
      if (speechVoice) {
        utterance.voice = speechVoice
      }
      
      utterance.rate = playbackRate
      utterance.volume = volume
      utterance.pitch = 1

      utteranceRef.current = utterance

      // Set up event listeners
      utterance.onstart = () => {
        setIsPlaying(true)
        setIsPaused(false)
        toast.success("Audio podcast started!")
        
        // Start progress tracking
        intervalRef.current = setInterval(() => {
          setCurrentTime(prev => prev + 0.1)
        }, 100)
      }

      utterance.onend = () => {
        setIsPlaying(false)
        setIsPaused(false)
        setCurrentTime(0)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
        toast.success("Audio podcast completed!")
      }

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event)
        setIsPlaying(false)
        setIsPaused(false)
        toast.error("Error playing audio podcast")
      }

      // Estimate duration (rough calculation: ~150 words per minute)
      const wordCount = cleanContent.split(' ').length
      const estimatedDuration = (wordCount / 150) * 60 / playbackRate
      setDuration(estimatedDuration)

      // Start speech synthesis
      speechSynthesis.speak(utterance)

    } catch (error) {
      console.error('Error generating audio:', error)
      toast.error("Failed to generate audio podcast")
    } finally {
      setIsGenerating(false)
    }
  }

  const togglePlayPause = () => {
    if (!utteranceRef.current) {
      generateAudio()
      return
    }

    if (isPlaying && !isPaused) {
      speechSynthesis.pause()
      setIsPaused(true)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    } else if (isPaused) {
      speechSynthesis.resume()
      setIsPaused(false)
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 0.1)
      }, 100)
    } else {
      generateAudio()
    }
  }

  const stopAudio = () => {
    speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentTime(0)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    utteranceRef.current = null
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (!isMuted) {
      setVolume(0)
    } else {
      setVolume(0.8)
    }
  }

  const handleSpeedChange = (value: string) => {
    const speed = parseFloat(value)
    setPlaybackRate(speed)
    
    // If currently playing, restart with new speed
    if (isPlaying) {
      stopAudio()
      setTimeout(() => generateAudio(), 100)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const downloadAudio = () => {
    toast.info("Audio download feature coming soon! Currently using browser speech synthesis.")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-background">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Headphones className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Audio Podcast</h2>
                <p className="text-sm text-muted-foreground">Listen to your summary</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          {/* Title */}
          <div className="mb-4">
            <h3 className="font-medium text-sm text-muted-foreground mb-1">Now Playing</h3>
            <p className="font-semibold truncate">{title}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              className="w-full"
              disabled={!isPlaying && !isPaused}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
              disabled={!isPlaying && !isPaused}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              size="lg"
              onClick={togglePlayPause}
              disabled={isGenerating}
              className="w-12 h-12 rounded-full"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying && !isPaused ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={stopAudio}
              disabled={!isPlaying && !isPaused}
            >
              <Square className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
              disabled={!isPlaying && !isPaused}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume and Settings */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="flex-1"
              />
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <Select value={playbackRate.toString()} onValueChange={handleSpeedChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="0.75">0.75x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="1.25">1.25x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Voice Selection */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Voice</label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger>
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {availableVoices.map((voice) => (
                  <SelectItem key={voice.name} value={voice.name}>
                    <div className="flex items-center gap-2">
                      <Mic className="h-3 w-3" />
                      <span>{voice.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {voice.lang}
                      </Badge>
                      {voice.gender && (
                        <Badge variant="secondary" className="text-xs">
                          {voice.gender}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={downloadAudio}
              className="flex-1"
              disabled
            >
              <Download className="h-4 w-4 mr-2" />
              Download (Coming Soon)
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigator.share?.({
                  title: `Audio Podcast: ${title}`,
                  text: "Listen to this AI-generated podcast summary",
                  url: window.location.href
                }).catch(() => {
                  toast.info("Sharing not supported on this device")
                })
              }}
            >
              Share
            </Button>
          </div>

          {/* Info */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              🎧 <strong>Audio Podcast Feature:</strong> Converts your summary into spoken audio using browser text-to-speech. 
              Choose different voices, adjust speed, and listen to your content hands-free!
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
