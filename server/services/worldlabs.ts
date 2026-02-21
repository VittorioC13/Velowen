/**
 * World Labs API Integration
 * Handles image-to-3D generation using World Labs Marble API
 */

const WORLD_LABS_API_KEY = process.env.WORLD_LABS_API_KEY;
const BASE_URL = 'https://api.worldlabs.ai';

interface UploadResponse {
  media_asset: {
    media_asset_id: string;
    file_name: string;
    kind: string;
    created_at: string;
  };
  upload_info: {
    upload_url: string;
    required_headers: Record<string, string>;
  };
}

interface GenerateResponse {
  operation_id: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  done: boolean;
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    world_id: string;
  };
}

interface WorldAssets {
  world_id: string;
  display_name: string;
  assets: {
    splats: {
      spz_urls: {
        '100k': string;
        '500k': string;
        'full_res': string;
      };
    };
    imagery: {
      pano_url: string;
    };
    mesh: {
      collider_mesh_url: string | null;
    };
    thumbnail_url: string;
    caption: string;
  };
  world_marble_url: string;
  model: string;
}

/**
 * Upload image to World Labs
 */
async function uploadImage(imageBase64: string, fileName: string = 'image.jpg'): Promise<string> {
  if (!WORLD_LABS_API_KEY) {
    throw new Error('WORLD_LABS_API_KEY not configured');
  }

  // Convert base64 to buffer
  const imageBuffer = Buffer.from(imageBase64, 'base64');

  // Prepare upload
  const prepareResponse = await fetch(`${BASE_URL}/marble/v1/media-assets:prepare_upload`, {
    method: 'POST',
    headers: {
      'WLT-Api-Key': WORLD_LABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_name: fileName,
      file_type: 'jpeg',
      kind: 'image',
    }),
  });

  if (!prepareResponse.ok) {
    const error = await prepareResponse.text();
    throw new Error(`Failed to prepare upload: ${error}`);
  }

  const prepareData: UploadResponse = await prepareResponse.json();
  const mediaAssetId = prepareData.media_asset.media_asset_id;
  const uploadUrl = prepareData.upload_info.upload_url;
  const uploadHeaders = prepareData.upload_info.required_headers;

  // Upload file to signed URL
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: uploadHeaders,
    body: imageBuffer,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
  }

  return mediaAssetId;
}

/**
 * Generate world from uploaded image
 */
async function generateWorld(
  mediaAssetId: string,
  modelType: 'standard' | 'fast' = 'fast',
  textPrompt?: string
): Promise<string> {
  if (!WORLD_LABS_API_KEY) {
    throw new Error('WORLD_LABS_API_KEY not configured');
  }

  const model = modelType === 'fast' ? 'Marble 0.1-mini' : 'Marble 0.1-plus';

  const requestBody = {
    display_name: 'Velowen Scene',
    model: model,
    world_prompt: {
      type: 'image' as const,
      image_prompt: {
        source: 'media_asset' as const,
        media_asset_id: mediaAssetId,
      },
      ...(textPrompt && { text_prompt: textPrompt }),
    },
  };

  const response = await fetch(`${BASE_URL}/marble/v1/worlds:generate`, {
    method: 'POST',
    headers: {
      'WLT-Api-Key': WORLD_LABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate world: ${error}`);
  }

  const result: GenerateResponse = await response.json();
  return result.operation_id;
}

/**
 * Poll operation status until complete
 */
async function pollOperation(operationId: string, maxAttempts: number = 120): Promise<any> {
  if (!WORLD_LABS_API_KEY) {
    throw new Error('WORLD_LABS_API_KEY not configured');
  }

  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(`${BASE_URL}/marble/v1/operations/${operationId}`, {
      headers: {
        'WLT-Api-Key': WORLD_LABS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check operation: ${response.statusText}`);
    }

    const operation: GenerateResponse = await response.json();

    if (operation.done) {
      if (operation.error) {
        throw new Error(`Generation failed: ${JSON.stringify(operation.error)}`);
      }
      return operation;
    }

    // Wait 5 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;
  }

  throw new Error('Timeout: Generation took too long');
}

/**
 * Get world details
 */
async function getWorld(worldId: string): Promise<WorldAssets> {
  if (!WORLD_LABS_API_KEY) {
    throw new Error('WORLD_LABS_API_KEY not configured');
  }

  const response = await fetch(`${BASE_URL}/marble/v1/worlds/${worldId}`, {
    headers: {
      'WLT-Api-Key': WORLD_LABS_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get world: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Main function: Generate 3D world from image
 */
export async function generateWorldFromImage(
  imageBase64: string,
  options: {
    modelType?: 'standard' | 'fast';
    textPrompt?: string;
    fileName?: string;
  } = {}
): Promise<{
  success: boolean;
  plyUrl: string;
  worldId: string;
  marbleViewerUrl: string;
  assets: WorldAssets['assets'];
  generationTime: number;
}> {
  const startTime = Date.now();

  try {
    // Step 1: Upload image
    const mediaAssetId = await uploadImage(imageBase64, options.fileName);

    // Step 2: Generate world
    const operationId = await generateWorld(
      mediaAssetId,
      options.modelType || 'fast',
      options.textPrompt
    );

    // Step 3: Poll for completion
    const operation = await pollOperation(operationId);

    // Step 4: Get world details
    const worldId = operation.metadata?.world_id;
    if (!worldId) {
      throw new Error('No world_id returned from operation');
    }
    const world = await getWorld(worldId);

    const generationTime = Math.round((Date.now() - startTime) / 1000);


    return {
      success: true,
      plyUrl: world.assets.splats.spz_urls['100k'], // Use 100k resolution for faster loading
      worldId: world.world_id,
      marbleViewerUrl: world.world_marble_url,
      assets: world.assets,
      generationTime,
    };
  } catch (error) {
    throw error;
  }
}
