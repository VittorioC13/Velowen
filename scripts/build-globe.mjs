// Builds the globe's map data: world-atlas 50m countries, simplified so the
// globe can be redrawn every frame while it turns. Run: node scripts/build-globe.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { presimplify, simplify, quantile } from "topojson-simplify";
import { quantize } from "topojson-client";

const require = createRequire(import.meta.url);
const src = JSON.parse(readFileSync(require.resolve("world-atlas/countries-50m.json"), "utf8"));
const KEEP = 0.12; // weight quantile: higher keeps more detail and costs more per frame

const pre = presimplify(src);
const out = quantize(simplify(pre, quantile(pre, KEEP)), 1e5);
// presimplify adds a z weight to each point; drop it before writing
for (const arc of out.arcs) for (const p of arc) p.length = 2;
const file = "client/src/content/globe-countries.json";
writeFileSync(file, JSON.stringify(out));
console.log(file, (JSON.stringify(out).length / 1024).toFixed(0), "KB");
