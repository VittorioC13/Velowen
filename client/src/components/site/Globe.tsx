import { useEffect, useRef } from "react";
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

const MOVE_MS = 1700;
const DRIFT_DEG_PER_S = 1.6;
const TILT = 12; // degrees: look slightly down on each country so the north reads

type Shapes = {
  countries: Map<string, GeoPermissibleObjects>;
  all: GeoPermissibleObjects;
  borders: GeoPermissibleObjects;
};

let shapesPromise: Promise<Shapes> | null = null;
function loadShapes() {
  shapesPromise ??= import("world-atlas/countries-50m.json").then((mod) => {
    const topo = (mod.default ?? mod) as unknown as Topology<{ countries: GeometryCollection }>;
    const fc = feature(topo, topo.objects.countries);
    const countries = new Map<string, GeoPermissibleObjects>();
    for (const f of fc.features) if (f.id != null) countries.set(String(f.id), f);
    return { countries, all: fc, borders: mesh(topo, topo.objects.countries, (a, b) => a !== b) };
  });
  return shapesPromise;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function Globe({ markets, active, className = "" }: { markets: Market[]; active: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let shapes: Shapes | null = null;
    let raf = 0;
    let visible = false;
    let inView = false;
    let last = performance.now();

    // View state: the point at the centre of the globe, [lon, lat]
    let view: [number, number] = [...markets[active].center];
    let from: [number, number] = view;
    let to: [number, number] = view;
    let moveStart = -Infinity;
    let shown = active;
    // 0..1 ink level per market, eased toward the active one
    const ink: number[] = markets.map((_, i) => (i === active ? 1 : 0));

    const projection = geoOrthographic().precision(0.4);
    const path = geoPath(projection, ctx);
    let w = 0, h = 0, dpr = 1;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      // Desktop: a big globe pushed right and down, cropped by the edges.
      // Mobile: centred horizontally, cropped at the bottom.
      const wide = w >= 640;
      const radius = wide ? Math.max(h * 0.62, w * 0.42) : Math.min(w * 0.66, h * 0.62);
      projection.scale(radius).translate(wide ? [w * 0.6, h * 0.54] : [w / 2, h * 0.58]);
      draw();
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      projection.rotate([-view[0], -view[1] + TILT, 0]);
      const [cx, cy] = projection.translate();
      const r = projection.scale();

      // Sphere with a soft limb so it reads as round, not a flat disc
      const g = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.3, r * 0.1, cx, cy, r);
      g.addColorStop(0, C.sphere);
      g.addColorStop(0.75, C.sphere);
      g.addColorStop(1, C.sphereEdge);
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = C.outline;
      ctx.lineWidth = 1;
      ctx.stroke();

      if (!shapes) return;

      ctx.beginPath();
      path(shapes.all);
      ctx.fillStyle = C.land;
      ctx.fill();

      markets.forEach((m, i) => {
        const f = shapes!.countries.get(m.id);
        if (!f) return;
        ctx.beginPath();
        path(f);
        ctx.fillStyle = mix(C.market, C.active, ink[i]);
        ctx.fill();
      });

      ctx.beginPath();
      path(shapes.borders);
      ctx.strokeStyle = C.border;
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // Pins: hollow ink rings on the other buyers, a white dot with a
      // rippling ring on the active one
      const centre: [number, number] = [view[0], view[1] - TILT];
      const t = performance.now() / 1000;
      markets.forEach((m, i) => {
        if (geoDistance(m.center, centre) > Math.PI / 2 - 0.05) return;
        const p = projection(m.center);
        if (!p) return;
        const a = ink[i];
        if (a > 0.5) {
          const pulse = reduced ? 0.4 : (t * 0.6) % 1; // ripple outward every ~1.7s
          ctx.beginPath();
          ctx.arc(p[0], p[1], 6 + pulse * 12, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(250, 249, 245, ${0.85 * (1 - pulse) * a})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(p[0], p[1], 4.5, 0, Math.PI * 2);
          ctx.fillStyle = "#fff";
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p[0], p[1], 3.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(250, 249, 245, 0.9)";
          ctx.fill();
          ctx.lineWidth = 1.25;
          ctx.strokeStyle = C.active;
          ctx.stroke();
        }
      });
    };

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;

      const target = activeRef.current;
      if (target !== shown) {
        shown = target;
        from = view;
        to = [...markets[target].center];
        moveStart = now;
      }

      const k = reduced ? 1 : Math.min(1, (now - moveStart) / MOVE_MS);
      if (k < 1) {
        // Travel along the great circle between the two countries
        view = geoInterpolate(from, to)(easeInOut(k)) as [number, number];
      } else if (!reduced) {
        // Arrived: keep turning gently, like the planet does
        to = [to[0] + DRIFT_DEG_PER_S * dt, to[1]];
        view = to;
      } else {
        view = to;
      }

      const step = reduced ? 1 : Math.min(1, dt * 3.5);
      ink.forEach((v, i) => (ink[i] = v + ((i === shown ? 1 : 0) - v) * step));

      draw();
      if (visible) raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (visible) return;
      visible = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      visible = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        if (inView) {
          loadShapes().then((s) => {
            shapes = s;
            draw();
          });
          start();
        } else stop();
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onVis = () => (document.hidden ? stop() : inView && start());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
    // markets is static content; the active index is read through a ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
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
