# Fix: NumPy Installation Requires C Compiler

## Problem
NumPy is trying to build from source but needs a C compiler (Visual Studio Build Tools).

## Solution Options

### Option 1: Install Pre-built NumPy (Easiest) ✅

```powershell
cd C:\Users\rotciv\Desktop\GPT-SoVITS
pip install numpy --only-binary :all:
```

This installs a pre-built wheel instead of building from source.

### Option 2: Install Visual Studio Build Tools (If Option 1 Fails)

1. **Download Visual Studio Build Tools:**
   - Go to: https://visualstudio.microsoft.com/downloads/
   - Download "Build Tools for Visual Studio 2022"

2. **Install:**
   - Run installer
   - Select "Desktop development with C++"
   - Install

3. **Restart terminal and try again:**
   ```powershell
   pip install -r requirements.txt
   ```

### Option 3: Use Conda (Alternative)

```powershell
# Install Miniconda first
# Then:
conda create -n gpt-sovits python=3.10
conda activate gpt-sovits
conda install numpy scipy librosa
pip install -r requirements.txt
```

## Quick Fix Script

Run `FIX_INSTALL.bat` which will:
1. Install numpy from pre-built wheels
2. Install ffmpeg-python
3. Install other critical dependencies
4. Install remaining packages

