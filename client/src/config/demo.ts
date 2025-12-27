/**
 * Demo configuration
 * 
 * To set up the demo:
 * 1. Place your demo image in public/demo/yukino.jpg (or update the path below)
 * 2. Generate the PLY file using the generate-demo-ply script
 * 3. Update the plyUrl below with the generated PLY URL
 */

export const DEMO_CONFIG = {
  // Path to the 2D demo image (relative to public folder)
  // Place your Yukino image at: public/demo/yukino.jpg
  imageUrl: "/demo/yukino.jpg",
  
  // URL to the pre-generated PLY file
  // Generate this by running: node scripts/generate-demo-ply.js public/demo/yukino.jpg
  // Then update this URL with the result
  plyUrl: "", // Will be set after generation
  
  title: "Yukino's Winter World",
  description: "Click the image to see how we transform 2D photos into interactive 3D worlds",
};

