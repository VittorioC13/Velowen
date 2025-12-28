# Yukino Voice Training Guide

## Quick Start

### Step 1: Setup GPT-SoVITS

```bash
# Run the setup script
setup_gpt_sovits.bat

# Or manually:
cd ..
git clone https://github.com/RVC-Boss/GPT-SoVITS.git
cd GPT-SoVITS
pip install -r requirements.txt
```

### Step 2: Prepare Audio

```bash
# Convert MP3 to WAV and prepare
python prepare_yukino_audio.py
```

This will:
- Convert `YUKINOSHITA - 1 hour.mp3` to WAV format
- Create `yukino_audio/` directory
- Output `yukino_full.wav`

### Step 3: Train Model

#### Option A: Using WebUI (Recommended)

1. **Start GPT-SoVITS WebUI:**
   ```bash
   cd GPT-SoVITS
   python webui.py
   # Or on Windows: go-webui.bat
   ```

2. **Follow the training workflow:**
   - **Tab 1: Audio Processing**
     - Upload `yukino_full.wav`
     - Click "Slice Audio" (splits into chunks)
     - Click "Denoise" (optional, removes background noise)
   
   - **Tab 2: ASR (Automatic Speech Recognition)**
     - Select language: Japanese (ja)
     - Run ASR to generate transcriptions
     - **IMPORTANT:** Proofread all transcriptions!
     - Save transcriptions
   
   - **Tab 3: Training**
     - Set training parameters:
       - Batch size: 4-8 (depending on GPU)
       - Epochs: 20-30 (more is better)
       - Learning rate: 0.0001
     - Click "Start Training"
     - Wait for training to complete (may take hours)

3. **Export Model:**
   - After training, export model files
   - Save to: `yukino_model/` directory
   - You'll need:
     - `s1v3.ckpt` or `s2v4.pth` (SoVITS model)
     - `s2Gv3.pth` or `s2Gv2Pro.pth` (GPT model)
     - Reference audio: `reference.wav`
     - Reference text: `prompt.txt`

#### Option B: Using Command Line

```bash
# Slice audio
python audio_slicer.py \
    --input_path "yukino_audio/yukino_full.wav" \
    --output_root "yukino_audio/sliced" \
    --threshold -34 \
    --min_length 5000 \
    --min_interval 300 \
    --hop_size 10

# Run ASR (Japanese)
python tools/asr/fasterwhisper_asr.py \
    -i "yukino_audio/sliced" \
    -o "yukino_audio/transcriptions" \
    -l ja \
    -p float16

# Then use WebUI for training (easier)
```

### Step 4: Upload to Modal

Once training is complete:

```bash
# Install Modal CLI
pip install modal

# Authenticate
modal token new

# Create volume
modal volume create velowen-voice-models

# Upload model
modal volume put velowen-voice-models yukino/ yukino_model/
```

### Step 5: Deploy Modal TTS

```bash
cd ../modal_tts
# Update app.py with actual GPT-SoVITS inference code
modal deploy app.py
```

## Training Tips

1. **Audio Quality:**
   - Use clean audio (no background music/noise)
   - Use UVR5 (included in GPT-SoVITS) to remove background
   - Ensure consistent volume levels

2. **Slicing:**
   - Optimal chunk length: 5-15 seconds
   - Avoid cutting mid-sentence
   - Remove silence at start/end

3. **Transcriptions:**
   - **CRITICAL:** Proofread all ASR transcriptions!
   - Use proper Japanese punctuation
   - Match exact pronunciation

4. **Training:**
   - More epochs = better quality (but slower)
   - Monitor loss - should decrease steadily
   - Save checkpoints regularly

5. **Model Version:**
   - V2Pro: Best balance of quality/speed
   - V4: Better quality, slower
   - V3: Good quality, some artifacts

## Expected Training Time

- **GPU:** NVIDIA GPU (RTX 3060+)
  - 1 hour audio: ~2-4 hours training
- **CPU:** Much slower, not recommended
  - 1 hour audio: ~20-40 hours training

## Troubleshooting

### "CUDA out of memory"
- Reduce batch size
- Use smaller model version
- Train on CPU (slow)

### "ASR failed"
- Check audio quality
- Try different ASR model
- Manually transcribe if needed

### "Training loss not decreasing"
- Check transcriptions are correct
- Reduce learning rate
- Check audio quality

## Next Steps After Training

1. Test model locally using GPT-SoVITS inference
2. Upload to Modal volume
3. Update `modal_tts/app.py` with inference code
4. Deploy and test
5. Configure Vercel environment variables

