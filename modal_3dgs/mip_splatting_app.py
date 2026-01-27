"""
Modal deployment for Mip-Splatting 3DGS
Improved quality 3D Gaussian Splatting with anti-aliasing
Replaces SHARP-ML with custom anime-optimized model
"""

import modal
import io
import base64
import tempfile
from pathlib import Path

# Create Modal app
app = modal.App("velowen-mip-splatting")

# Define image with 3DGS + Mip-Splatting dependencies
image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install(
        "git",
        "cmake",
        "build-essential",
        "libglew-dev",
        "libassimp-dev",
        "libboost-all-dev",
        "libgtk-3-dev",
        "libopencv-dev",
        "libglfw3-dev",
        "libavdevice-dev",
        "libavcodec-dev",
        "libeigen3-dev",
        "libxxf86vm-dev",
        "libembree-dev",
    )
    .pip_install([
        "torch==2.0.1",
        "torchvision==0.15.2",
        "torchaudio==2.0.2",
        "plyfile",
        "tqdm",
        "numpy",
        "pillow",
        "scipy",
    ])
    .run_commands([
        # Clone Mip-Splatting repo
        "cd /root && git clone https://github.com/niujinshuchong/mip-splatting.git --recursive",
        # Install CUDA extensions (this takes time, cached in image)
        "cd /root/mip-splatting && pip install submodules/diff-gaussian-rasterization",
        "cd /root/mip-splatting && pip install submodules/simple-knn",
    ])
)

# Volume for storing trained models
models_volume = modal.Volume.from_name("velowen-3dgs-models", create_if_missing=True)

@app.function(
    image=image,
    gpu="A100",  # Need powerful GPU for 3DGS training
    volumes={"/models": models_volume},
    timeout=600,  # 10 minutes max
)
@modal.web_endpoint(method="POST")
def generate_3d(image_base64: str):
    """
    Generate 3D Gaussian Splatting PLY from single image
    Uses Mip-Splatting for anti-aliased output

    Args:
        image_base64: Base64 encoded input image

    Returns:
        JSON with base64 encoded PLY file
    """
    import sys
    import subprocess
    sys.path.insert(0, "/root/mip-splatting")

    try:
        from PIL import Image
        import numpy as np

        # Decode input image
        image_data = base64.b64decode(image_base64)
        input_image = Image.open(io.BytesIO(image_data))

        # Save to temp directory
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir = Path(tmpdir)
            input_path = tmpdir / "input.png"
            input_image.save(input_path)

            # TODO: For now, return a placeholder response
            # Next step: Implement multi-view generation + 3DGS training
            return {
                "success": False,
                "error": "Mip-Splatting training not yet implemented. Steps needed:",
                "next_steps": [
                    "1. Generate multiple views from single image (Zero123 or Wonder3D)",
                    "2. Run COLMAP for camera poses",
                    "3. Train Mip-Splatting 3DGS model",
                    "4. Export optimized PLY file",
                ],
                "estimated_time": "This will take 2-5 minutes per image once implemented",
                "alternative": "Continue using SHARP-ML for now, implement this in Week 2",
            }

    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc(),
        }


@app.function(
    image=image,
    gpu="A100",
    volumes={"/models": models_volume},
    timeout=3600,  # 1 hour for training
)
def train_anime_model(image_dataset_base64: list[str]):
    """
    Train a 3DGS model on anime dataset
    This creates a reusable model for faster inference

    Args:
        image_dataset_base64: List of base64 encoded anime images

    Returns:
        Training status
    """
    return {
        "success": False,
        "message": "Training function placeholder - implement in Week 3",
        "instructions": [
            "1. Collect 1000+ anime images (Danbooru)",
            "2. Preprocess: background removal, resize",
            "3. Generate multi-view data (Zero123)",
            "4. Train Mip-Splatting model",
            "5. Save to volume for reuse",
        ],
    }


# CLI for local development and testing
@app.local_entrypoint()
def main():
    """Test the Mip-Splatting endpoint locally"""

    print("Testing Mip-Splatting endpoint...")
    print("Note: This is a placeholder. Implementation coming in Week 1-2.")
    print()
    print("Current status: Using SHARP-ML for now")
    print("Week 1 goal: Get Mip-Splatting working end-to-end")
    print()
    print("Deploy this with: modal deploy mip_splatting_app.py")
