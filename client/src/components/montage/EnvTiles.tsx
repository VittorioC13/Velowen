import { useEffect, useRef } from "react";
import { drawTile } from "./tiles";
import type { Environment } from "@/content/site";

// A small live grid of placeholder frames from one environment.
export function EnvTiles({ env, cols = 3, rows = 2 }: { env: Environment; cols?: number; rows?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const salt = env.id.length * 31;
    let raf = 0;
    let visible = false;
    let last = 0;

    const draw = (t: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = Math.round(canvas.clientWidth * dpr);
      const H = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }
      const gap = 3 * dpr;
      const tw = (W - gap * (cols - 1)) / cols;
      const th = (H - gap * (rows - 1)) / rows;
      ctx.clearRect(0, 0, W, H);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const x = c * (tw + gap);
          const y = r * (th + gap);
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(x, y, tw, th, 6 * dpr);
          ctx.clip();
          drawTile(ctx, x, y, tw, th, c + salt, r + salt, t, null, env);
          ctx.restore();
        }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || now - last < 50) return;
      last = now;
      draw(now / 1000);
    };

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    draw(0);
    if (!reduce) raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [env, cols, rows]);

  return <canvas ref={ref} className="block h-full w-full" />;
}
