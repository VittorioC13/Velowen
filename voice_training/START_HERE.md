# 🎤 START HERE: Train Yukino Voice Model

## ✅ What's Ready

1. ✅ GPT-SoVITS cloned to `C:\Users\rotciv\Desktop\GPT-SoVITS`
2. ✅ Training scripts created
3. ✅ Modal TTS code updated with actual GPT-SoVITS API
4. ✅ Your audio file: `C:\Users\rotciv\Desktop\YUKINOSHITA - 1 hour.mp3`

## 🚀 Quick Start (3 Steps)

### Step 1: Install GPT-SoVITS Dependencies

```powershell
cd C:\Users\rotciv\Desktop\GPT-SoVITS
pip install -r requirements.txt
```

**Time:** 10-20 minutes  
**Note:** Some packages may fail - that's OK, GPT-SoVITS will install them on first run.

### Step 2: Start Training WebUI

```powershell
cd C:\Users\rotciv\Desktop\GPT-SoVITS
python webui.py
```

Or use the batch file:
```powershell
go-webui.bat
```

This will open a browser window at `http://localhost:9874`

### Step 3: Train Yukino Model

In the WebUI:

1. **Upload Audio**
   - Go to Tab 1: "1-GPT-SoVITS-TTS"
   - Upload: `C:\Users\rotciv\Desktop\YUKINOSHITA - 1 hour.mp3`
   - Click "Slice Audio" (splits into 5-15 second chunks)

2. **Clean Audio (Optional)**
   - Click "Denoise" to remove background noise
   - Use UVR5 if needed (included in GPT-SoVITS)

3. **Transcribe (ASR)**
   - Go to Tab 2: "2-ASR"
   - Select language: **Japanese (ja)**
   - Click "Run ASR"
   - **CRITICAL:** Proofread ALL transcriptions!
   - Fix any errors in the text files

4. **Train Model**
   - Go to Tab 3: "3-Finetune"
   - Set parameters:
     - Batch size: 4-8 (depending on GPU)
     - Epochs: 20-30 (more = better quality)
     - Learning rate: 0.0001
   - Click "Start Training"
   - Wait 2-4 hours (with GPU) or 20-40 hours (CPU)

5. **Export Model**
   - After training completes
   - Export model files
   - Save to: `yukino_model/` folder
   - You need:
     - GPT model: `s2Gv3.pth` or `s2Gv2Pro.pth`
     - SoVITS model: `s1v3.ckpt` or `s2v4.pth`
     - Reference audio: `reference.wav` (5-15 seconds)
     - Reference text: `prompt.txt` (transcription of reference audio)

## 📁 Expected Model Structure

After training, your `yukino_model/` folder should contain:

```
yukino_model/
├── s2Gv3.pth              # GPT model (or s2Gv2Pro.pth)
├── s1v3.ckpt               # SoVITS model (or s2v4.pth)
├── reference.wav           # Reference audio sample
└── prompt.txt              # Reference text transcription
```

## 🚀 Next: Deploy to Modal

Once training is complete:

1. **Upload to Modal:**
   ```powershell
   cd C:\Users\rotciv\Desktop\Velowen\voice_training
   DEPLOY_TO_MODAL.bat
   ```

2. **Deploy Modal Function:**
   ```powershell
   cd C:\Users\rotciv\Desktop\Velowen\modal_tts
   modal deploy app.py
   ```

3. **Get Endpoint URL:**
   - Modal will output: `https://your-username--velowen-tts-synthesize-speech.modal.run`
   - Copy this URL

4. **Configure Vercel:**
   - Go to Vercel Dashboard → Your Project → Environment Variables
   - Add: `MODAL_TTS_ENDPOINT_URL` = your Modal endpoint URL
   - Add: `OPENAI_API_KEY` = your OpenAI API key

5. **Test:**
   - Go to your Velowen site
   - View a 3D scene
   - Voice chat should appear at bottom
   - Talk to Yukino! 🎤

## ⏱️ Time Estimates

- **Setup:** 20-30 minutes
- **Training (GPU):** 2-4 hours
- **Training (CPU):** 20-40 hours (not recommended)
- **Deployment:** 10-15 minutes

## 🆘 Troubleshooting

### "CUDA out of memory"
- Reduce batch size to 2-4
- Use smaller model version (v2 instead of v4)

### "ASR failed"
- Check audio quality
- Try different ASR model
- Manually transcribe if needed

### "Training loss not decreasing"
- Check transcriptions are correct
- Reduce learning rate
- Check audio quality

### "Modal deployment failed"
- Check model files are uploaded correctly
- Verify file paths in Modal volume
- Check Modal logs: `modal app logs velowen-tts`

## 📚 More Help

- **Detailed Guide:** See `README.md`
- **Quick Reference:** See `QUICK_START.md`
- **Modal Deployment:** See `../modal_tts/README.md`

## 🎯 Current Status

- ✅ GPT-SoVITS cloned
- ✅ Training scripts ready
- ✅ Modal code updated
- ⏳ **NEXT:** Install dependencies and start training!

---

**Ready?** Run `TRAIN_YUKINO.bat` to get started!

