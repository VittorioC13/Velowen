import { useEffect, useRef, useState } from "react";
import { drawTile, labelAt, loadWall, wallTileAt, type Wall } from "./tiles";
import { releases } from "@/content/site";

// Nested-scale montage in the spirit of build.ai: every release is a 16:9
// block of tiles anchored bottom-left inside the next one up.
//
// Each level is rasterised once into its own on-screen canvas. Zooming never
// repaints those canvases: a single CSS transform on the wrapper scales them
// all, so the GPU composites every frame and motion stays at display rate.
// Only the handful of "live" tiles are repainted, in place, each frame, from
// the clip's playing preview video.
//
// Nothing is drawn until the footage has loaded; the montage then fades in
// and starts its tour. If footage can't load, it shows plain squares.

const WIDTHS = [5, 16, 50, 160]; // tiles across, per level (≈ √10 apart)
const ASPECT = 9 / 16;
const HEIGHTS = WIDTHS.map((w) => Math.round(w * ASPECT));
const TILE_PX = [320, 128, 40, 12.8]; // backing pixels per tile, per level
const REST = 1; // level the montage settles on
const BG = "#fbfaf7";
const EMPTY = "#efece6";
const WASH = "rgba(247, 245, 240, 0.8)";
const LIVE = 6;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function levelOf(c: number, r: number) {
  for (let k = 0; k < WIDTHS.length; k++) if (c < WIDTHS[k] && r < HEIGHTS[k]) return k;
  return WIDTHS.length - 1;
}

function viewWidth(v: number) {
  const k = Math.min(Math.floor(v), WIDTHS.length - 2);
  const f = v - k;
  return Math.exp(Math.log(WIDTHS[k]) * (1 - f) + Math.log(WIDTHS[k + 1]) * f);
}

function paintTile(
  ctx: CanvasRenderingContext2D,
  k: number,
  c: number,
  r: number,
  wall: Wall | null,
  video?: HTMLVideoElement,
) {
  const px = TILE_PX[k];
  const gap = Math.max(1, Math.round(px * 0.04));
  const x = c * px + gap / 2;
  const y = ctx.canvas.height - (r + 1) * px + gap / 2;
  const s = px - gap;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, s, s);
  ctx.clip();
  if (wall && video) {
    // Square crop of the playing preview, at the same position as the tile
    const { tile } = wallTileAt(wall, c, r);
    const side = video.videoHeight;
    ctx.drawImage(video, tile.x * (video.videoWidth - side), 0, side, side, x, y, s, s);
  } else if (wall) {
    drawTile(ctx, x, y, s, s, c, r, wall);
  } else {
    ctx.fillStyle = EMPTY;
    ctx.fillRect(x, y, s, s);
  }
  if (releases[levelOf(c, r)].status !== "launching") {
    ctx.fillStyle = WASH;
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

// A few cells that belong to level k (not covered by an inner level)
function probeCells(k: number): [number, number][] {
  if (k === 0) return [[0, 0], [2, 1], [4, 2]];
  return [
    [WIDTHS[k] - 1, 0],
    [WIDTHS[k] - 1, HEIGHTS[k] - 1],
    [WIDTHS[k - 1], 0],
  ];
}

// True when the probed tiles on this level hold footage rather than the bare
// background, i.e. the sheet really drew. Some Safari builds draw nothing from
// an image that isn't decoded yet, without raising an error.
function levelPainted(canvas: HTMLCanvasElement, k: number) {
  const ctx = canvas.getContext("2d")!;
  const px = TILE_PX[k];
  const blank = (d: Uint8ClampedArray) =>
    d[3] === 0 ||
    [[251, 250, 247], [248, 246, 241]].some(([r, g, b]) => Math.abs(d[0] - r) < 4 && Math.abs(d[1] - g) < 4 && Math.abs(d[2] - b) < 4);
  return probeCells(k).some(([c, r]) => {
    const x = Math.floor((c + 0.5) * px);
    const y = Math.floor(canvas.height - (r + 0.5) * px);
    return !blank(ctx.getImageData(x, y, 1, 1).data);
  });
}

function paintLevel(canvas: HTMLCanvasElement, k: number, wall: Wall | null) {
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let r = 0; r < HEIGHTS[k]; r++)
    for (let c = 0; c < WIDTHS[k]; c++) {
      // inner levels sit on top in their own sharper canvas
      if (k > 0 && levelOf(c, r) < k) continue;
      paintTile(ctx, k, c, r, wall);
    }
}

type Tip = { x: number; y: number; title: string; task: string; src: string };

type Props = {
  peek: number | null;
  onLevel?: (level: number) => void;
  className?: string;
};

export function Montage({ peek, onLevel, className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [tip, setTip] = useState<Tip | null>(null);
  const [ready, setReady] = useState(false);
  const state = useRef({
    v: 0,
    from: 0,
    to: 0,
    start: 0,
    dur: 0,
    queue: [] as { to: number; dur: number; hold: number }[],
    holdUntil: 0,
    visible: true,
    wall: null as Wall | null,
    videos: [] as HTMLVideoElement[],
    live: [] as [number, number, number][],
    lastLevel: -1,
  });

  const firstPeek = useRef(true);
  useEffect(() => {
    if (firstPeek.current) {
      firstPeek.current = false;
      return;
    }
    const s = state.current;
    const target = peek ?? REST;
    s.queue = [];
    s.from = s.v;
    s.to = target;
    s.start = performance.now();
    s.dur = Math.abs(target - s.v) * 900 + 300;
  }, [peek]);

  useEffect(() => {
    const s = state.current;
    const wrap = wrapRef.current!;
    const world = worldRef.current!;
    const canvases = canvasRefs.current as HTMLCanvasElement[];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let disposed = false;

    canvases.forEach((cv, k) => {
      cv.width = Math.ceil(WIDTHS[k] * TILE_PX[k]);
      cv.height = Math.ceil(HEIGHTS[k] * TILE_PX[k]);
    });

    const setPlaying = (on: boolean) =>
      s.videos.forEach((v) => (on && !reduce ? v.play().catch(() => {}) : v.pause()));

    // Live tiles: a few in 10K, a couple in 100K
    s.live = [];
    for (let i = 0; i < LIVE; i++) {
      const k = i < 4 ? 0 : 1;
      let c = 0, r = 0;
      do {
        c = Math.floor(Math.random() * WIDTHS[k]);
        r = Math.floor(Math.random() * HEIGHTS[k]);
      } while (levelOf(c, r) !== k);
      s.live.push([k, c, r]);
    }
    const ctxs = canvases.map((cv) => cv.getContext("2d")!);

    loadWall().then(async (wall) => {
      if (disposed) return;
      s.wall = wall;

      // Paint, then confirm the footage actually landed; repaint any level
      // that came out blank. Show the montage once the 10K block is good.
      let shown = false;
      const show = () => {
        if (!shown && !disposed) {
          shown = true;
          setReady(true);
        }
      };
      if (wall) {
        const done = canvases.map(() => false);
        for (let attempt = 0; attempt < 8 && !disposed; attempt++) {
          canvases.forEach((cv, k) => {
            if (done[k]) return;
            paintLevel(cv, k, wall);
            done[k] = levelPainted(cv, k);
          });
          if (done[0]) show();
          if (done.every(Boolean)) break;
          await new Promise((r) => setTimeout(r, 250 + attempt * 150));
        }
        if (disposed) return;
      } else {
        canvases.forEach((cv, k) => paintLevel(cv, k, null));
      }

      if (wall) {
        // One muted looping preview per clip, only for clips a live tile shows.
        // iOS only autoplays inline when muted/playsinline are attributes set
        // before the source.
        const needed = new Set(s.live.map(([, c, r]) => wallTileAt(wall, c, r).tile.clip));
        s.videos = [];
        needed.forEach((i) => {
          const v = document.createElement("video");
          v.muted = true;
          v.setAttribute("muted", "");
          v.playsInline = true;
          v.setAttribute("playsinline", "");
          v.loop = true;
          v.preload = "auto";
          v.src = wall.clips[i].src;
          s.videos[i] = v;
        });
        setPlaying(s.visible);
      }

      // Start the tour now that there is something to show:
      // 10K → 10M → settle on 100K (unless the visitor is already peeking)
      if (reduce || !wall) {
        s.v = s.from = s.to = REST;
      } else if (s.dur === 0) {
        s.queue = [
          { to: 0, dur: 0, hold: 1300 },
          { to: 3, dur: 2600, hold: 700 },
          { to: REST, dur: 1900, hold: 0 },
        ];
        s.holdUntil = 0;
      }
      show();
    });

    const io = new IntersectionObserver(
      ([e]) => {
        s.visible = e.isIntersecting;
        setPlaying(s.visible);
      },
      { threshold: 0.02 },
    );
    io.observe(wrap);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!s.visible) return;

      // Advance the zoom timeline
      if (s.dur > 0 && now - s.start < s.dur) {
        s.v = s.from + (s.to - s.from) * easeInOutCubic((now - s.start) / s.dur);
      } else {
        s.v = s.to;
        if (s.queue.length && now >= s.holdUntil) {
          const next = s.queue.shift()!;
          s.from = s.v;
          s.to = next.to;
          s.start = now;
          s.dur = next.dur;
          s.holdUntil = now + next.dur + next.hold;
          if (next.dur === 0) s.v = next.to;
        }
      }

      const level = Math.round(s.v);
      if (level !== s.lastLevel) {
        s.lastLevel = level;
        onLevel?.(level);
      }

      // Zoom: one composited transform for the whole world
      const scale = WIDTHS[REST] / viewWidth(s.v);
      world.style.transform = `scale(${scale})`;

      // Labels stay crisp: positioned in screen space, not scaled
      const W = wrap.clientWidth;
      const H = wrap.clientHeight;
      const tilePx = W / viewWidth(s.v);
      for (let k = 0; k < WIDTHS.length; k++) {
        const el = labelRefs.current[k];
        if (!el) continue;
        const top = H - HEIGHTS[k] * tilePx;
        const show = WIDTHS[k] * tilePx >= 40 && top >= -1;
        el.style.opacity = show ? "1" : "0";
        el.style.transform = `translate3d(0, ${Math.max(0, top)}px, 0)`;
      }

      // Live tiles: repaint only the ones big enough to see
      if (reduce || !s.wall) return;
      for (const [k, c, r] of s.live) {
        if (tilePx < 10) continue;
        const video = s.videos[wallTileAt(s.wall, c, r).tile.clip];
        if (!video || video.readyState < 2) continue;
        paintTile(ctxs[k], k, c, r, s.wall, video);
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      s.videos.forEach((v) => {
        v.pause();
        v.removeAttribute("src");
        v.load();
      });
      s.videos = [];
    };
  }, [onLevel]);

  const onMove = (e: React.PointerEvent) => {
    const wall = state.current.wall;
    if (e.pointerType !== "mouse" || !wall) return;
    const rect = wrapRef.current!.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const tilePx = rect.width / viewWidth(state.current.v);
    if (tilePx < 12) return setTip(null);
    const c = Math.floor(px / tilePx);
    const r = Math.floor((rect.height - py) / tilePx);
    setTip({ x: px, y: py, ...labelAt(wall, c, r) });
  };

  const width = wrapRef.current?.clientWidth ?? 0;
  const height = wrapRef.current?.clientHeight ?? 0;
  const cardW = Math.min(300, width * 0.45);
  const cardH = (cardW * 9) / 16;

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{ background: BG }}
      onPointerMove={onMove}
      onPointerLeave={() => setTip(null)}
      role="img"
      aria-label="Montage of egocentric work footage, nested by dataset scale"
    >
      {/* World: sized so the resting level fills the frame at scale(1) */}
      <div
        className="absolute inset-0 transition-opacity duration-700 ease-out"
        style={{ opacity: ready ? 1 : 0 }}
      >
        <div
          ref={worldRef}
          className="absolute bottom-0 left-0 w-full"
          style={{ transformOrigin: "0 100%", willChange: "transform" }}
        >
          {WIDTHS.map((w, k) => (
            <canvas
              key={k}
              ref={(el) => (canvasRefs.current[k] = el)}
              className="absolute bottom-0 left-0 block"
              style={{
                width: `${(w / WIDTHS[REST]) * 100}%`,
                aspectRatio: `${w} / ${HEIGHTS[k]}`,
                zIndex: WIDTHS.length - k,
              }}
            />
          ))}
        </div>

        {releases.map((r, k) => (
          <span
            key={r.id}
            ref={(el) => (labelRefs.current[k] = el)}
            className={`absolute left-0 top-0 z-10 bg-[#fbfaf7]/90 px-1.5 py-0.5 text-[11px] font-medium transition-opacity duration-200 ${
              k === 0 ? "text-black/85" : "text-black/50"
            }`}
            style={{ opacity: 0 }}
          >
            {r.scale}
          </span>
        ))}
      </div>

      {tip && (
        // Hover card: the clip itself, as on build.ai
        <div
          className="pointer-events-none absolute z-20 overflow-hidden rounded-2xl border border-white/50 shadow-[0_12px_40px_rgba(50,61,86,0.22)] animate-in fade-in zoom-in-95 duration-300"
          style={{
            width: cardW,
            height: cardH,
            left: tip.x + 16 + cardW > width ? tip.x - 16 - cardW : tip.x + 16,
            top: Math.min(Math.max(8, tip.y - cardH / 2), height - cardH - 8),
          }}
        >
          <video key={tip.src} src={tip.src} autoPlay muted loop playsInline className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex gap-1.5 bg-gradient-to-t from-black/45 to-transparent p-2.5 pt-8">
            <span className="rounded-full border border-white/35 bg-black/15 px-2 py-0.5 text-[11px] text-white backdrop-blur-[2px]">
              {tip.title}
            </span>
            <span className="rounded-full border border-white/35 bg-black/15 px-2 py-0.5 text-[11px] text-white backdrop-blur-[2px]">
              {tip.task}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
