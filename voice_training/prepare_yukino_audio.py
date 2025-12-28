"""
Prepare Yukino audio for GPT-SoVITS training
- Converts MP3 to WAV
- Slices into chunks
- Prepares for training
"""

import os
import sys
from pathlib import Path
import subprocess

def check_ffmpeg():
    """Check if ffmpeg is installed"""
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def convert_mp3_to_wav(mp3_path, wav_path):
    """Convert MP3 to WAV using ffmpeg"""
    if not check_ffmpeg():
        print("ERROR: ffmpeg not found!")
        print("Please install ffmpeg: https://ffmpeg.org/download.html")
        return False
    
    print(f"Converting {mp3_path} to WAV...")
    cmd = [
        'ffmpeg',
        '-i', str(mp3_path),
        '-ar', '44100',  # Sample rate
        '-ac', '1',      # Mono
        '-y',            # Overwrite
        str(wav_path)
    ]
    
    try:
        subprocess.run(cmd, check=True, capture_output=True)
        print(f"✓ Converted to: {wav_path}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"ERROR: Conversion failed: {e}")
        return False

def main():
    # Paths
    desktop = Path.home() / "Desktop"
    audio_file = desktop / "YUKINOSHITA - 1 hour.mp3"
    
    if not audio_file.exists():
        print(f"ERROR: Audio file not found: {audio_file}")
        print("Please ensure 'YUKINOSHITA - 1 hour.mp3' is on your Desktop")
        return
    
    # Create output directory
    script_dir = Path(__file__).parent
    output_dir = script_dir / "yukino_audio"
    output_dir.mkdir(exist_ok=True)
    
    # Convert to WAV
    wav_file = output_dir / "yukino_full.wav"
    if not convert_mp3_to_wav(audio_file, wav_file):
        return
    
    print("\n" + "="*60)
    print("Audio preparation complete!")
    print("="*60)
    print(f"\nOutput directory: {output_dir}")
    print(f"WAV file: {wav_file}")
    print("\nNext steps:")
    print("1. Use GPT-SoVITS WebUI to:")
    print("   - Load the WAV file")
    print("   - Slice into 5-15 second chunks")
    print("   - Run ASR (Automatic Speech Recognition)")
    print("   - Proofread transcriptions")
    print("   - Train the model")
    print("\n2. Or use audio-slicer tool:")
    print(f"   python audio_slicer.py --input_path \"{wav_file}\" --output_root \"{output_dir / 'sliced'}\" --threshold -34 --min_length 5000 --min_interval 300 --hop_size 10")
    print("\n3. Then train using GPT-SoVITS WebUI")

if __name__ == "__main__":
    main()

