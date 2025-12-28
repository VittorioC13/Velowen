# Quick Start: Train Yukino Voice Model

## Prerequisites Check

1. **Python 3.8+** ✅ (You have 3.13.11)
2. **ffmpeg** - Need to install
3. **Git** ✅ (Already installed)
4. **CUDA GPU** (Recommended, but CPU works too)

## Step-by-Step Setup

### 1. Install ffmpeg

**Option A: Using Chocolatey (if installed)**
```powershell
choco install ffmpeg
```

**Option B: Manual Installation**
1. Download from: https://www.gyan.dev/ffmpeg/builds/
2. Extract to `C:\ffmpeg`
3. Add to PATH:
   - System Properties → Environment Variables
   - Add `C:\ffmpeg\bin` to Path

**Option C: Use GPT-SoVITS built-in tools**
- GPT-SoVITS includes audio processing tools
- May not need separate ffmpeg installation

### 2. Clone GPT-SoVITS

```powershell
cd C:\Users\rotciv\Desktop
git clone https://github.com/RVC-Boss/GPT-SoVITS.git
cd GPT-SoVITS
```

### 3. Install Dependencies

```powershell
pip install -r requirements.txt
```

**Note:** This may take 10-20 minutes and install many packages.

### 4. Prepare Audio

Your audio file: `C:\Users\rotciv\Desktop\YUKINOSHITA - 1 hour.mp3`

**Option A: Use GPT-SoVITS WebUI (Easiest)**
1. Start WebUI: `python webui.py` or `go-webui.bat`
2. Upload MP3 directly (it will convert automatically)
3. Follow training workflow

**Option B: Convert manually**
```powershell
# If ffmpeg is installed
ffmpeg -i "C:\Users\rotciv\Desktop\YUKINOSHITA - 1 hour.mp3" -ar 44100 -ac 1 yukino.wav
```

### 5. Start Training

```powershell
cd GPT-SoVITS
python webui.py
```

Then in the browser:
1. **Upload Audio** → Upload your MP3/WAV file
2. **Slice Audio** → Split into chunks (5-15 seconds)
3. **Denoise** (Optional) → Remove background noise
4. **ASR** → Run Japanese speech recognition
5. **Proofread** → **CRITICAL:** Fix all transcriptions!
6. **Train** → Start training (20-30 epochs recommended)

### 6. Export Model

After training completes:
- Export model files
- Save to: `yukino_model/` folder
- You need:
  - SoVITS checkpoint (`.ckpt` or `.pth`)
  - GPT checkpoint (`.pth`)
  - Reference audio (`reference.wav`)
  - Reference text (`prompt.txt`)

## Training Time Estimate

- **With GPU (RTX 3060+):** 2-4 hours
- **With CPU:** 20-40 hours (not recommended)

## Next: Deploy to Modal

Once training is done, see `../modal_tts/README.md` for deployment instructions.

