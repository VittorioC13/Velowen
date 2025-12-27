import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put, list, del } from '@vercel/blob';

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

    // Upload to Vercel Blob storage (REQUIRED - no fallback to prevent memory issues)
    let plyUrl: string;
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error(
        'Vercel Blob storage not configured. Please set BLOB_READ_WRITE_TOKEN environment variable in Vercel dashboard. ' +
        'Go to: Project Settings > Environment Variables > Add BLOB_READ_WRITE_TOKEN'
      );
    }

    // Clean up old files before uploading (keep only 10 most recent)
    try {
      const { blobs } = await list({ prefix: 'outputs/' });
      if (blobs.length > 10) {
        // Sort by uploadedAt (newest first) and delete old ones
        const sortedBlobs = blobs.sort((a, b) => {
          const timeA = new Date(a.uploadedAt).getTime();
          const timeB = new Date(b.uploadedAt).getTime();
          return timeB - timeA;
        });
        
        const toDelete = sortedBlobs.slice(10);
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
      // Don't fail the request if cleanup fails
      console.warn('Cleanup failed, continuing:', cleanupError);
    }

    // Always use Vercel Blob (prevents memory issues from large URLs)
    const blob = await put(fileName, plyBuffer, {
      access: 'public',
      contentType: 'application/x-ply',
    });
    plyUrl = blob.url;

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

