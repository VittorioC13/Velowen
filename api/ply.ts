import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { data } = req.query;

    if (!data || typeof data !== 'string') {
      return res.status(400).json({ message: 'PLY data is required' });
    }

    // Decode base64 PLY data from query parameter
    const plyBuffer = Buffer.from(data, 'base64');

    // Set headers for PLY file
    res.setHeader('Content-Type', 'application/x-ply');
    res.setHeader('Content-Disposition', 'inline; filename="scene.ply"');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // Send the PLY file
    res.send(plyBuffer);
  } catch (error) {
    console.error('Error serving PLY:', error);
    res.status(500).json({ message: 'Failed to serve PLY file' });
  }
}
