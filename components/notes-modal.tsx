"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Loader2, PlusIcon, Sparkles, Save, FileText } from "lucide-react"
import { toast } from "sonner"

interface NotesModalProps {
  isOpen: boolean
  onClose: () => void
  videoTitle: string
  videoUrl: string
  onNoteSaved: (note: string, analysis?: string) => void
}

export function NotesModal({ isOpen, onClose, videoTitle, videoUrl, onNoteSaved }: NotesModalProps) {
  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [analysis, setAnalysis] = useState("")

  const handleSaveNote = async () => {
    if (!noteContent.trim()) {
      toast.error("Please enter some note content")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note: `${noteTitle ? `**${noteTitle}**\n\n` : ''}${noteContent}`,
          videoUrl: videoUrl,
          videoTitle: videoTitle,
          type: 'save'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save note')
      }

      const data = await response.json()
      
      toast.success("Note saved successfully!")
      onNoteSaved(data.note, analysis)
      
      // Reset form
      setNoteTitle("")
      setNoteContent("")
      setAnalysis("")
      onClose()
    } catch (error) {
      console.error('Error saving note:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save note')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAnalyzeNote = async () => {
    if (!noteContent.trim()) {
      toast.error("Please enter some note content to analyze")
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note: `${noteTitle ? `**${noteTitle}**\n\n` : ''}${noteContent}`,
          videoUrl: videoUrl,
          videoTitle: videoTitle,
          type: 'analyze'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze note')
      }

      const data = await response.json()
      setAnalysis(data.analysis)
      toast.success("Note analysis completed!")
    } catch (error) {
      console.error('Error analyzing note:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to analyze note')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSaveWithAnalysis = async () => {
    await handleAnalyzeNote()
    // The analysis will be set, then we save
    setTimeout(() => {
      handleSaveNote()
    }, 500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Add Note
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Video Info */}
          <Card className="p-4 bg-muted/50">
            <h3 className="font-medium mb-2">Adding note for:</h3>
            <p className="text-sm text-muted-foreground truncate">{videoTitle}</p>
            <Badge variant="secondary" className="mt-2">YouTube Video</Badge>
          </Card>

          {/* Note Form */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Note Title (Optional)</label>
              <Input
                placeholder="e.g., Key Insights, Important Points, Questions..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Note Content</label>
              <Textarea
                placeholder="Write your notes about this video here... 

You can include:
• Key points and insights
• Important timestamps
• Questions for further research
• Personal thoughts and reflections
• Action items or next steps"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={8}
                className="resize-none"
              />
            </div>
          </div>

          {/* AI Analysis Section */}
          {analysis && (
            <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                AI Analysis
              </h3>
              <div className="prose prose-sm max-w-none text-sm whitespace-pre-line">
                {analysis}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving || isAnalyzing}
            >
              Cancel
            </Button>
            
            <Button
              variant="outline"
              onClick={handleAnalyzeNote}
              disabled={!noteContent.trim() || isAnalyzing || isSaving}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>

            <Button
              onClick={handleSaveNote}
              disabled={!noteContent.trim() || isSaving || isAnalyzing}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Note
                </>
              )}
            </Button>

            <Button
              variant="default"
              onClick={handleSaveWithAnalysis}
              disabled={!noteContent.trim() || isSaving || isAnalyzing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isAnalyzing || isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze & Save
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
