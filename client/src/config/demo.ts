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
    imageUrl: "/demo/yukino 1.jpg",
    plyUrl: "", // Will auto-generate on click
  },
  {
    imageUrl: "/demo/yukino 2.jpg",
    plyUrl: "", // Will auto-generate on click
  },
  {
    imageUrl: "/demo/yukino 3.jpg",
    plyUrl: "", // Will auto-generate on click
  },
  {
    imageUrl: "/demo/yukino 4.jpg",
    plyUrl: "", // Will auto-generate on click
  },
  {
    imageUrl: "/demo/yukino 5.jpg",
    plyUrl: "", // Will auto-generate on click
  },
  {
    imageUrl: "/demo/yukino 6.jpg",
    plyUrl: "", // Will auto-generate on click
  },
  {
    imageUrl: "/demo/yukino 7.jpg",
    plyUrl: "", // Will auto-generate on click
  },
  {
    imageUrl: "/demo/yukino 8.jpg",
    plyUrl: "", // Will auto-generate on click
  },
];

