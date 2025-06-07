# YouTube Summary AI - Usage Guide

## 🚀 Quick Start

### Step 1: Add a YouTube Video
1. Click the **"Add"** button in the left sidebar
2. In the modal that opens, scroll down to the "Add YouTube Video" section
3. Paste a YouTube URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
4. Click **"Add Source"**

### Step 1.5: Test the System (Recommended)
Before generating content, test that everything is working:
1. Click **"Test Gemini AI"** in the System Test card to verify AI connectivity
2. Select your video and click **"Test Transcript"** to ensure the video has captions

### Step 2: Select the Video
- The newly added video will appear in the sources list on the left
- Click on the video to select it (it will be highlighted)
- You'll see a "Selected Video" card appear in the Studio panel on the right

### Step 3: Generate AI Content
In the Studio panel (right sidebar), you'll see two buttons:

#### 📚 Study Guide
- Click **"Study guide"** to generate comprehensive study materials
- Includes: Main topics, key concepts, definitions, study questions, and summary points

#### 📋 Briefing Doc
- Click **"Briefing doc"** to generate a professional briefing document
- Includes: Executive summary, key insights, recommendations, and next steps

### Step 4: View and Use Generated Content
- Content opens in a modal viewer with professional formatting
- **Copy**: Click the copy button to copy content to clipboard
- **Download**: Click download to save as a Markdown (.md) file
- **Close**: Click X or outside the modal to close

## 💡 Tips for Best Results

### Choose Videos With Captions
- The AI needs video transcripts to work
- Most popular YouTube videos have auto-generated or manual captions
- Educational content, tutorials, and presentations work best

### Video Types That Work Well
- ✅ Educational tutorials
- ✅ Conference talks and presentations
- ✅ Documentaries
- ✅ Lectures and courses
- ✅ Product demos
- ✅ News reports and interviews

### Video Types That May Not Work
- ❌ Music videos without speech
- ❌ Videos without captions/subtitles
- ❌ Private or restricted videos
- ❌ Very short videos (under 1 minute)

## 🔧 Troubleshooting

### "Could not fetch video transcript" Error
- **Cause**: Video doesn't have captions or is not publicly accessible
- **Solution**: Try a different video with captions enabled

### "Please select a YouTube video first" Message
- **Cause**: No video is selected in the sources list
- **Solution**: Click on a video in the left sidebar to select it

### Buttons Are Disabled
- **Cause**: Either no video is selected or AI is currently generating content
- **Solution**: Select a video and wait for any current generation to complete

### API Errors
- **Cause**: Network issues or API rate limits
- **Solution**: Wait a moment and try again

## 📝 Example Workflow

1. **Add Video**: `https://www.youtube.com/watch?v=example`
2. **Select**: Click on the video in the sources list
3. **Generate**: Click "Study guide" in the Studio panel
4. **Wait**: Loading spinner shows AI is working (usually 10-30 seconds)
5. **Review**: Content opens in a modal viewer
6. **Export**: Copy or download the generated content
7. **Repeat**: Generate briefing doc for the same video or add more videos

## 🎯 Use Cases

### For Students
- Create study guides from lecture videos
- Generate summaries of educational content
- Extract key concepts from tutorials

### For Professionals
- Create briefing docs from conference talks
- Summarize training videos
- Extract insights from industry presentations

### For Researchers
- Analyze interview content
- Summarize documentary footage
- Extract key points from research presentations

## 🔒 Privacy & Security

- Video URLs are processed server-side only
- No video content is stored permanently
- Generated content is only stored in your browser session
- API calls are made securely through the application backend
