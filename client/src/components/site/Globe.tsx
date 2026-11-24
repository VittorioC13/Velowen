import { useEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";
import { geoDistance, geoInterpolate, geoOrthographic, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Market } from "@/content/site";

// Warm-neutral globe that matches the ivory page: oat sphere, sand land,
// ivory borders, buyer countries a shade darker and the active one in ink.
const C = {
  sphere: "#f0eee6",
  sphereEdge: "#e6e2d7",
  land: "#e1dccf",
  border: "rgba(250, 249, 245, 0.95)",
  market: "#c4bcab",
  active: "#141413",
  outline: "rgba(20, 20, 19, 0.06)",
};

const TILT = 12; // degrees: look slightly down on each country so the north reads
const FOLLOW = 7; // how quickly the globe catches up with the scroll (per second)

type Shapes = {
  countries: Map<string, GeoPermissibleObjects>;
  land: GeoPermissibleObjects;
  borders: GeoPermissibleObjects;
};

let shapesPromise: Promise<Shapes> | null = null;
function loadShapes() {
  shapesPromise ??= import("world-atlas/countries-50m.json").then((mod) => {
    const topo = (mod.default ?? mod) as unknown as Topology<{ countries: GeometryCollection; land: GeometryCollection }>;
    const countries = new Map<string, GeoPermissibleObjects>();
    for (const f of feature(topo, topo.objects.countries).features) if (f.id != null) countries.set(String(f.id), f);
    return {
      countries,
      // One merged land shape and one border mesh: each coastline and border
      // is projected once per frame instead of twice
      land: feature(topo, topo.objects.land),
      borders: mesh(topo, topo.objects.countries, (a, b) => a !== b),
    };
  });
  return shapesPromise;
}

/**
 * `position` runs from 0 to markets.length - 1; fractional values sit between
 * two countries. The globe eases toward it, so scrolling turns the planet.
 *
 * Two stacked canvases: the map is redrawn only while the view moves, and the
 * pins (with their ripple) live on a light overlay that redraws every frame.
 */
export function Globe({
  markets,
  position,
  className = "",
}: {
  markets: Market[];
  position: MotionValue<number>;
  className?: string;
}) {
  const mapRef = useRef<HTMLCanvasElement>(null);
  const pinRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const mapCanvas = mapRef.current!;
    const pinCanvas = pinRef.current!;
    const map = mapCanvas.getContext("2d")!;
    const pins = pinCanvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let shapes: Shapes | null = null;
    let raf = 0;
    let running = false;
    let inView = false;
    let last = performance.now();
    let dirty = true;

    let pos = position.get();
    let drawnPos = NaN;

    const projection = geoOrthographic().precision(1);
    const path = geoPath(projection, map);
    let w = 0, h = 0, dpr = 1;

    const viewAt = (p: number): [number, number] => {
      const n = markets.length;
      const c = Math.max(0, Math.min(n - 1, p));
      const i = Math.min(n - 2, Math.floor(c));
      return geoInterpolate(markets[i].center, markets[i + 1].center)(c - i) as [number, number];
    };
    const inkAt = (i: number) => Math.max(0, 1 - Math.abs(pos - i) * 2.2);

    const resize = () => {
      const r = mapCanvas.getBoundingClientRect();
      // 1.5x keeps edges crisp on retina while drawing ~44% fewer pixels than 2x
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = r.width;
      h = r.height;
      for (const c of [mapCanvas, pinCanvas]) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
      // Desktop: a big globe pushed right and down, cropped by the edges.
      // Mobile: centred horizontally, cropped at the bottom.
      const wide = w >= 640;
      const radius = wide ? Math.max(h * 0.62, w * 0.42) : Math.min(w * 0.66, h * 0.62);
      projection.scale(radius).translate(wide ? [w * 0.6, h * 0.54] : [w / 2, h * 0.58]);
      dirty = true;
      frame(performance.now());
    };

    const drawMap = () => {
      const view = viewAt(pos);
      projection.rotate([-view[0], -view[1] + TILT, 0]);
      map.setTransform(dpr, 0, 0, dpr, 0, 0);
      map.clearRect(0, 0, w, h);
      const [cx, cy] = projection.translate();
      const r = projection.scale();

      // Sphere with a soft limb so it reads as round, not a flat disc
      const g = map.createRadialGradient(cx - r * 0.25, cy - r * 0.3, r * 0.1, cx, cy, r);
      g.addColorStop(0, C.sphere);
      g.addColorStop(0.75, C.sphere);
      g.addColorStop(1, C.sphereEdge);
      map.beginPath();
      path({ type: "Sphere" });
      map.fillStyle = g;
      map.fill();
      map.strokeStyle = C.outline;
      map.lineWidth = 1;
      map.stroke();

      if (!shapes) return;

      map.beginPath();
      path(shapes.land);
      map.fillStyle = C.land;
      map.fill();

      markets.forEach((m, i) => {
        const f = shapes!.countries.get(m.id);
        if (!f) return;
        map.beginPath();
        path(f);
        map.fillStyle = mix(C.market, C.active, inkAt(i));
        map.fill();
      });

      map.beginPath();
      path(shapes.borders);
      map.strokeStyle = C.border;
      map.lineWidth = 0.7;
      map.stroke();
    };

    // Pins: hollow ink rings on the other buyers, a white dot with a ring
    // rippling out on the active one
    const drawPins = (now: number) => {
      pins.setTransform(dpr, 0, 0, dpr, 0, 0);
      pins.clearRect(0, 0, w, h);
      if (!shapes) return;
      const [rl, rp] = projection.rotate();
      const centre: [number, number] = [-rl, -rp];
      const pulse = reduced ? 0.4 : ((now / 1000) * 0.6) % 1;
      markets.forEach((m, i) => {
        if (geoDistance(m.center, centre) > Math.PI / 2 - 0.15) return; // hide pins sliding over the horizon
        const p = projection(m.center);
        if (!p) return;
        const a = inkAt(i);
        if (a > 0.5) {
          pins.beginPath();
          pins.arc(p[0], p[1], 6 + pulse * 12, 0, Math.PI * 2);
          pins.strokeStyle = `rgba(250, 249, 245, ${0.85 * (1 - pulse) * a})`;
          pins.lineWidth = 1.5;
          pins.stroke();
          pins.beginPath();
          pins.arc(p[0], p[1], 4.5, 0, Math.PI * 2);
          pins.fillStyle = "#fff";
          pins.fill();
        } else {
          pins.beginPath();
          pins.arc(p[0], p[1], 3.5, 0, Math.PI * 2);
          pins.fillStyle = "rgba(250, 249, 245, 0.9)";
          pins.fill();
          pins.lineWidth = 1.25;
          pins.strokeStyle = C.active;
          pins.stroke();
        }
      });
    };

    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;

      // Ease toward the scroll position (frame-rate independent)
      const target = position.get();
      pos = reduced ? target : pos + (target - pos) * (1 - Math.exp(-FOLLOW * dt));
      if (Math.abs(target - pos) < 0.0005) pos = target;

      if (dirty || pos !== drawnPos) {
        drawMap();
        drawnPos = pos;
        dirty = false;
      }
      drawPins(now);
    };

    const tick = (now: number) => {
      frame(now);
      if (running) raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        if (inView) {
          loadShapes().then((s) => {
            shapes = s;
            dirty = true;
          });
          start();
        } else stop();
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(mapCanvas);
    const ro = new ResizeObserver(resize);
    ro.observe(mapCanvas);
    const onVis = () => (document.hidden ? stop() : inView && start());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
    // markets is static content and position is a MotionValue read per frame
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={className} aria-hidden="true">
      <canvas ref={mapRef} className="absolute inset-0 h-full w-full" />
      <canvas ref={pinRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

function mix(a: string, b: string, t: number) {
  const pa = hex(a), pb = hex(b);
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}
function hex(s: string) {
  const n = parseInt(s.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
