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

// Capture capacity and in-stock inventory, from the dataset price sheet
// (EUR price sheet, Nov 2026). Hours are validated, ready to deliver.
export const capacity = {
  weeklyHours: 200, // new egocentric hours produced per week
};

export type Device = { name: string; kind: string; hours: number };
export type DeviceGroup = { id: string; name: string; about: string; devices: Device[] };

export const deviceGroups: DeviceGroup[] = [
  {
    id: "ego",
    name: "Egocentric",
    about: "Worn by people, first person",
    devices: [
      { name: "PICO 4 Ultra", kind: "Head-mounted stereo", hours: 50000 },
      { name: "GoPro HERO9 Black", kind: "Head-mounted monocular", hours: 30000 },
      { name: "LivSyn LivUMI-Ego Plus", kind: "Stereo RGB + IMU", hours: 10000 },
      { name: "Six-camera rig", kind: "Head-mounted, hand tracking + IMU", hours: 8000 },
    ],
  },
  {
    id: "umi",
    name: "UMI",
    about: "Handheld gripper, robot-ready actions",
    devices: [{ name: "SeerFusion One", kind: "Six cameras + gripper", hours: 70000 }],
  },
  {
    id: "robot",
    name: "Robot teleoperation",
    about: "Recorded on real robots",
    devices: [
      { name: "LinkerBot Linker Humanoid", kind: "Dual-arm, dexterous hands", hours: 10000 },
      { name: "DexTeleop TA2", kind: "Wheeled dual-arm", hours: 4113 },
      { name: "X Square Quanta X1 Pro", kind: "Wheeled dual-arm", hours: 4000 },
      { name: "Zerith H1 Pro", kind: "Wheeled dual-arm", hours: 585 },
      { name: "AgiBot G1", kind: "Wheeled dual-arm", hours: 500 },
      { name: "AgiBot X2", kind: "Bipedal humanoid", hours: 200 },
      { name: "Unitree G1-D", kind: "Wheeled dual-arm", hours: 200 },
      { name: "AgiBot G2", kind: "Wheeled dual-arm", hours: 100 },
      { name: "AgiBot A2", kind: "Bipedal humanoid", hours: 100 },
      { name: "Ligong Lidian F1", kind: "Wheeled dual-arm", hours: 38 },
      { name: "LimX Oli", kind: "Bipedal humanoid", hours: 20 },
    ],
  },
];

export const groupHours = (g: DeviceGroup) => g.devices.reduce((s, d) => s + d.hours, 0);
export const totalHours = deviceGroups.reduce((s, g) => s + groupHours(g), 0);
export const deviceCount = deviceGroups.reduce((s, g) => s + g.devices.length, 0);
