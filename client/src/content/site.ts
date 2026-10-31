// Single source for site copy and dataset facts. Edit here, not in components.
// Items marked "confirm" follow build.ai's published pattern and still need
// Velowen's own numbers.

export const CALENDLY_URL = "https://calendly.com/victorche";

export const site = {
  name: "Velowen",
  tagline: "The data hyperscaler for physical AI.",
  hero: {
    title: "The human labor dataset\nfor Physical AI",
    subtitle:
      "We capture real work, first person, in real factories and labs, and train models alongside the data.",
  },
  mission: [
    { text: "Solve " },
    { text: "physical labor", color: "#46ccbd" },
    { text: " by " },
    { text: "hyperscaling data", color: "#7cbffe" },
    { text: "." },
  ],
};

export type Release = {
  id: string;
  name: string;
  scale: string; // label on the montage
  date: string;
  status: "launching" | "goal";
};

export const releases: Release[] = [
  { id: "10k", name: "Egocentric-10K", scale: "10K", date: "Dec '26", status: "launching" },
  { id: "100k", name: "Egocentric-100K", scale: "100K", date: "—", status: "goal" },
  { id: "1m", name: "Egocentric-1M", scale: "1M", date: "—", status: "goal" },
  { id: "10m", name: "Egocentric-10M", scale: "10M", date: "—", status: "goal" },
];

export type Environment = {
  id: string;
  name: string;
  short: string;
  tasks: string[];
  tag: string; // pastel tag color
  tint: string; // card wash
  tone: [number, number, number]; // placeholder tile base color
};

export const environments: Environment[] = [
  {
    id: "kraft",
    name: "Kraft paper bag factory",
    short: "Paper bags",
    tasks: ["Bag folding", "Handle gluing", "Bundling & stacking"],
    tag: "#eac976",
    tint: "#fafbeb",
    tone: [176, 140, 98],
  },
  {
    id: "lab",
    name: "School science lab",
    short: "Science lab",
    tasks: ["Pipetting", "Glassware handling", "Bench setup"],
    tag: "#a1a6cb",
    tint: "#ecf4ff",
    tone: [150, 162, 176],
  },
  {
    id: "rubber",
    name: "Rubber factory",
    short: "Rubber",
    tasks: ["Mold loading", "Trimming", "Quality sorting"],
    tag: "#90b9ab",
    tint: "#ebf5ef",
    tone: [92, 88, 84],
  },
  {
    id: "semi",
    name: "Semiconductor factory",
    short: "Semiconductor",
    tasks: ["Wafer handling", "Tray loading", "Inspection"],
    tag: "#7cbffe",
    tint: "#ecf4ff",
    tone: [168, 176, 190],
  },
  {
    id: "plastic",
    name: "Plastic factory",
    short: "Plastics",
    tasks: ["Injection unloading", "Deburring", "Packing"],
    tag: "#ea7c76",
    tint: "#fcf6f9",
    tone: [150, 128, 120],
  },
  {
    id: "mask",
    name: "Face mask factory",
    short: "Face masks",
    tasks: ["Ear-loop welding", "Folding", "Boxing"],
    tag: "#a08ed0",
    tint: "#f9f3ff",
    tone: [186, 190, 196],
  },
  {
    id: "cafe",
    name: "Café",
    short: "Café",
    tasks: ["Espresso prep", "Milk steaming", "Plating"],
    tag: "#e8c1a6",
    tint: "#fff6ec",
    tone: [140, 104, 80],
  },
];

export type SpecRow = { label: string; value: string; note?: string; confirm?: boolean };

export const spec10k: SpecRow[] = [
  { label: "Hours", value: "10,000" },
  { label: "Frames", value: "≈1.08 billion", note: "10,000 h at 30 fps" },
  { label: "Environments", value: "20+ real worksites" },
  { label: "Device", value: "Monocular head-mounted camera", confirm: true },
  { label: "Format", value: "1920×1080, 30 fps", confirm: true },
  { label: "Annotations", value: "3D hand pose", confirm: true },
  { label: "Packaging", value: "WebDataset shards (mp4 + json), per-worker intrinsics", confirm: true },
  { label: "License", value: "Apache 2.0", confirm: true },
  { label: "Availability", value: "December 2026, gated on Hugging Face", confirm: true },
];

export const pillars = [
  {
    id: "data",
    title: "Data",
    body: "Head-mounted capture across real worksites, with consent, calibration and QA built into every shift.",
    rows: [
      ["Capture", "Egocentric video"],
      ["Sites", "20+ worksites"],
      ["Hours", "10,000 and scaling"],
    ],
  },
  {
    id: "models",
    title: "Models",
    body: "We train on what we collect, so every release is shaped by what manipulation models actually need.",
    rows: [
      ["Focus", "Hands, tools, objects"],
      ["Signals", "Pose, contact, task"],
      ["Loop", "Data ↔ model, in parallel"],
    ],
  },
] as const;

export const nav = [
  { label: "Mission", href: "/#mission" },
  { label: "Data", href: "/data" },
];
