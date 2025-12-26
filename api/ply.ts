import type { VercelRequest, VercelResponse } from '@vercel/node';
import { get } from '@vercel/blob';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'PLY ID is required' });
    }

    // Try to get from Vercel Blob storage
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const fileName = `outputs/${id}.ply`;
        const blob = await get(fileName);
        
        if (!blob) {
          return res.status(404).json({ message: 'PLY file not found' });
        }

        // Convert blob to buffer
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Set headers for PLY file
        res.setHeader('Content-Type', 'application/x-ply');
        res.setHeader('Content-Disposition', `inline; filename="${id}.ply"`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=3600');

        // Send the PLY file
        res.send(buffer);
        return;
      } catch (blobError) {
        console.error('Error fetching from Blob:', blobError);
        return res.status(404).json({ message: 'PLY file not found in storage' });
      }
    } else {
      return res.status(500).json({ 
        message: 'Vercel Blob storage not configured. Please set BLOB_READ_WRITE_TOKEN environment variable.' 
      });
    }
  } catch (error) {
    console.error('Error serving PLY:', error);
    res.status(500).json({ message: 'Failed to serve PLY file' });
  }
}
