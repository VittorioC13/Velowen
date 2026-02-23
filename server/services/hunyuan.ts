/**
 * Hunyuan3D API Integration (Tencent)
 * Image to 3D mesh generation optimized for anime
 * Using Replicate API platform
 */

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

interface HunyuanOptions {
  steps?: number; // 20-50, default 50
  guidanceScale?: number; // 1-20, default 5.5
  octreeResolution?: 256 | 384 | 512; // default 256
  removeBackground?: boolean; // default true
}

interface HunyuanResult {
  success: boolean;
  glbUrl: string;
  generationTime: number;
  metadata?: {
    predict_time?: number;
  };
}

export async function generateMeshFromImage(
  imageBase64: string,
  options: HunyuanOptions = {}
): Promise<HunyuanResult> {
  const startTime = Date.now();

  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN not configured');
  }

  try {
    // Create prediction using Hunyuan3D-2 model (correct version ID from API docs)
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'b1b9449a1277e10402781c5d41eb30c0a0683504fb23fab591ca9dfc2aabe1cb',
        input: {
          image: `data:image/jpeg;base64,${imageBase64}`,
          steps: options.steps || 50,
          guidance_scale: options.guidanceScale || 5.5,
          octree_resolution: options.octreeResolution || 384, // Higher resolution for better quality
          remove_background: options.removeBackground !== false,
          seed: Math.floor(Math.random() * 1000000),
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Replicate API error: ${response.status} - ${errorText}`);
    }

    const prediction = await response.json();

    // Poll for completion
    let result = prediction;
    const maxAttempts = 180; // 3 minutes max (Hunyuan can take ~60-90s)
    let attempts = 0;

    while (
      (result.status === 'starting' || result.status === 'processing') &&
      attempts < maxAttempts
    ) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;

      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
          },
        }
      );

      if (!pollResponse.ok) {
        throw new Error(`Polling failed: ${pollResponse.status}`);
      }

      result = await pollResponse.json();
    }

    if (result.status !== 'succeeded') {
      throw new Error(result.error || 'Mesh generation failed');
    }

    const generationTime = Math.round((Date.now() - startTime) / 1000);

    // Hunyuan3D-2 returns output.mesh as the GLB URL
    const glbUrl = result.output?.mesh;

    if (!glbUrl) {
      throw new Error('No mesh URL in response');
    }

    return {
      success: true,
      glbUrl: glbUrl,
      generationTime,
      metadata: result.metrics || {},
    };
  } catch (error) {
    throw error;
  }
}
