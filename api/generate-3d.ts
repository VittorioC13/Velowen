import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Call Modal endpoint
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

    // Check for success and ply_base64 (Modal returns ply_base64, not ply_data)
    if (!result.success) {
      throw new Error(result.error || '3D generation failed');
    }

    if (!result.ply_base64) {
      throw new Error('No PLY data returned from Modal');
    }

    // Convert base64 PLY data to buffer
    const plyBuffer = Buffer.from(result.ply_base64, 'base64');

    // Generate a unique ID for this PLY file
    const id = `ply-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const fileName = `outputs/${id}.ply`;

    // Upload to Vercel Blob storage (like SHARP-ML does)
    let plyUrl: string;
    
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Production: Use Vercel Blob
      const blob = await put(fileName, plyBuffer, {
        access: 'public',
        contentType: 'application/x-ply',
      });
      plyUrl = blob.url;
    } else {
      // Local dev: Return base64 and let frontend create data URL
      // The viewer should handle data URLs
      plyUrl = `data:application/x-ply;base64,${result.ply_base64}`;
    }

    res.setHeader('Content-Type', 'application/json');
    res.json({
      success: true,
      plyUrl: plyUrl,
    });
  } catch (error) {
    console.error('Error generating 3D:', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to generate 3D scene',
    });
  }
}

