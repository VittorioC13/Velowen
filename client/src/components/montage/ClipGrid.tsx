import { useEffect, useState } from "react";
import { coverTile, loadWall, sheetFor, type Wall } from "./tiles";

const TAGS = ["#eac976", "#a1a6cb", "#90b9ab", "#7cbffe", "#ea7c76", "#a08ed0", "#e8c1a6"];

// One card per clip in the footage manifest: a still from the sprite sheet,
// playing the clip's preview on hover.
export function ClipGrid() {
  const [wall, setWall] = useState<Wall | null>(null);
  const [failed, setFailed] = useState(false);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    let live = true;
    loadWall().then((w) => {
      if (!live) return;
      if (w) setWall(w);
      else setFailed(true);
    });
    return () => {
      live = false;
    };
  }, []);

  if (failed) return null;

  if (!wall) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-2xl bg-black/[0.04]" />
        ))}
      </div>
    );
  }

  const sheet = sheetFor(wall, 200);
  const rows = Math.ceil(wall.tiles.length / sheet.cols);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {wall.clips.map((clip, i) => {
        const t = coverTile(wall, i);
        const col = t % sheet.cols;
        const row = Math.floor(t / sheet.cols);
        return (
          <figure
            key={clip.id}
            className="group relative aspect-square overflow-hidden rounded-2xl bg-black/[0.04] animate-in fade-in duration-500"
            onPointerEnter={(e) => e.pointerType === "mouse" && setHover(i)}
            onPointerLeave={() => setHover(null)}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${sheet.image.src})`,
                backgroundSize: `${sheet.cols * 100}% ${rows * 100}%`,
                backgroundPosition: `${(col / Math.max(1, sheet.cols - 1)) * 100}% ${(row / Math.max(1, rows - 1)) * 100}%`,
              }}
            />
            {hover === i && (
              <video src={clip.src} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
            )}
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-3 pt-10">
              <span
                className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm"
                style={{ background: TAGS[i % TAGS.length] }}
              >
                {clip.env}
              </span>
              <p className="mt-1.5 text-[14px] leading-5 text-white">{clip.task}</p>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
