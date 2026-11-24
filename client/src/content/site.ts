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

export const backer = { name: "Spark Lab", href: "https://www.sparklab.city/" };

// Ant Group's ramp, month by month. Month 3 is a range and recurs.
export const anchorCustomer = {
  name: "Ant Group",
  about: "Tier-1 world model and robotics firm in China",
  ramp: [
    { month: "Month 1", hours: 100, label: "100", note: "Pilot collection" },
    { month: "Month 2", hours: 1000, label: "1,000", growth: "10×", note: "Scaled order" },
    { month: "Month 3", hours: 3000, upTo: 5000, label: "3,000–5,000", growth: "3–5×", note: "Stable recurring order" },
  ],
};

export const orders = [
  { name: "Hangzhou Lingka Technology", city: "Hangzhou", hours: "1,000 h" },
  { name: "Otus Intelligent Technology", city: "Shanghai", hours: "1,000 h", note: "500 h manufacturing + 500 h retail" },
  { name: "Shanghai Jinzhun Qianzhan Data Technology", city: "Shanghai", hours: "1,000 h" },
];

export const dental = {
  status: "In development",
  clinics: {
    count: 5,
    city: "Shanghai",
    names: ["Ya Le Dental", "New Smile Dental", "Fuan Dental", "Songjing Dental", "Kainos Dental"],
  },
  rows: [
    ["Dataset", "The dental industry's egocentric dataset"],
    ["Model", "Healthcare and dental physical AI"],
  ],
} as const;

export const nav = [
  { label: "Mission", href: "/#mission" },
  { label: "Traction", href: "/#traction" },
  { label: "Buyers", href: "/#buyers" },
  { label: "Data", href: "/data" },
  { label: "Dental", href: "/dental" },
  { label: "Supporters", href: "/#supporters" },
];

// Buyer markets shown on the home page globe, in the order the globe visits them.
// `id` is the ISO 3166-1 numeric code used by world-atlas.
export type Market = {
  id: string;
  name: string;
  flag: "es" | "jp" | "de" | "se" | "cn";
  focus: string;
  // Where the globe should centre: [longitude, latitude]
  center: [number, number];
};

export const markets: Market[] = [
  { id: "724", name: "Spain", flag: "es", focus: "Supermarket shelf replenishment", center: [-3.7, 40.2] },
  { id: "276", name: "Germany", flag: "de", focus: "Agriculture", center: [10.4, 51.1] },
  { id: "752", name: "Sweden", flag: "se", focus: "General task families", center: [16.3, 62.5] },
  { id: "156", name: "China", flag: "cn", focus: "Semiconductor manufacturing, dental clinics", center: [104.2, 35.9] },
  { id: "392", name: "Japan", flag: "jp", focus: "Industrial and automobile repair", center: [138.3, 36.6] },
];
