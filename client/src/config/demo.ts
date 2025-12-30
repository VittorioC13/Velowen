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
    imageUrl: "/demo/1c190a2383579dd8677b1800cc37ff50.jpg",
    plyUrl: "", // Will auto-generate on click
  },
  {
    imageUrl: "/demo/2984ce593957345586ff4f3363105438.jpg",
    plyUrl: "", // Will auto-generate on click
  },
  {
    imageUrl: "/demo/361f97d61c720cbb64f00315b215f1ce.jpg",
    plyUrl: "", // Will auto-generate on click
  },
  {
    imageUrl: "/demo/a1b9ac03d9ecc4cddc9f036f79eb8b98.jpg",
    plyUrl: "", // Will auto-generate on click
  },
  {
    imageUrl: "/demo/aa94c15c77636d395d31a6809a626ca3.jpg",
    plyUrl: "", // Will auto-generate on click
  },
  {
    imageUrl: "/demo/dc8ebde3a7432c297d89cb5c4bdedb15.jpg",
    plyUrl: "", // Will auto-generate on click
  },
  {
    imageUrl: "/demo/ecabe19e42eb1f777aca49b95a4228cd.jpg",
    plyUrl: "", // Will auto-generate on click
  },
];

