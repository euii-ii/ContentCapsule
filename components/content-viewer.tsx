"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Download, X, Headphones } from "lucide-react"
import { GeneratedContent } from "@/hooks/use-youtube-ai"
import { AudioPodcast } from "@/components/audio-podcast"

interface ContentViewerProps {
  content: GeneratedContent | null
  isOpen: boolean
  onClose: () => void
}

export function ContentViewer({ content, isOpen, onClose }: ContentViewerProps) {
  const [copied, setCopied] = useState(false)
  const [isAudioPodcastOpen, setIsAudioPodcastOpen] = useState(false)

  const handleCopy = async () => {
    if (content?.content) {
      await navigator.clipboard.writeText(content.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    if (content?.content) {
      const blob = new Blob([content.content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${content.type}-${content.videoId}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  if (!content) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="capitalize">
              {content.type.replace('-', ' ')}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAudioPodcastOpen(true)}
                className="flex items-center gap-2"
              >
                <Headphones className="h-4 w-4" />
                Audio Podcast
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] w-full">
          <div className="prose prose-sm max-w-none p-4 bg-muted/30 rounded-lg">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {content.content}
            </pre>
          </div>
        </ScrollArea>
      </DialogContent>

      <AudioPodcast
        content={content.content}
        title={`${content.type.replace('-', ' ')} - ${content.videoId}`}
        isOpen={isAudioPodcastOpen}
        onClose={() => setIsAudioPodcastOpen(false)}
      />
    </Dialog>
  )
}
