# Setup Vercel Blob Storage

The PLY viewer requires Vercel Blob storage to serve large 3D files without crashing the browser.

## Quick Setup:

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project (Velowen)
3. Go to **Settings** > **Environment Variables**
4. Click **Add New**
5. Name: `BLOB_READ_WRITE_TOKEN`
6. Value: Get this from https://vercel.com/dashboard/stores
   - Click "Create Store" > "Blob"
   - Copy the token
7. Click **Save**
8. Redeploy your project

## Why This Is Needed:

- PLY files can be several MB when base64 encoded
- Putting large data in URLs causes browser crashes ("Out of Memory")
- Vercel Blob storage provides proper HTTP URLs for large files
- It's free for reasonable usage

After setting up, the viewer will work correctly!

