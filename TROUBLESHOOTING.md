# YouTube Summary AI - Troubleshooting Guide

## 🔧 Common Issues and Solutions

### Issue 1: "Add note", "Study guide", or "Briefing doc" buttons not working

**Symptoms:**
- Buttons appear disabled/grayed out
- No response when clicking buttons
- Error message: "Please select a YouTube video first"

**Solutions:**
1. **Select a video first**: Click on a video in the sources list (left sidebar) to select it
2. **Check video selection**: Look for the "Selected Video" card in the Studio panel
3. **Verify video URL**: Ensure the video URL is a valid YouTube link

### Issue 2: AI not responding or generating content

**Symptoms:**
- Loading spinner appears but never completes
- Error messages about API failures
- "Failed to process video" errors

**Solutions:**
1. **Test Gemini AI**: Click "Test Gemini AI" button to verify API connectivity
2. **Check API key**: Ensure GEMINI_API_KEY is properly set in .env.local
3. **Test transcript**: Use "Test Transcript" button to verify video has captions
4. **Try different video**: Some videos don't have transcripts available

### Issue 3: YouTube video not recognized properly

**Symptoms:**
- "Invalid YouTube URL" error
- Video appears as "YouTube Video (undefined)"
- Transcript test fails

**Solutions:**
1. **Use standard YouTube URLs**: 
   - ✅ `https://www.youtube.com/watch?v=VIDEO_ID`
   - ✅ `https://youtu.be/VIDEO_ID`
   - ❌ Playlist URLs or channel URLs
2. **Check video accessibility**: Ensure video is public and not restricted
3. **Verify captions**: Video must have captions/subtitles (auto-generated or manual)

### Issue 4: Transcript extraction fails

**Symptoms:**
- "Could not fetch video transcript" error
- "Video transcript is empty" error
- Transcript test shows 0 segments

**Common Causes & Solutions:**
1. **No captions available**: Choose videos with captions enabled
2. **Private/restricted video**: Use public videos only
3. **Age-restricted content**: May not have accessible transcripts
4. **Very new videos**: Captions might not be processed yet

### Issue 5: Generated content is poor quality

**Symptoms:**
- Very short or incomplete responses
- Generic content not related to video
- Formatting issues

**Solutions:**
1. **Use longer videos**: Videos under 2 minutes may not have enough content
2. **Choose educational content**: Tutorials, lectures, and presentations work best
3. **Verify transcript quality**: Use "Test Transcript" to check transcript length
4. **Try different video**: Some videos have poor auto-generated captions

## 🧪 Testing Steps

### Step 1: Test Gemini AI Connection
```
1. Go to Studio panel → System Test card
2. Click "Test Gemini AI"
3. Should see: "Gemini AI is working!" toast message
```

### Step 2: Test YouTube Transcript
```
1. Add a YouTube video
2. Select the video in sources list
3. Click "Test Transcript" in System Test card
4. Should see: "Transcript found! X segments, Y characters"
```

### Step 3: Test Full Workflow
```
1. Add video: https://www.youtube.com/watch?v=dQw4w9WgXcQ
2. Select the video
3. Click "Study guide"
4. Wait 10-30 seconds
5. Content should appear in modal
```

## 🔍 Debug Information

### Check Browser Console
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for error messages when clicking buttons

### Check Network Tab
1. Open Developer Tools → Network tab
2. Click "Study guide" or "Briefing doc"
3. Look for API calls to `/api/youtube`
4. Check response status and error messages

### Server Logs
Check the terminal running `npm run dev` for:
- API request logs
- Error messages
- Transcript fetching status

## 📋 Recommended Test Videos

These videos are known to work well:

1. **TED Talks**: Usually have excellent captions
   - Example: `https://www.youtube.com/watch?v=UyyjU8fzEYU`

2. **Educational Channels**: Khan Academy, Crash Course, etc.
   - Example: `https://www.youtube.com/watch?v=kYIS7GEQ0lg`

3. **Conference Presentations**: Tech talks, academic presentations
   - Example: `https://www.youtube.com/watch?v=8pDqJVdNa44`

## ⚠️ Videos That Won't Work

- Music videos without speech
- Videos without captions
- Private or unlisted videos
- Age-restricted content
- Live streams (while live)
- Very short videos (< 1 minute)

## 🆘 Still Having Issues?

1. **Restart the application**: Stop and restart `npm run dev`
2. **Clear browser cache**: Hard refresh (Ctrl+F5)
3. **Check environment variables**: Verify .env.local file exists and has correct API key
4. **Try incognito mode**: Rule out browser extension conflicts
5. **Use different video**: Test with a known working video from the list above
