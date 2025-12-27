/**
 * Script to generate PLY file for demo section
 * 
 * Usage:
 *   node scripts/generate-demo-ply.js <path-to-image>
 * 
 * Example:
 *   node scripts/generate-demo-ply.js public/demo/yukino.jpg
 */

const fs = require('fs');
const path = require('path');

async function generateDemoPLY(imagePath) {
  console.log('🎨 Generating 3D PLY from image:', imagePath);
  
  // Check if image exists
  if (!fs.existsSync(imagePath)) {
    console.error('❌ Image file not found:', imagePath);
    process.exit(1);
  }
  
  // Read image and convert to base64
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  
  console.log('📤 Sending image to API...');
  
  try {
    // Call the generate-3d API
    const response = await fetch('http://localhost:5000/api/generate-3d', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.plyUrl) {
      throw new Error('No PLY URL returned from API');
    }
    
    console.log('✅ PLY generated successfully!');
    console.log('📦 PLY URL:', result.plyUrl);
    console.log('');
    console.log('📝 Update src/config/demo.ts with this PLY URL:');
    console.log(`   plyUrl: "${result.plyUrl}",`);
    
    return result.plyUrl;
  } catch (error) {
    console.error('❌ Error generating PLY:', error.message);
    
    if (error.message.includes('fetch')) {
      console.error('');
      console.error('💡 Make sure your local server is running on http://localhost:5000');
      console.error('   Run: npm run dev');
    }
    
    process.exit(1);
  }
}

// Main
const imagePath = process.argv[2];

if (!imagePath) {
  console.error('❌ Please provide an image path');
  console.error('');
  console.error('Usage: node scripts/generate-demo-ply.js <path-to-image>');
  console.error('Example: node scripts/generate-demo-ply.js public/demo/yukino.jpg');
  process.exit(1);
}

generateDemoPLY(imagePath);

