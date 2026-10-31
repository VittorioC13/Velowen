// Builds the montage assets from raw clips.
//
//   clips-source/clips.json   list of clips with env/task labels
//   clips-source/*.mp4|mov    raw footage (git-ignored)
//
// Outputs to client/public/clips/:
//   previews/<id>.mp4          640x360 H.264 loop per clip (live tiles, hover card)
//   sheet-64|128|256.webp      sprite sheets of square tiles
//   wall.json                  manifest read by the montage
//
// Each clip yields several tiles: square crops (left/centre/right) taken at
// a few moments, so a handful of clips still fills the wall with variety.
// Only clips marked "egocentric": true go on the wall.
//
// Usage: node scripts/build-clips.mjs   (needs ffmpeg + ffprobe on PATH)

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
const SRC = path.join(ROOT, "clips-source");
const OUT = path.join(ROOT, "client", "public", "clips");
const TMP = path.join(SRC, "_tiles");
const PREVIEW_W = 640;
const PREVIEW_H = 360;
const PREVIEW_SECONDS = 4;
const CROPS = [0, 0.5, 1]; // horizontal position of the square crop
const SIZES = [64, 128, 256];
const COLS = 15;

const run = (cmd, args) => execFileSync(cmd, args, { stdio: ["ignore", "pipe", "pipe"] }).toString();

function duration(file) {
  return parseFloat(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]));
}

const list = JSON.parse(fs.readFileSync(path.join(SRC, "clips.json"), "utf8")).filter((c) => c.egocentric);
if (!list.length) throw new Error("No clips marked egocentric in clips-source/clips.json");

// Frames sampled per crop: aim for ~180 tiles total so sheets stay light
const MOMENTS = Math.max(2, Math.min(6, Math.round(180 / (list.length * CROPS.length))));

fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });
fs.mkdirSync(path.join(OUT, "previews"), { recursive: true });

const clips = [];
const tiles = [];

list.forEach((clip, ci) => {
  const input = path.join(SRC, clip.file);
  const id = `c${String(ci + 1).padStart(3, "0")}`;
  const preview = path.join(OUT, "previews", `${id}.mp4`);
  const len = Math.min(duration(input), PREVIEW_SECONDS);

  // Muted, web-safe 16:9 loop
  run("ffmpeg", [
    "-v", "error", "-y", "-i", input, "-t", String(len), "-an",
    "-vf", `scale=${PREVIEW_W}:${PREVIEW_H}:force_original_aspect_ratio=increase,crop=${PREVIEW_W}:${PREVIEW_H},fps=30`,
    "-c:v", "libx264", "-profile:v", "main", "-pix_fmt", "yuv420p", "-crf", "27", "-preset", "slow",
    "-movflags", "+faststart", preview,
  ]);
  clips.push({ id, src: `/clips/previews/${id}.mp4`, env: clip.env, task: clip.task });

  for (const x of CROPS) {
    for (let m = 0; m < MOMENTS; m++) {
      const t = 0.2 + ((len - 0.4) * m) / Math.max(1, MOMENTS - 1);
      const n = String(tiles.length).padStart(4, "0");
      const left = Math.round(x * (PREVIEW_W - PREVIEW_H));
      run("ffmpeg", [
        "-v", "error", "-y", "-ss", t.toFixed(2), "-i", preview, "-frames:v", "1",
        "-vf", `crop=${PREVIEW_H}:${PREVIEW_H}:${left}:0,scale=256:256`,
        path.join(TMP, `t${n}.png`),
      ]);
      tiles.push({ clip: ci, x, t: +t.toFixed(2) });
    }
  }
  console.log(`${id}  ${clip.env} / ${clip.task}  -> ${CROPS.length * MOMENTS} tiles`);
});

const rows = Math.ceil(tiles.length / COLS);
const sheets = {};
for (const size of SIZES) {
  const file = `sheet-${size}.webp`;
  run("ffmpeg", [
    "-v", "error", "-y", "-framerate", "1", "-i", path.join(TMP, "t%04d.png"),
    "-vf", `scale=${size}:${size},tile=${COLS}x${rows}`,
    "-frames:v", "1", "-c:v", "libwebp", "-quality", "82", path.join(OUT, file),
  ]);
  sheets[size] = { src: `/clips/${file}`, cols: COLS, tileW: size, tileH: size, count: tiles.length };
}

fs.writeFileSync(
  path.join(OUT, "wall.json"),
  JSON.stringify({ version: 1, preview: { w: PREVIEW_W, h: PREVIEW_H }, clips, tiles, sheets }, null, 2),
);
fs.rmSync(TMP, { recursive: true, force: true });
console.log(`wall.json: ${clips.length} clips, ${tiles.length} tiles`);
