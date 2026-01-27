/**
 * SHARP-ML API Integration
 * Handles image-to-3D generation using Apple's SHARP-ML on Modal
 */

const MODAL_ENDPOINT_URL = process.env.MODAL_ENDPOINT_URL ||
  'https://victorche0909--sharp-ml-app-sharpmodel-generate.modal.run';

/**
 * Generate 3D scene from image using SHARP-ML
 */
export async function generateSceneFromImage(
  imageBase64: string
): Promise<{
  success: boolean;
  plyData: string; // base64 encoded PLY data
  generationTime: number;
}> {
  const startTime = Date.now();

  try {
    console.log('[SHARP-ML] Calling Modal endpoint...');

    const response = await fetch(MODAL_ENDPOINT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageBase64 }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Modal API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();

    if (!result.success || !result.ply_base64) {
      throw new Error(result.error || 'No PLY data returned from Modal');
    }

    const generationTime = Math.round((Date.now() - startTime) / 1000);

    console.log(`[SHARP-ML] ✅ Complete in ${generationTime}s`);

    return {
      success: true,
      plyData: result.ply_base64,
      generationTime,
    };
  } catch (error) {
    console.error('[SHARP-ML] Error:', error);
    throw error;
  }
}
