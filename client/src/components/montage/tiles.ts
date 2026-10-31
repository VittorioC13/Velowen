import { environments, type Environment } from "@/content/site";

// Tiles come from real footage when client/public/clips/wall.json exists
// (built by scripts/build-clips.mjs). Until then, procedural placeholder
// frames stand in: a first-person view down onto a workbench, tinted per
// environment, footage-shaped without pretending to be real footage.

type SheetImage = { image: HTMLImageElement; cols: number; tileW: number; tileH: number };

export type WallClip = { id: string; src: string; env: string; task: string };
export type WallTile = { clip: number; x: number; t: number };

export type Wall = {
  clips: WallClip[];
  tiles: WallTile[];
  preview: { w: number; h: number };
  sheets: Record<64 | 128 | 256, SheetImage>;
};

export function hash(a: number, b: number, salt = 0) {
  let h = (a * 374761393 + b * 668265263 + salt * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

export function envFor(c: number, r: number) {
  return environments[Math.floor(hash(c, r, 7) * environments.length)];
}

const tilesByClip = new WeakMap<Wall, number[][]>();

// Which footage tile sits at grid cell (c, r). Clips are dealt out in a fixed
// pattern rather than at random: stepping 3 across and 7 up means
// neighbouring cells never share a clip, every clip appears equally often,
// and with 15 clips the 5×3 block of the smallest release shows each one
// exactly once. The variant (crop and moment) within a clip is hashed.
export function wallTileAt(wall: Wall, c: number, r: number) {
  let byClip = tilesByClip.get(wall);
  if (!byClip) {
    byClip = wall.clips.map(() => []);
    wall.tiles.forEach((t, i) => byClip![t.clip].push(i));
    tilesByClip.set(wall, byClip);
  }
  const n = wall.clips.length;
  const clip = (((c * 3 + r * 7) % n) + n) % n;
  const variants = byClip[clip];
  const i = variants[Math.floor(hash(c, r, 3) * variants.length)];
  return { index: i, tile: wall.tiles[i], clip: wall.clips[clip] };
}

// Label for the hover card, from footage or the placeholder environment
export function labelAt(wall: Wall | null, c: number, r: number) {
  if (wall) {
    const { clip } = wallTileAt(wall, c, r);
    return { title: clip.env, task: clip.task, src: clip.src };
  }
  const env = envFor(c, r);
  return { title: env.short, task: env.tasks[(c * 7 + r * 3) % env.tasks.length], src: null };
}

const SKIN = ["#c99a7a", "#b07e60", "#e0b49a", "#8d5f45", "#d8a585"];
const GLOVE = ["#dfe7f2", "#8fb3d9", "#e9eef3"];
const GLOVED = new Set(["semi", "mask", "lab"]);

function shade([r, g, b]: [number, number, number], k: number, a = 1) {
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgba(${f(r)},${f(g)},${f(b)},${a})`;
}

export function drawTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  c: number,
  r: number,
  t = 0,
  wall?: Wall | null,
  envOverride?: Environment,
) {
  if (wall) {
    // Use the smallest sheet that still covers the tile's backing size
    const sheet = w > 140 ? wall.sheets[256] : w > 70 ? wall.sheets[128] : wall.sheets[64];
    const { index } = wallTileAt(wall, c, r);
    const sx = (index % sheet.cols) * sheet.tileW;
    const sy = Math.floor(index / sheet.cols) * sheet.tileH;
    ctx.drawImage(sheet.image, sx, sy, sheet.tileW, sheet.tileH, x, y, w, h);
    return;
  }

  const env = envOverride ?? envFor(c, r);
  const tone = env.tone;
  const n = hash(c, r, 11);
  const light = 0.92 + n * 0.22;

  // Back wall to bench
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, shade(tone, light * 1.18));
  g.addColorStop(0.42, shade(tone, light));
  g.addColorStop(1, shade(tone, light * 0.72));
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);

  if (w < 14) return;

  // Bench edge
  const benchY = y + h * (0.36 + hash(c, r, 5) * 0.14);
  ctx.fillStyle = shade(tone, light * 0.84, 0.9);
  ctx.beginPath();
  ctx.moveTo(x, benchY + h * 0.04);
  ctx.lineTo(x + w, benchY - h * 0.03);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();

  // Work pieces
  const pieces = 1 + Math.floor(hash(c, r, 13) * 3);
  for (let i = 0; i < pieces; i++) {
    const px = x + w * (0.15 + hash(c, r, 20 + i) * 0.65);
    const py = benchY + h * (0.08 + hash(c, r, 30 + i) * 0.22);
    const pw = w * (0.1 + hash(c, r, 40 + i) * 0.16);
    const ph = h * (0.07 + hash(c, r, 50 + i) * 0.1);
    ctx.fillStyle = i === 0 ? env.tag : shade(tone, 1.35, 0.85);
    ctx.globalAlpha = 0.75;
    ctx.fillRect(px, py, pw, ph);
    ctx.globalAlpha = 1;
  }

  // Hands as soft, out-of-focus shapes entering from the bottom edge, placed
  // irregularly so the wall never reads as a repeated pattern. They drift a
  // little over time on live tiles.
  const gloved = GLOVED.has(env.id);
  const hand = gloved
    ? GLOVE[Math.floor(hash(c, r, 60) * GLOVE.length)]
    : SKIN[Math.floor(hash(c, r, 61) * SKIN.length)];
  const phase = hash(c, r, 62) * Math.PI * 2;
  const count = hash(c, r, 63) < 0.3 ? 1 : 2;
  for (let k = 0; k < count; k++) {
    const hx = count === 1 ? 0.3 + hash(c, r, 64) * 0.4 : k ? 0.55 + hash(c, r, 65) * 0.3 : 0.15 + hash(c, r, 66) * 0.3;
    const hy = 0.62 + hash(c, r, 67 + k) * 0.28;
    const cx = x + w * hx + Math.sin(t * 1.3 + phase + k * 2) * w * 0.04;
    const cy = y + h * hy + Math.cos(t * 1.1 + phase + k) * h * 0.03;
    const rad = Math.min(w, h) * (0.16 + hash(c, r, 70 + k) * 0.08);

    // forearm: a soft wash running off the bottom edge
    const arm = ctx.createLinearGradient(cx, cy, cx + (hx - 0.5) * w * 0.4, y + h);
    arm.addColorStop(0, shade(tone, 0.62, 0.0));
    arm.addColorStop(0.35, shade(tone, 0.6, 0.35));
    arm.addColorStop(1, shade(tone, 0.55, 0.5));
    ctx.fillStyle = arm;
    ctx.beginPath();
    ctx.moveTo(cx - rad * 0.7, cy);
    ctx.lineTo(cx + rad * 0.7, cy);
    ctx.lineTo(cx + (hx - 0.5) * w * 0.4 + rad * 1.1, y + h);
    ctx.lineTo(cx + (hx - 0.5) * w * 0.4 - rad * 1.1, y + h);
    ctx.closePath();
    ctx.fill();

    // hand: radial falloff instead of a hard edge
    const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    g2.addColorStop(0, hand);
    g2.addColorStop(0.55, hand);
    g2.addColorStop(1, hand + "00");
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = g2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rad, rad * 0.8, (hx - 0.5) * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Fisheye vignette
  const v = ctx.createRadialGradient(x + w / 2, y + h / 2, Math.min(w, h) * 0.25, x + w / 2, y + h / 2, Math.max(w, h) * 0.75);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(20,16,12,0.28)");
  ctx.fillStyle = v;
  ctx.fillRect(x, y, w, h);
}

let wallPromise: Promise<Wall | null> | null = null;

// Loads the footage manifest and its sprite sheets once per page. Resolves to
// null (placeholders stay) when no clips have been built yet.
export function loadWall(): Promise<Wall | null> {
  wallPromise ??= (async () => {
    try {
      const res = await fetch("/clips/wall.json", { cache: "no-cache" });
      if (!res.ok) return null;
      const manifest = await res.json();
      if (!manifest?.tiles?.length) return null;
      const sizes = [64, 128, 256] as const;
      const images = await Promise.all(
        sizes.map(async (size) => {
          const s = manifest.sheets[size];
          const image = new Image();
          image.src = s.src;
          await image.decode();
          return { image, cols: s.cols, tileW: s.tileW, tileH: s.tileH };
        }),
      );
      return {
        clips: manifest.clips,
        tiles: manifest.tiles,
        preview: manifest.preview,
        sheets: { 64: images[0], 128: images[1], 256: images[2] },
      };
    } catch {
      return null;
    }
  })();
  return wallPromise;
}
