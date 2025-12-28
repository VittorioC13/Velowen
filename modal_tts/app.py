"""
Modal deployment for GPT-SoVITS Text-to-Speech
Handles voice synthesis for anime characters (Yukino, etc.)
"""

import modal
import os
import base64
import tempfile
from pathlib import Path
import soundfile as sf

# Create Modal app
app = modal.App("velowen-tts")

# Define the image with GPT-SoVITS dependencies
image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install("git", "ffmpeg", "libsndfile1")
    .pip_install([
        "torch>=2.0.0",
        "torchaudio>=2.0.0",
        "numpy>=1.24.0",
        "scipy>=1.10.0",
        "librosa>=0.10.0",
        "soundfile>=0.12.0",
        "cn2an>=0.5.17",
        "jieba>=0.42.1",
        "pypinyin>=0.49.0",
        "g2pW>=0.1.2.7.4",
        "pypinyin-g2pW>=0.1.2.7.4",
        "paddlespeech>=1.0.0",
        "transformers>=4.30.0",
        "so-vits-svc-fork>=4.1.1",
    ])
    .run_commands([
        "git clone https://github.com/RVC-Boss/GPT-SoVITS.git /gpt-sovits || true",
        "cd /gpt-sovits && pip install -r requirements.txt",
    ])
)

# Mount character voice models (you'll upload these separately)
# For now, we'll use a volume to store models
models_volume = modal.Volume.from_name("velowen-voice-models", create_if_missing=True)

@app.function(
    image=image,
    gpu="T4",  # T4 is cheaper than A100 for TTS
    volumes={"/models": models_volume},
    timeout=120,
    secrets=[modal.Secret.from_name("openai")],  # For future LLM integration
)
@modal.web_endpoint(method="POST")
def synthesize_speech(
    text: str,
    character: str = "yukino",
    language: str = "ja",  # Japanese for Yukino
    speed: float = 1.0,
):
    """
    Synthesize speech using GPT-SoVITS.
    
    Args:
        text: Text to speak
        character: Character name (yukino, etc.)
        language: Language code (ja, en, zh, ko, yue)
        speed: Speech speed multiplier (0.5-2.0)
    
    Returns:
        JSON with base64 encoded audio (WAV format)
    """
    import sys
    sys.path.insert(0, "/gpt-sovits")
    
    try:
        # Load character-specific model
        model_dir = Path(f"/models/{character}")
        
        if not model_dir.exists():
            return {
                "success": False,
                "error": f"Model not found for character: {character}. Please train and upload the model first.",
            }
        
        # Import GPT-SoVITS inference functions
        from GPT_SoVITS.inference_webui import change_gpt_weights, change_sovits_weights, get_tts_wav
        from tools.i18n.i18n import I18nAuto
        
        i18n = I18nAuto()
        
        # Find model files
        gpt_model = None
        sovits_model = None
        
        # Look for GPT model files (various versions)
        for pattern in ["s2Gv3.pth", "s2Gv2Pro.pth", "s2Gv2ProPlus.pth", "s2G.pth"]:
            gpt_path = model_dir / pattern
            if gpt_path.exists():
                gpt_model = str(gpt_path)
                break
        
        # Look for SoVITS model files
        for pattern in ["s2v4.pth", "s1v3.ckpt", "s2Dv2Pro.pth", "s2Dv2ProPlus.pth", "s1.ckpt"]:
            sovits_path = model_dir / pattern
            if sovits_path.exists():
                sovits_model = str(sovits_path)
                break
        
        if not gpt_model or not sovits_model:
            return {
                "success": False,
                "error": f"Model files not found in {model_dir}. Expected GPT model (s2G*.pth) and SoVITS model (s1*.ckpt or s2*.pth)",
            }
        
        # Reference audio and text
        ref_audio = model_dir / "reference.wav"
        ref_text_file = model_dir / "prompt.txt"
        
        if not ref_audio.exists():
            return {
                "success": False,
                "error": f"Reference audio not found: {ref_audio}",
            }
        
        if not ref_text_file.exists():
            return {
                "success": False,
                "error": f"Reference text not found: {ref_text_file}",
            }
        
        # Read reference text
        with open(ref_text_file, "r", encoding="utf-8") as f:
            ref_text = f.read().strip()
        
        # Map language codes
        lang_map = {
            "ja": "日文",
            "en": "英文",
            "zh": "中文",
            "ko": "韩文",
            "yue": "粤语",
        }
        ref_lang = lang_map.get(language, "日文")
        text_lang = lang_map.get(language, "日文")
        
        # Change model weights (load models)
        try:
            change_gpt_weights(gpt_path=gpt_model)
            change_sovits_weights(sovits_path=sovits_model)
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to load models: {str(e)}",
            }
        
        # Synthesize speech
        try:
            synthesis_result = get_tts_wav(
                ref_wav_path=str(ref_audio),
                prompt_text=ref_text,
                prompt_language=i18n(ref_lang),
                text=text,
                text_language=i18n(text_lang),
                top_p=1.0,
                temperature=1.0,
                speed=speed,
            )
            
            # Get the last result (final audio)
            result_list = list(synthesis_result)
            if not result_list:
                return {
                    "success": False,
                    "error": "Synthesis returned no results",
                }
            
            sample_rate, audio_data = result_list[-1]
            
            # Convert numpy array to bytes
            import soundfile as sf
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
                sf.write(tmp_file.name, audio_data, sample_rate)
                with open(tmp_file.name, "rb") as f:
                    audio_bytes = f.read()
                os.unlink(tmp_file.name)
            
            # Convert to base64
            audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
            
            return {
                "success": True,
                "audio_base64": audio_base64,
                "format": "wav",
                "sample_rate": int(sample_rate),
            }
            
        except Exception as e:
            import traceback
            return {
                "success": False,
                "error": f"Synthesis failed: {str(e)}",
                "traceback": traceback.format_exc(),
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "traceback": str(e.__traceback__) if hasattr(e, "__traceback__") else None,
        }


@app.function(
    image=image,
    gpu="T4",
    volumes={"/models": models_volume},
    timeout=300,
)
def train_character_model(
    character: str,
    audio_files: list[str],  # Base64 encoded audio files
    transcriptions: list[str],  # Corresponding transcriptions
    language: str = "ja",
):
    """
    Train a character voice model using GPT-SoVITS.
    This is a one-time setup function.
    
    Args:
        character: Character name
        audio_files: List of base64 encoded audio files
        transcriptions: List of transcriptions for each audio file
        language: Language code
    
    Returns:
        Training status
    """
    # This function will handle the training pipeline
    # For now, return instructions
    return {
        "success": False,
        "message": "Training function not yet implemented. Train locally first, then upload models.",
        "instructions": [
            "1. Use GPT-SoVITS WebUI locally to train Yukino model",
            "2. Collect 1 hour of clean Yukino audio samples",
            "3. Run training pipeline",
            "4. Upload trained model files to Modal volume",
        ],
    }

