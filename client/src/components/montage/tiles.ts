// Footage for the montage, built by scripts/build-clips.mjs into
// client/public/clips: wall.json plus sprite sheets of square tiles cut from
// each clip. There are no stand-in frames: until the sheets load, or if they
// can't, the montage shows nothing but plain squares.

// `image` is what the montage draws from: a fully decoded ImageBitmap where the
// browser supports it, else the <img>. `src` is the sheet URL for CSS use.
export type SheetImage = { image: CanvasImageSource; src: string; cols: number; tileW: number; tileH: number };

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

const tilesByClip = new WeakMap<Wall, number[][]>();

function variantsByClip(wall: Wall) {
  let byClip = tilesByClip.get(wall);
  if (!byClip) {
    byClip = wall.clips.map(() => []);
    wall.tiles.forEach((t, i) => byClip![t.clip].push(i));
    tilesByClip.set(wall, byClip);
  }
  return byClip;
}

// Which footage tile sits at grid cell (c, r). Clips are dealt out in a fixed
// pattern rather than at random: stepping 3 across and 7 up means
// neighbouring cells never share a clip, every clip appears equally often,
// and with 15 clips the 5×3 block of the smallest release shows each one
// exactly once. The variant (crop and moment) within a clip is hashed.
export function wallTileAt(wall: Wall, c: number, r: number) {
  const n = wall.clips.length;
  const clip = (((c * 3 + r * 7) % n) + n) % n;
  const variants = variantsByClip(wall)[clip];
  const i = variants[Math.floor(hash(c, r, 3) * variants.length)];
  return { index: i, tile: wall.tiles[i], clip: wall.clips[clip] };
}

// A representative tile for a clip: centre crop, middle moment
export function coverTile(wall: Wall, clip: number) {
  const variants = variantsByClip(wall)[clip].filter((i) => wall.tiles[i].x === 0.5);
  return variants[Math.floor(variants.length / 2)] ?? variantsByClip(wall)[clip][0];
}

export function labelAt(wall: Wall, c: number, r: number) {
  const { clip } = wallTileAt(wall, c, r);
  return { title: clip.env, task: clip.task, src: clip.src };
}

export function sheetFor(wall: Wall, px: number) {
  // Use the smallest sheet that still covers the tile's backing size
  return px > 140 ? wall.sheets[256] : px > 70 ? wall.sheets[128] : wall.sheets[64];
}

export function drawTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  c: number,
  r: number,
  wall: Wall,
) {
  const sheet = sheetFor(wall, w);
  const { index } = wallTileAt(wall, c, r);
  const sx = (index % sheet.cols) * sheet.tileW;
  const sy = Math.floor(index / sheet.cols) * sheet.tileH;
  ctx.drawImage(sheet.image, sx, sy, sheet.tileW, sheet.tileH, x, y, w, h);
}

let wallPromise: Promise<Wall | null> | null = null;

// Resolves once the image has loaded. Uses onload rather than relying on
// image.decode(), which iOS Safari can reject for large images.
function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load ${src}`));
    image.src = src;
  });
}

// iOS Safari can hand canvas an <img> whose pixels aren't decoded yet, and
// drawImage then silently draws nothing. An ImageBitmap is decoded up front,
// so draws from it always land.
async function toDrawable(image: HTMLImageElement): Promise<CanvasImageSource> {
  await image.decode?.().catch(() => {});
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(image);
    } catch {
      // fall through to the element itself
    }
  }
  return image;
}

// Loads the footage manifest and its sprite sheets once per page. Resolves to
// null when no footage is available.
export function loadWall(): Promise<Wall | null> {
  wallPromise ??= (async () => {
    try {
      // Default caching so the <link rel="preload"> in index.html is reused
      const res = await fetch("/clips/wall.json");
      if (!res.ok) return null;
      const manifest = await res.json();
      if (!manifest?.tiles?.length) return null;

      // Phones never show tiles big enough to need the 256px sheet, and it is
      // the one most likely to hit mobile decode/memory limits
      const small = window.matchMedia("(max-width: 767px)").matches;
      const sizes = (small ? [64, 128] : [64, 128, 256]) as (64 | 128 | 256)[];

      // Each sheet loads independently; one failure doesn't drop the footage
      const results = await Promise.allSettled(
        sizes.map(async (size) => {
          const s = manifest.sheets[size];
          const image = await toDrawable(await loadImage(s.src));
          return [size, { image, src: s.src, cols: s.cols, tileW: s.tileW, tileH: s.tileH }] as const;
        }),
      );
      const loaded = new Map<number, SheetImage>();
      results.forEach((r) => {
        if (r.status === "fulfilled") loaded.set(r.value[0], r.value[1]);
        else console.warn("[montage]", r.reason);
      });
      if (!loaded.size) return null;

      // Any missing size borrows the nearest one that did load
      const pick = (size: number) =>
        loaded.get(size) ??
        Array.from(loaded.entries()).sort((a, b) => Math.abs(a[0] - size) - Math.abs(b[0] - size))[0][1];

      return {
        clips: manifest.clips,
        tiles: manifest.tiles,
        preview: manifest.preview,
        sheets: { 64: pick(64), 128: pick(128), 256: pick(256) },
      };
    } catch (err) {
      console.warn("[montage] footage unavailable", err);
      return null;
    }
  })();
  return wallPromise;
}
