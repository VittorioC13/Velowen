# API Generate-3D Fix Documentation

## Problem Summary

Previously, the `api/generate-3d.ts` endpoint was hardcoded to only use the Sharp ML service via Modal, which outputs PLY point cloud files. Even though Hunyuan and World Labs services were properly implemented in `server/services/`, they were never actually called.

## What Was Fixed

The API endpoint now properly routes to all three 3D generation models based on the `model` parameter:

1. **Sharp ML** (default) - Outputs PLY point clouds via Modal
2. **Hunyuan** - Outputs GLB smooth meshes via Replicate API
3. **World Labs** - Outputs splat files, meshes, and panoramas

## API Usage

### Endpoint
```
POST /api/generate-3d
```

### Request Body

```typescript
{
  image: string;        // Required: Base64-encoded image with data URI prefix
  model?: string;       // Optional: "sharp-ml" | "hunyuan" | "world-labs" (default: "sharp-ml")
  textPrompt?: string;  // Optional: Text prompt for World Labs model
}
```

### Response Formats

#### Sharp ML Response
```json
{
  "success": true,
  "model": "sharp-ml",
  "plyUrl": "https://blob.vercel-storage.com/outputs/ply-123.ply",
  "format": "ply"
}
```

#### Hunyuan Response
```json
{
  "success": true,
  "model": "hunyuan",
  "glbUrl": "https://replicate.delivery/.../output.glb",
  "format": "glb"
}
```

#### World Labs Response
```json
{
  "success": true,
  "model": "world-labs",
  "plyUrl": "https://cdn.worldlabs.dev/.../splat-100k.ply",
  "meshUrl": "https://cdn.worldlabs.dev/.../mesh.glb",
  "panoramaUrl": "https://cdn.worldlabs.dev/.../panorama.jpg",
  "worldId": "world_abc123",
  "marbleViewerUrl": "https://marble.world/worlds/world_abc123",
  "assets": { /* full asset object */ },
  "format": "splat"
}
```

## Environment Variables Required

Make sure these are set in your Vercel project:

- `BLOB_READ_WRITE_TOKEN` - Required for Sharp ML (Vercel Blob storage)
- `REPLICATE_API_TOKEN` - Required for Hunyuan
- `WORLD_LABS_API_KEY` - Required for World Labs
- `MODAL_ENDPOINT_URL` - Optional for Sharp ML (defaults to your Modal endpoint)

## Frontend Integration Example

```typescript
// Example: Generate with Hunyuan (smooth mesh)
const response = await fetch('/api/generate-3d', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    image: base64Image,
    model: 'hunyuan'
  })
});

const result = await response.json();

if (result.success) {
  if (result.format === 'glb') {
    // Load GLB mesh in viewer
    loadGLBModel(result.glbUrl);
  } else if (result.format === 'ply') {
    // Load PLY point cloud
    loadPLYModel(result.plyUrl);
  } else if (result.format === 'splat') {
    // Load splat with optional mesh
    loadSplatModel(result.plyUrl, result.meshUrl);
  }
}
```

## Key Changes in Code

### Model Selection Logic
```typescript
if (model === 'hunyuan') {
  // Uses Replicate API
  // Returns GLB mesh URL
}
else if (model === 'world-labs') {
  // Uses World Labs API
  // Returns splat URLs + mesh + panorama
}
else {
  // Uses Modal endpoint (Sharp ML)
  // Returns PLY point cloud
}
```

### Hunyuan Implementation
- Calls Replicate API with Tencent's Hunyuan3D-2 model
- Polls for completion (max 3 minutes)
- Returns smooth GLB mesh file suitable for traditional 3D rendering

### World Labs Implementation
- Uploads image to World Labs API
- Generates 3D world with optional text prompt
- Polls for completion (max 10 minutes)
- Returns multiple formats: splat files (100k/500k/full), mesh collider, panorama

### Sharp ML Implementation
- Maintained original behavior
- Calls Modal endpoint
- Stores PLY in Vercel Blob storage
- Auto-cleanup keeps 10 most recent files

## Output Format Comparison

| Model | Format | File Type | Best For | Rendering Style |
|-------|--------|-----------|----------|-----------------|
| **Sharp ML** | PLY | Point Cloud | Fast previews | Gaussian splatting |
| **Hunyuan** | GLB | Mesh | Smooth objects | Traditional 3D with lighting |
| **World Labs** | Splat/Mesh | Multiple | Immersive scenes | Hybrid rendering |

## Viewer Component Compatibility

The existing `GaussianViewer.tsx` component already supports both formats:
- **PLY files**: Rendered with Gaussian Splats 3D library
- **GLB files**: Rendered with Three.js GLTFLoader with proper lighting

No viewer changes needed - it will automatically detect and render the correct format!

## Testing Recommendations

1. **Test Sharp ML**: Should work as before (PLY output)
2. **Test Hunyuan**: Verify GLB mesh is smooth and properly lit
3. **Test World Labs**: Check splat quality and optional mesh/panorama
4. **Test error handling**: Try without required env vars to verify error messages
5. **Test model selection**: Ensure each model parameter routes correctly

## Migration Notes

If your frontend was calling the API without a `model` parameter, it will default to `sharp-ml` (backward compatible). To use the new models, simply add:

```typescript
// For smooth meshes
body: JSON.stringify({ image, model: 'hunyuan' })

// For world generation
body: JSON.stringify({ image, model: 'world-labs', textPrompt: 'futuristic city' })
```
