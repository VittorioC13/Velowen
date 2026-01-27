/**
 * Demo configuration
 *
 * To set up the demo:
 * 1. Place your demo image in public/demo/ folder
 * 2. Generate the PLY file using the generate-demo-ply script (optional)
 * 3. Update the plyUrl below with the generated PLY URL (optional - will auto-generate on click)
 */

export interface DemoItem {
  imageUrl: string;
  plyUrl?: string;
}

export const DEMO_ITEMS: DemoItem[] = [
  {
    imageUrl: "/demo/yukino1.jpg",
    plyUrl: "",
  },
  {
    imageUrl: "/demo/yukino2.jpg",
    plyUrl: "",
  },
  {
    imageUrl: "/demo/yukino3.jpg",
    plyUrl: "",
  },
  {
    imageUrl: "/demo/yukino4.jpg",
    plyUrl: "",
  },
  {
    imageUrl: "/demo/yukino5.jpg",
    plyUrl: "",
  },
  {
    imageUrl: "/demo/yukino6.jpg",
    plyUrl: "",
  },
  {
    imageUrl: "/demo/yukino7.jpg",
    plyUrl: "",
  },
  {
    imageUrl: "/demo/yukino8.jpg",
    plyUrl: "",
  },
];

