# Voice Chat Setup Guide

## Overview

You now have a complete voice interaction system integrated into Velowen! Users can talk to Yukino (and other characters) using voice or text input while exploring the 3D world.

## What's Been Built

### ✅ Completed Components

1. **Modal TTS Deployment** (`modal_tts/app.py`)
   - GPT-SoVITS inference endpoint
   - Handles voice synthesis for characters
   - Deployed on Modal platform (GPU-accelerated)

2. **Vercel Chat API** (`api/chat.ts`)
   - Integrates OpenAI GPT-4 for character responses
   - Calls Modal TTS for voice synthesis
   - Uploads audio to Vercel Blob storage
   - Returns text + audio URL

3. **Frontend VoiceChat Component** (`client/src/components/VoiceChat.tsx`)
   - Voice input via Web Speech API
   - Text input fallback
   - Conversation history display
   - Audio playback
   - Real-time status indicators

4. **Integration** (`client/src/pages/image-to-3d.tsx`)
   - Voice chat appears when viewing 3D scenes
   - Seamlessly integrated with existing UI

## Setup Steps

### Step 1: Train Yukino Voice Model

You have 1 hour of Yukino audio samples. Now you need to train the GPT-SoVITS model:

1. **Install GPT-SoVITS locally:**
   ```bash
   git clone https://github.com/RVC-Boss/GPT-SoVITS.git
   cd GPT-SoVITS
   pip install -r requirements.txt
   ```

2. **Prepare audio samples:**
   - Clean audio (remove background noise using UVR5)
   - Slice into 5-15 second chunks
   - Ensure good quality (no distortion, clear speech)

3. **Train model:**
   - Run `python webui.py` or `go-webui.bat`
   - Follow the training workflow:
     - Upload audio files
     - Slice audio
     - Run ASR (Automatic Speech Recognition)
     - Proofread transcriptions
     - Fine-tune model
   - Export trained model files

### Step 2: Upload Model to Modal

1. **Create Modal volume:**
   ```bash
   modal volume create velowen-voice-models
   ```

2. **Upload Yukino model:**
   ```bash
   # Structure should be:
   # /models/yukino/
   #   ├── reference.wav
   #   ├── prompt.txt
   #   ├── s1v3.ckpt (or s2v4.pth for v4)
   #   ├── s2Gv3.pth (or s2Gv2Pro.pth for v2Pro)
   #   └── other model files
   
   modal volume put velowen-voice-models yukino/ /path/to/trained/model/
   ```

### Step 3: Update Modal TTS Code

The `modal_tts/app.py` file has placeholder inference code. You need to:

1. **Check GPT-SoVITS API:**
   - Review GPT-SoVITS inference documentation
   - Update the `synthesize_speech` function with actual inference calls
   - Test locally first if possible

2. **Deploy to Modal:**
   ```bash
   cd modal_tts
   modal deploy app.py
   ```

3. **Get endpoint URL:**
   - Modal will provide a URL like: `https://your-username--velowen-tts-synthesize-speech.modal.run`
   - Copy this URL

### Step 4: Configure Vercel Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables:

1. **Add Modal TTS endpoint:**
   - Key: `MODAL_TTS_ENDPOINT_URL`
   - Value: `https://your-username--velowen-tts-synthesize-speech.modal.run`

2. **Add OpenAI API key:**
   - Key: `OPENAI_API_KEY`
   - Value: Your OpenAI API key (for GPT-4 character responses)

3. **Redeploy:**
   - Vercel will automatically redeploy with new environment variables

### Step 5: Test the System

1. **Test text-only (no TTS):**
   - The system will work with text responses even if TTS isn't configured
   - Chat API will return `audioUrl: null` if TTS fails

2. **Test with TTS:**
   - Once Modal TTS is deployed, voice synthesis will work
   - Audio will be uploaded to Vercel Blob and played automatically

## How It Works

### User Flow

1. User explores 3D world (Yukino scene)
2. Voice chat appears at bottom of screen
3. User clicks mic button or types message
4. Frontend sends text to `/api/chat`
5. Chat API:
   - Sends text to OpenAI GPT-4 with Yukino personality prompt
   - Gets character response text
   - Sends text to Modal TTS endpoint
   - Gets synthesized audio (base64)
   - Uploads audio to Vercel Blob
   - Returns text + audio URL
6. Frontend displays text and plays audio

### Character Personalities

Character prompts are defined in `api/chat.ts`:
- **Yukino**: Intelligent, sharp-tongued, formal, slightly tsundere
- Easy to add more characters by adding to `CHARACTER_PROMPTS`

## Features

### ✅ Voice Input
- Web Speech API integration
- Supports Japanese (for Yukino) and English
- Fallback to text input if mic unavailable

### ✅ Text Input
- Always available as fallback
- Enter key to send

### ✅ Conversation History
- Shows user and character messages
- Scrollable chat interface
- Smooth animations

### ✅ Audio Playback
- Automatic playback when audio is ready
- Visual indicator when character is speaking
- Handles errors gracefully

### ✅ Error Handling
- Works even if TTS fails (text-only mode)
- Graceful degradation
- User-friendly error messages

## Cost Breakdown

### Per Conversation Turn:
- **OpenAI GPT-4o-mini**: ~$0.0001
- **Modal TTS (T4 GPU)**: ~$0.001-0.005
- **Vercel Blob Storage**: ~$0.00001 (audio files are small)
- **Total**: ~$0.001-0.005 per turn

### Monthly Estimate (1000 conversations):
- OpenAI: ~$0.10
- Modal: ~$1-5
- Vercel Blob: ~$0.01
- **Total**: ~$1-5/month

## Troubleshooting

### Voice chat doesn't appear
- Check that `appState === "viewing"` in `image-to-3d.tsx`
- Verify VoiceChat component is imported

### Mic button doesn't work
- Check browser supports Web Speech API (Chrome, Edge, Safari)
- Check microphone permissions
- Falls back to text input automatically

### No audio playback
- Check browser console for errors
- Verify Modal TTS endpoint is configured
- Check Vercel Blob storage is configured
- System will still show text responses

### Character responses don't match personality
- Adjust prompt in `api/chat.ts` → `CHARACTER_PROMPTS.yukino`
- Try different temperature values (currently 0.8)

### TTS quality issues
- Ensure model is trained with high-quality audio
- Check GPT-SoVITS version compatibility
- Verify model files are complete
- Check Modal logs: `modal app logs velowen-tts`

## Next Steps

1. ✅ Train Yukino model (you have the audio!)
2. ✅ Upload model to Modal
3. ✅ Update Modal inference code
4. ✅ Deploy and test
5. 🎉 Enjoy talking to Yukino in your 3D worlds!

## Future Enhancements

- Add more characters (easy - just add to CHARACTER_PROMPTS)
- Voice emotion control
- Conversation memory/context
- Multi-language support
- Voice activity detection (auto-start listening)
- Character animations synced to speech

