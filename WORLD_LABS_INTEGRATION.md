# World Labs API Integration

## Overview

Velowen now supports **dual model generation**:
- 🍎 **SHARP-ML** (Apple's model on Modal A10G)
- 🌍 **World Labs Marble** (World Labs API)

Users can choose which model to use when generating 3D worlds.

---

## What We Built

### 1. Backend Services

**`server/services/worldlabs.ts`**
- Upload image to World Labs
- Generate 3D world
- Poll for completion
- Return SPZ URLs + extras

**`server/services/sharpml.ts`**
- Generate 3D scene using SHARP-ML
- Returns PLY data

### 2. Updated API Endpoint

**`/api/generate-3d`** now accepts:
```json
{
  "image": "base64_string",
  "model": "sharp-ml" | "world-labs",  // NEW
  "textPrompt": "optional description"  // NEW (World Labs only)
}
```

**Response for SHARP-ML:**
```json
{
  "success": true,
  "plyUrl": "/outputs/ply-xxxxx.ply",
  "model": "sharp-ml",
  "generationTime": 35
}
```

**Response for World Labs:**
```json
{
  "success": true,
  "plyUrl": "https://cdn.marble.worldlabs.ai/.../sand_100k.spz",
  "worldId": "uuid",
  "marbleViewerUrl": "https://marble.worldlabs.ai/world/uuid",
  "model": "world-labs",
  "generationTime": 37,
  "assets": {
    "spz_urls": {
      "100k": "...",
      "500k": "...",
      "full_res": "..."
    },
    "pano_url": "...",
    "thumbnail_url": "...",
    "caption": "Auto-generated scene description"
  }
}
```

### 3. Frontend UI

**Model Selection Toggle** (only shown on Upload tab):
- Beautiful gradient cards
- Toggle between SHARP-ML and World Labs
- Shows model info (speed, quality)
- Automatically sends correct model parameter to backend

---

## Feature Comparison

| Feature | SHARP-ML | World Labs |
|---------|----------|------------|
| **Speed** | ~35s | ~37s (fast) / ~5min (standard) |
| **Format** | PLY (10-50MB) | SPZ (10x smaller) |
| **Viewer Support** | ✅ Native | ✅ Native (v0.4.7+) |
| **Quality** | Good | Potentially better |
| **Extras** | None | Panorama, thumbnail, caption |
| **Cost** | $0.006/gen (Modal A10G) | Credits (6,250 available) |
| **Infrastructure** | Your Modal | World Labs cloud |
| **Reliability** | You control | Depends on World Labs |

---

## How to Test

### Prerequisites

1. **Environment Variables** (`.env`):
```bash
# World Labs API
WORLD_LABS_API_KEY=z5ajcjwbOd8DAjpat2YPh5PzKv84IvRk

# SHARP-ML (existing)
MODAL_ENDPOINT_URL=https://victorche0909--sharp-ml-app-sharpmodel-generate.modal.run
```

2. **Dependencies** (already installed):
```bash
npm install dotenv  # ✅ Done
```

### Testing Steps

1. **Start the dev server**:
```bash
cd C:\Users\rotciv\Desktop\Velowen
npm run dev
```

2. **Open Velowen**:
```
http://localhost:5000/image-to-3d
```

3. **Click "Upload" tab**

4. **Choose model**:
   - 🍎 **SHARP-ML** → Your existing model (fast, reliable)
   - 🌍 **World Labs** → New API (test this!)

5. **Upload an anime image** (or use demo)

6. **Watch the generation**:
   - Processing bar shows progress
   - Takes ~35-37 seconds

7. **View the result**:
   - 3D viewer loads SPZ or PLY
   - Should work identically for both models

### Test Both Models

**Test 1: SHARP-ML (Control)**
- Select 🍎 SHARP-ML
- Upload `client/public/demo/yukino1.jpg`
- Verify it generates successfully
- Viewer loads PLY file

**Test 2: World Labs (New)**
- Select 🌍 World Labs
- Upload `client/public/demo/yukino1.jpg`
- Verify it generates successfully
- Viewer loads SPZ file
- Check browser console for asset URLs

---

## Viewer Compatibility

Both formats work in your viewer:

```typescript
// SHARP-ML PLY
await viewer.addSplatScene('/outputs/ply-12345.ply', { ... });

// World Labs SPZ
await viewer.addSplatScene('https://cdn.marble.worldlabs.ai/.../sand_100k.spz', { ... });
```

**SPZ Support**: Added in `@mkkellogg/gaussian-splats-3d@0.4.7` ✅

**Note**: SPZ doesn't support progressive loading, but loads faster due to compression.

---

## Future Enhancements

### Phase 1 (Current) ✅
- Dual model support
- User choice toggle
- Both models working

### Phase 2 (Next)
- **Quality comparison**: Side-by-side viewer
- **Cost tracking**: Show credits used
- **Model presets**: Fast/Standard/Premium
- **Prompt input**: Better UI for text prompts

### Phase 3 (Later)
- **Tiered pricing**:
  - Free tier → SHARP-ML only
  - Premium tier → World Labs + extras
- **Batch generation**: Multiple images
- **Custom parameters**: Resolution, quality settings

---

## Troubleshooting

### Error: "WORLD_LABS_API_KEY not configured"
**Solution**: Make sure `.env` file exists with your API key

### Error: "Failed to generate world"
**Check**:
1. World Labs API key is valid
2. You have credits remaining (6,250 available)
3. Image format is supported (jpg, png, webp)
4. Image size < 100MB

### Viewer shows black screen (World Labs)
**Check**:
1. Browser console for SPZ URL
2. Try opening SPZ URL directly
3. Verify CORS headers
4. Check if using HTTPS (not HTTP)

### Generation takes too long
**Normal**:
- SHARP-ML: ~35s
- World Labs fast: ~37s
- World Labs standard: ~5min

If longer, check network/API status.

---

## Files Modified

### Backend
- `server/services/worldlabs.ts` (NEW)
- `server/services/sharpml.ts` (NEW)
- `server/routes.ts` (UPDATED)

### Frontend
- `client/src/pages/image-to-3d.tsx` (UPDATED)

### Config
- `.env` (NEW)
- `.gitignore` (UPDATED - ignores .env)

### Test Files
- `test-worldlabs.js` (Test script)
- `test-spz-viewer.html` (Viewer compatibility test)
- `worldlabs-test-result.json` (Sample output)

---

## API Credits Status

**Current Balance**: 6,250 credits

**Estimated Usage**:
- Unknown cost per generation (need to check after first gen)
- Monitor at: https://platform.worldlabs.ai/billing

---

## Next Steps

1. ✅ Test both models in Velowen
2. Compare visual quality side-by-side
3. Track credit usage
4. Decide on default model
5. Plan tiered pricing strategy

---

**Created**: 2026-01-27
**Status**: ✅ Ready to test
**Credits**: 6,250 available
