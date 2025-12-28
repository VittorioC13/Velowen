# Modal TTS Deployment for Velowen Voice Chat

This directory contains the Modal deployment for GPT-SoVITS Text-to-Speech synthesis.

## Setup Instructions

### 1. Install Modal CLI

```bash
pip install modal
```

### 2. Authenticate with Modal

```bash
modal token new
```

### 3. Prepare Yukino Voice Model

Before deploying, you need to train the Yukino voice model using GPT-SoVITS:

1. **Clone GPT-SoVITS locally:**
   ```bash
   git clone https://github.com/RVC-Boss/GPT-SoVITS.git
   cd GPT-SoVITS
   ```

2. **Prepare your 1 hour of Yukino audio samples:**
   - Place clean audio files in a directory (e.g., `yukino_audio/`)
   - Each file should be clean (no background noise)
   - Use UVR5 (included in GPT-SoVITS) to remove background music/noise if needed

3. **Train the model:**
   - Run `go-webui.bat` (Windows) or `python webui.py` (Linux/Mac)
   - Follow GPT-SoVITS training workflow:
     - Upload audio files
     - Slice audio into chunks
     - Run ASR (Automatic Speech Recognition)
     - Proofread transcriptions
     - Fine-tune the model
   - Export the trained model files

4. **Upload model to Modal Volume:**
   ```bash
   modal volume create velowen-voice-models
   modal volume put velowen-voice-models yukino/ /path/to/trained/model/files/
   ```

### 4. Deploy Modal Function

```bash
cd modal_tts
modal deploy app.py
```

This will create a web endpoint URL like:
```
https://your-username--velowen-tts-synthesize-speech.modal.run
```

### 5. Set Environment Variable in Vercel

Add the Modal endpoint URL to your Vercel project:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - Key: `MODAL_TTS_ENDPOINT_URL`
   - Value: `https://your-username--velowen-tts-synthesize-speech.modal.run`

### 6. Set OpenAI API Key (for LLM)

Add OpenAI API key for character responses:

1. In Vercel Dashboard → Environment Variables
2. Add:
   - Key: `OPENAI_API_KEY`
   - Value: Your OpenAI API key

## Model Structure

The Modal volume should contain:

```
/models/
  yukino/
    ├── reference.wav          # Reference audio sample
    ├── prompt.txt             # Reference text
    ├── s1v3.ckpt              # SoVITS model checkpoint
    ├── s2Gv3.pth              # GPT model checkpoint
    └── ... (other GPT-SoVITS model files)
```

## API Usage

The deployed endpoint accepts POST requests:

```json
{
  "text": "こんにちは、ユキノです。",
  "character": "yukino",
  "language": "ja",
  "speed": 1.0
}
```

Returns:

```json
{
  "success": true,
  "audio_base64": "base64_encoded_wav_data",
  "format": "wav",
  "sample_rate": 24000
}
```

## Cost Estimation

- **Modal T4 GPU**: ~$0.10-0.30 per hour
- **Per request**: ~$0.001-0.005 (depending on text length)
- **OpenAI GPT-4o-mini**: ~$0.0001 per request

## Troubleshooting

### Model not found error
- Ensure model files are uploaded to Modal volume
- Check volume path: `/models/{character}/`

### Inference errors
- Check GPT-SoVITS version compatibility
- Verify model files are complete
- Check Modal logs: `modal app logs velowen-tts`

### High latency
- Consider using T4 GPU (already configured)
- Cache frequently used phrases
- Preload model in Modal function

## Next Steps

1. Train Yukino model locally
2. Upload model to Modal volume
3. Update `app.py` with actual GPT-SoVITS inference code
4. Deploy and test
5. Integrate with frontend (already done!)

