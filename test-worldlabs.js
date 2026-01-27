/**
 * Test script for World Labs API
 * Usage: node test-worldlabs.js <image-path>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORLD_LABS_API_KEY = process.env.WORLD_LABS_API_KEY;
const BASE_URL = 'https://api.worldlabs.ai';

if (!WORLD_LABS_API_KEY) {
  console.error('❌ Error: WORLD_LABS_API_KEY not found in .env file');
  process.exit(1);
}

/**
 * Upload image and prepare for generation
 */
async function uploadImage(imagePath) {
  console.log('📤 Uploading image to World Labs...');

  // Read image file
  const imageBuffer = fs.readFileSync(imagePath);
  const imageBase64 = imageBuffer.toString('base64');
  const ext = path.extname(imagePath).toLowerCase().slice(1);

  // Prepare upload
  const fileName = path.basename(imagePath);
  const prepareResponse = await fetch(`${BASE_URL}/marble/v1/media-assets:prepare_upload`, {
    method: 'POST',
    headers: {
      'WLT-Api-Key': WORLD_LABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_name: fileName,
      file_type: ext === 'jpg' ? 'jpeg' : ext,
      kind: 'image',
    }),
  });

  if (!prepareResponse.ok) {
    const error = await prepareResponse.text();
    throw new Error(`Failed to prepare upload: ${error}`);
  }

  const prepareData = await prepareResponse.json();

  const media_asset_id = prepareData.media_asset.media_asset_id;
  const upload_url = prepareData.upload_info.upload_url;
  const upload_headers = prepareData.upload_info.required_headers;

  console.log('✅ Got upload URL, media_asset_id:', media_asset_id);

  // Upload file to signed URL
  console.log('📤 Uploading file...');
  const uploadResponse = await fetch(upload_url, {
    method: 'PUT',
    headers: upload_headers,
    body: imageBuffer,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
  }

  console.log('✅ File uploaded successfully');
  return media_asset_id;
}

/**
 * Generate world from image
 */
async function generateWorld(mediaAssetId, modelType = 'standard') {
  console.log(`🎨 Generating world with ${modelType} model...`);

  const model = modelType === 'fast' ? 'Marble 0.1-mini' : 'Marble 0.1-plus';

  const response = await fetch(`${BASE_URL}/marble/v1/worlds:generate`, {
    method: 'POST',
    headers: {
      'WLT-Api-Key': WORLD_LABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      display_name: 'Velowen Test - Anime Scene',
      model: model,
      world_prompt: {
        type: 'image',
        image_prompt: {
          source: 'media_asset',
          media_asset_id: mediaAssetId,
        },
        text_prompt: 'anime scene with detailed background',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate world: ${error}`);
  }

  const operation = await response.json();
  console.log('✅ Generation started, operation_id:', operation.operation_id);
  return operation.operation_id;
}

/**
 * Poll operation status until complete
 */
async function pollOperation(operationId) {
  console.log('⏳ Polling for completion...');

  let attempts = 0;
  const maxAttempts = 120; // 10 minutes max (5s intervals)

  while (attempts < maxAttempts) {
    const response = await fetch(`${BASE_URL}/marble/v1/operations/${operationId}`, {
      headers: {
        'WLT-Api-Key': WORLD_LABS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check operation: ${response.statusText}`);
    }

    const operation = await response.json();

    if (operation.done) {
      if (operation.error) {
        throw new Error(`Generation failed: ${JSON.stringify(operation.error)}`);
      }
      console.log('✅ Generation complete!');
      return operation;
    }

    // Show progress
    const progress = operation.metadata?.progress?.percentage || 0;
    process.stdout.write(`\r⏳ Progress: ${progress}%`);

    // Wait 5 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;
  }

  throw new Error('Timeout: Generation took too long');
}

/**
 * Get world details
 */
async function getWorld(worldId) {
  console.log('\n📦 Fetching world details...');

  const response = await fetch(`${BASE_URL}/marble/v1/worlds/${worldId}`, {
    headers: {
      'WLT-Api-Key': WORLD_LABS_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get world: ${response.statusText}`);
  }

  const world = await response.json();
  console.log('✅ World retrieved');
  return world;
}

/**
 * Main test function
 */
async function main() {
  const imagePath = process.argv[2];

  if (!imagePath) {
    console.log('Usage: node test-worldlabs.js <image-path> [model-type]');
    console.log('model-type: "standard" (default) or "fast"');
    console.log('\nExample:');
    console.log('  node test-worldlabs.js client/public/demo/yukino1.jpg');
    console.log('  node test-worldlabs.js client/public/demo/yukino1.jpg fast');
    process.exit(1);
  }

  const modelType = process.argv[3] || 'standard';

  if (!fs.existsSync(imagePath)) {
    console.error('❌ Error: Image file not found:', imagePath);
    process.exit(1);
  }

  console.log('🚀 Testing World Labs API');
  console.log('📁 Image:', imagePath);
  console.log('🎨 Model:', modelType);
  console.log('---');

  const startTime = Date.now();

  try {
    // Step 1: Upload image
    const mediaAssetId = await uploadImage(imagePath);

    // Step 2: Generate world
    const operationId = await generateWorld(mediaAssetId, modelType);

    // Step 3: Poll for completion
    const operation = await pollOperation(operationId);

    // Step 4: Get world details
    const worldId = operation.metadata.world_id;
    const world = await getWorld(worldId);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // Print results
    console.log('\n═══════════════════════════════════════');
    console.log('✅ SUCCESS!');
    console.log('═══════════════════════════════════════');
    console.log('⏱️  Duration:', duration, 'seconds');
    console.log('🆔 World ID:', worldId);
    console.log('🔗 Viewer URL:', `https://marble.worldlabs.ai/world/${worldId}`);
    console.log('\n📦 Available Assets:');

    if (world.assets) {
      // 3D Splats
      if (world.assets.splats) {
        console.log('\n  🎨 3D Gaussian Splats (SPZ):');
        Object.entries(world.assets.splats).forEach(([quality, url]) => {
          console.log(`    - ${quality}: ${url}`);
        });
      }

      // Mesh
      if (world.assets.mesh) {
        console.log('\n  🗿 Mesh (GLB):');
        console.log(`    - ${world.assets.mesh}`);
      }

      // Panorama
      if (world.assets.panorama_image) {
        console.log('\n  🖼️  Panorama Image:');
        console.log(`    - ${world.assets.panorama_image}`);
      }

      // Thumbnail
      if (world.thumbnail_url) {
        console.log('\n  🖼️  Thumbnail:');
        console.log(`    - ${world.thumbnail_url}`);
      }
    }

    console.log('\n💡 Next Steps:');
    console.log('  1. Open viewer URL in browser');
    console.log('  2. Download SPZ file and test in Velowen viewer');
    console.log('  3. Compare quality vs SHARP-ML output');
    console.log('═══════════════════════════════════════\n');

    // Save results to file
    const resultsPath = path.join(__dirname, 'worldlabs-test-result.json');
    fs.writeFileSync(resultsPath, JSON.stringify(world, null, 2));
    console.log('📄 Full results saved to:', resultsPath);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
