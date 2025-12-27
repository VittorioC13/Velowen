import type { VercelRequest, VercelResponse } from '@vercel/node';
import { list, del } from '@vercel/blob';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('Vercel Blob storage not configured');
    }

    // List all files in outputs folder
    const { blobs } = await list({
      prefix: 'outputs/',
    });

    console.log(`Found ${blobs.length} files in blob storage`);

    // Delete all files older than 24 hours, or keep only the 10 most recent
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Sort by uploadedAt (newest first)
    const sortedBlobs = blobs.sort((a, b) => {
      const timeA = new Date(a.uploadedAt).getTime();
      const timeB = new Date(b.uploadedAt).getTime();
      return timeB - timeA;
    });

    // Keep the 10 most recent, delete the rest
    const toDelete = sortedBlobs.slice(10);
    
    let deletedCount = 0;
    let totalSizeFreed = 0;

    for (const blob of toDelete) {
      try {
        await del(blob.url);
        deletedCount++;
        totalSizeFreed += blob.size || 0;
        console.log(`Deleted: ${blob.pathname} (${(blob.size || 0) / 1024 / 1024}MB)`);
      } catch (error) {
        console.error(`Failed to delete ${blob.pathname}:`, error);
      }
    }

    res.json({
      success: true,
      deleted: deletedCount,
      kept: sortedBlobs.length - deletedCount,
      sizeFreedMB: Math.round(totalSizeFreed / 1024 / 1024),
      totalFiles: blobs.length,
    });
  } catch (error) {
    console.error('Error cleaning up blob storage:', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to cleanup blob storage',
    });
  }
}

