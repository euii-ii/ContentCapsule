"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Loader2, History, FileText, MessageCircle, StickyNote, Trash2, Eye, Calendar, Clock, Headphones } from "lucide-react"
import { AudioPodcast } from "@/components/audio-podcast"
import { toast } from "sonner"

interface HistoryItem {
  _id: string
  videoTitle: string
  videoUrl: string
  contentType: 'study-guide' | 'briefing-doc' | 'note' | 'chat'
  content: string
  analysis?: string
  channelName?: string
  videoDuration?: string
  videoViews?: string
  videoThumbnail?: string
  createdAt: string
  metadata?: {
    transcriptLength?: number
    apiUsed?: string
    processingTime?: number
  }
}

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

const contentTypeIcons = {
  'study-guide': FileText,
  'briefing-doc': FileText,
  'note': StickyNote,
  'chat': MessageCircle
}

const contentTypeLabels = {
  'study-guide': 'Study Guide',
  'briefing-doc': 'Briefing Doc',
  'note': 'Note',
  'chat': 'Chat'
}

const contentTypeColors = {
  'study-guide': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'briefing-doc': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'note': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'chat': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
}

export function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [isAudioPodcastOpen, setIsAudioPodcastOpen] = useState(false)

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('type', filter)
      
      const response = await fetch(`/api/history?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch history')
      }
      
      const data = await response.json()
      setHistory(data.data || [])
    } catch (error) {
      console.error('Error fetching history:', error)
      toast.error('Failed to load history')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteHistoryItem = async (id: string) => {
    try {
      const response = await fetch(`/api/history?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete item')
      }
      
      setHistory(prev => prev.filter(item => item._id !== id))
      toast.success('Item deleted successfully')
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchHistory()
    }
  }, [isOpen, filter])

  const filteredHistory = history.filter(item => 
    filter === 'all' || item.contentType === filter
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Summary History
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* Sidebar with filters and list */}
          <div className="w-1/3 flex flex-col">
            {/* Filters */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <Button
                size="sm"
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              {Object.entries(contentTypeLabels).map(([type, label]) => (
                <Button
                  key={type}
                  size="sm"
                  variant={filter === type ? 'default' : 'outline'}
                  onClick={() => setFilter(type)}
                >
                  {label}
                </Button>
              ))}
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No history found</p>
                  <p className="text-sm">Start creating summaries to see them here!</p>
                </div>
              ) : (
                filteredHistory.map((item) => {
                  const Icon = contentTypeIcons[item.contentType]
                  return (
                    <Card
                      key={item._id}
                      className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedItem?._id === item._id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-4 w-4 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{item.videoTitle}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs ${contentTypeColors[item.contentType]}`}>
                              {contentTypeLabels[item.contentType]}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {item.channelName && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {item.channelName}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })
              )}
            </div>
          </div>

          {/* Content Viewer */}
          <div className="flex-1 flex flex-col">
            {selectedItem ? (
              <>
                <div className="border-b pb-4 mb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{selectedItem.videoTitle}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Badge className={contentTypeColors[selectedItem.contentType]}>
                          {contentTypeLabels[selectedItem.contentType]}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(selectedItem.createdAt).toLocaleString()}
                        </span>
                        {selectedItem.metadata?.processingTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {(selectedItem.metadata.processingTime / 1000).toFixed(1)}s
                          </span>
                        )}
                      </div>
                      {selectedItem.channelName && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Channel: {selectedItem.channelName}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsAudioPodcastOpen(true)}
                        title="Listen to this content as an audio podcast"
                      >
                        <Headphones className="h-4 w-4 mr-1" />
                        Audio
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(selectedItem.videoUrl, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Video
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteHistoryItem(selectedItem._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-line">{selectedItem.content}</div>
                    {selectedItem.analysis && (
                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <h4 className="font-medium mb-2">AI Analysis</h4>
                        <div className="whitespace-pre-line">{selectedItem.analysis}</div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select an item to view its content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {selectedItem && (
        <AudioPodcast
          content={selectedItem.content}
          title={`${contentTypeLabels[selectedItem.contentType]} - ${selectedItem.videoTitle}`}
          isOpen={isAudioPodcastOpen}
          onClose={() => setIsAudioPodcastOpen(false)}
        />
      )}
    </Dialog>
  )
}
