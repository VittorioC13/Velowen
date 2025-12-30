/**
 * Demo configuration
 * 
 * To set up the demo:
 * 1. Place your demo image in public/demo/yukino.jpg (or update the path below)
 * 2. Generate the PLY file using the generate-demo-ply script
 * 3. Update the plyUrl below with the generated PLY URL
 */

export interface DemoItem {
  imageUrl: string;
  plyUrl?: string;
  title?: string;
}

export const DEMO_ITEMS: DemoItem[] = [
  {
    imageUrl: "/demo/yukino.jpg",
    plyUrl: "", // Will auto-generate on click
  },
  {
    imageUrl: "/demo/yukino 2.jpg",
    plyUrl: "", // Will auto-generate on click
  },
];

