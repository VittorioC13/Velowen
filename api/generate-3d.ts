import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put, list, del } from '@vercel/blob';

// Sharp ML implementation (Modal endpoint)
async function generateWithSharpML(image: string) {
  const modalEndpoint = process.env.MODAL_ENDPOINT_URL ||
    'https://victorche0909--sharp-ml-app-sharpmodel-generate.modal.run';

  const response = await fetch(modalEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Modal API error: ${response.status} ${errorText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || '3D generation failed');
  }

  if (!result.ply_base64) {
    throw new Error('No PLY data returned from Modal');
  }

  return result.ply_base64;
}

// Hunyuan implementation (Replicate API)
async function generateWithHunyuan(image: string) {
  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN environment variable is required for Hunyuan model');
  }

  const MODEL_VERSION = 'b1b9449a1277e10402781c5d41eb30c0a0683504fb23fab591ca9dfc2aabe1cb';

  // Start prediction
  const startResponse = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: MODEL_VERSION,
      input: {
        image: image,
        steps: 50,
        guidance_scale: 5.5,
        octree_resolution: 384,
        remove_background: true,
        seed: Math.floor(Math.random() * 1000000),
      },
    }),
  });

  if (!startResponse.ok) {
    const errorText = await startResponse.text();
    throw new Error(`Replicate API error: ${startResponse.status} ${errorText}`);
  }

  const prediction = await startResponse.json();
  const predictionId = prediction.id;

  // Poll for completion (max 3 minutes)
  let attempts = 0;
  const maxAttempts = 180;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

    const pollResponse = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!pollResponse.ok) {
      throw new Error(`Failed to poll prediction: ${pollResponse.status}`);
    }

    const status = await pollResponse.json();

    if (status.status === 'succeeded') {
      // Hunyuan returns GLB mesh URL at result.output.mesh
      if (status.output && status.output.mesh) {
        return { glbUrl: status.output.mesh };
      }
      throw new Error('No mesh URL in Hunyuan output');
    }

    if (status.status === 'failed' || status.status === 'canceled') {
      throw new Error(`Hunyuan generation failed: ${status.error || 'Unknown error'}`);
    }

    attempts++;
  }

  throw new Error('Hunyuan generation timeout (3 minutes)');
}

// World Labs implementation
async function generateWithWorldLabs(image: string, textPrompt?: string) {
  const WORLD_LABS_API_KEY = process.env.WORLD_LABS_API_KEY;

  if (!WORLD_LABS_API_KEY) {
    throw new Error('WORLD_LABS_API_KEY environment variable is required for World Labs model');
  }

  const baseUrl = 'https://api.worldlabs.dev/marble/v1';
  const headers = {
    'Content-Type': 'application/json',
    'WLT-Api-Key': WORLD_LABS_API_KEY,
  };

  // Step 1: Prepare upload
  const prepareResponse = await fetch(`${baseUrl}/media-assets:prepare_upload`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      media_type: 'image',
    }),
  });

  if (!prepareResponse.ok) {
    throw new Error(`World Labs prepare upload failed: ${prepareResponse.status}`);
  }

  const { signed_upload_url, media_asset_id } = await prepareResponse.json();

  // Step 2: Upload image
  const imageBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');

  const uploadResponse = await fetch(signed_upload_url, {
    method: 'PUT',
    body: imageBuffer,
    headers: {
      'Content-Type': 'image/jpeg',
    },
  });

  if (!uploadResponse.ok) {
    throw new Error(`World Labs image upload failed: ${uploadResponse.status}`);
  }

  // Step 3: Generate world
  const generateBody: any = {
    media_asset_id,
    model: 'Marble 0.1-plus',
  };

  if (textPrompt) {
    generateBody.text_prompt = textPrompt;
  }

  const generateResponse = await fetch(`${baseUrl}/worlds:generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(generateBody),
  });

  if (!generateResponse.ok) {
    throw new Error(`World Labs generation failed: ${generateResponse.status}`);
  }

  const { operation_id } = await generateResponse.json();

  // Step 4: Poll for completion (max 10 minutes)
  let attempts = 0;
  const maxAttempts = 120;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

    const pollResponse = await fetch(`${baseUrl}/operations/${operation_id}`, {
      headers,
    });

    if (!pollResponse.ok) {
      throw new Error(`World Labs poll failed: ${pollResponse.status}`);
    }

    const operation = await pollResponse.json();

    if (operation.done) {
      if (operation.error) {
        throw new Error(`World Labs generation error: ${JSON.stringify(operation.error)}`);
      }

      const worldId = operation.result?.world_id;

      if (!worldId) {
        throw new Error('No world ID in World Labs response');
      }

      // Step 5: Get world details
      const worldResponse = await fetch(`${baseUrl}/worlds/${worldId}`, {
        headers,
      });

      if (!worldResponse.ok) {
        throw new Error(`Failed to fetch world details: ${worldResponse.status}`);
      }

      const world = await worldResponse.json();

      return {
        worldId,
        plyUrl: world.assets?.splat?.urls?.['100k'] || world.assets?.splat?.urls?.full,
        meshUrl: world.assets?.mesh_collider?.url,
        panoramaUrl: world.assets?.panorama?.url,
        marbleViewerUrl: `https://marble.world/worlds/${worldId}`,
        assets: world.assets,
      };
    }

    attempts++;
  }

  throw new Error('World Labs generation timeout (10 minutes)');
}

// Cleanup old files helper
async function cleanupOldFiles(prefix: string, keepCount: number = 10) {
  try {
    const { blobs } = await list({ prefix });
    if (blobs.length > keepCount) {
      const sortedBlobs = blobs.sort((a, b) => {
        const timeA = new Date(a.uploadedAt).getTime();
        const timeB = new Date(b.uploadedAt).getTime();
        return timeB - timeA;
      });

      const toDelete = sortedBlobs.slice(keepCount);
      for (const blob of toDelete) {
        try {
          await del(blob.url);
          console.log(`Cleaned up old file: ${blob.pathname}`);
        } catch (error) {
          console.error(`Failed to delete ${blob.pathname}:`, error);
        }
      }
    }
  } catch (cleanupError) {
    console.warn('Cleanup failed, continuing:', cleanupError);
  }
}

// Main handler
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { image, model = 'sharp-ml', textPrompt } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const validModels = ['sharp-ml', 'hunyuan', 'world-labs'];
    if (!validModels.includes(model)) {
      return res.status(400).json({
        message: `Invalid model. Must be one of: ${validModels.join(', ')}`
      });
    }

    console.log(`Generating 3D with model: ${model}`);

    // Route to appropriate model
    if (model === 'hunyuan') {
      // Hunyuan returns GLB mesh URL directly
      const result = await generateWithHunyuan(image);

      return res.json({
        success: true,
        model: 'hunyuan',
        glbUrl: result.glbUrl,
        format: 'glb',
      });
    }
    else if (model === 'world-labs') {
      // World Labs returns multiple formats
      const result = await generateWithWorldLabs(image, textPrompt);

      return res.json({
        success: true,
        model: 'world-labs',
        plyUrl: result.plyUrl,
        meshUrl: result.meshUrl,
        panoramaUrl: result.panoramaUrl,
        worldId: result.worldId,
        marbleViewerUrl: result.marbleViewerUrl,
        assets: result.assets,
        format: 'splat',
      });
    }
    else {
      // Sharp ML - original implementation with Vercel Blob storage
      const plyBase64 = await generateWithSharpML(image);
      const plyBuffer = Buffer.from(plyBase64, 'base64');

      // Generate unique ID for PLY file
      const id = `ply-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const fileName = `outputs/${id}.ply`;

      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error(
          'Vercel Blob storage not configured. Set BLOB_READ_WRITE_TOKEN ' +
          'in dashboard: Project Settings > Environment Variables'
        );
      }

      // Cleanup old files
      await cleanupOldFiles('outputs/', 10);

      // Upload to Vercel Blob
      const blob = await put(fileName, plyBuffer, {
        access: 'public',
        contentType: 'application/x-ply',
      });

      return res.json({
        success: true,
        model: 'sharp-ml',
        plyUrl: blob.url,
        format: 'ply',
      });
    }
  } catch (error) {
    console.error('Error generating 3D:', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to generate 3D scene',
    });
  }
}
