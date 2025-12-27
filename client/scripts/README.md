# Demo PLY Generation

## Setup Instructions

1. **Place your Yukino image** in `public/demo/yukino.jpg`
   - Or update the path in `src/config/demo.ts`

2. **Start your local server** (if not already running):
   ```bash
   npm run dev
   ```

3. **Generate the PLY file**:
   ```bash
   node scripts/generate-demo-ply.js public/demo/yukino.jpg
   ```

4. **Update the config** with the generated PLY URL:
   - Open `src/config/demo.ts`
   - Replace `plyUrl: ""` with the URL from step 3

5. **Refresh your browser** - the demo should now work!

## Alternative: Use Production API

If you want to use the production API instead of localhost:

1. Edit `scripts/generate-demo-ply.js`
2. Change the API URL from `http://localhost:5000/api/generate-3d` to `https://velowen.art/api/generate-3d`

