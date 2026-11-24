import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Globe } from "@/components/site/Globe";
import { Badge } from "@/components/site/Badge";
import { BookButton } from "@/components/site/Nav";
import { markets, type Market } from "@/content/site";

const ease = [0.4, 0, 0.2, 1] as const;

// Simplified flags, drawn at 3:2 so they share one box
function Flag({ code, className = "" }: { code: Market["flag"]; className?: string }) {
  const box = { viewBox: "0 0 30 20", className, "aria-hidden": true } as const;
  switch (code) {
    case "es":
      return (
        <svg {...box}>
          <rect width="30" height="20" fill="#c60b1e" />
          <rect y="5" width="30" height="10" fill="#ffc400" />
        </svg>
      );
    case "de":
      return (
        <svg {...box}>
          <rect width="30" height="20" fill="#ffce00" />
          <rect width="30" height="13.33" fill="#dd0000" />
          <rect width="30" height="6.67" fill="#000" />
        </svg>
      );
    case "se":
      return (
        <svg {...box}>
          <rect width="30" height="20" fill="#006aa7" />
          <rect x="9" width="4" height="20" fill="#fecc00" />
          <rect y="8" width="30" height="4" fill="#fecc00" />
        </svg>
      );
    case "jp":
      return (
        <svg {...box}>
          <rect width="30" height="20" fill="#fff" />
          <circle cx="15" cy="10" r="6" fill="#bc002d" />
        </svg>
      );
    case "cn":
      return (
        <svg {...box}>
          <rect width="30" height="20" fill="#de2910" />
          <polygon
            fill="#ffde00"
            points="5,2 5.9,4.8 8.8,4.8 6.5,6.5 7.3,9.3 5,7.6 2.7,9.3 3.5,6.5 1.2,4.8 4.1,4.8"
          />
          {[
            [10, 2],
            [12, 4],
            [12, 7],
            [10, 9],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="0.8" fill="#ffde00" />
          ))}
        </svg>
      );
  }
}

const pad = (n: number) => String(n).padStart(2, "0");
const N = markets.length;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Scroll progress (0..1) to globe position (0..N-1). The middle half of each
// step does the turning; the rest holds on a country so it can be read.
function toPosition(p: number) {
  const r = clamp01(p) * (N - 1);
  const i = Math.min(N - 1, Math.floor(r));
  const t = clamp01((r - i - 0.25) / 0.5);
  return i + t * t * (3 - 2 * t);
}

function RailBar({ progress, index }: { progress: MotionValue<number>; index: number }) {
  // Each bar owns 1/N of the scroll and fills as you pass through it
  const scaleX = useTransform(progress, (p) => clamp01(p * N - index));
  return (
    <span className="relative block h-[2px] overflow-hidden bg-black/[0.08]">
      <motion.span className="absolute inset-0 origin-left bg-ink" style={{ scaleX }} />
    </span>
  );
}

export function Buyers() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const position = useTransform(scrollYProgress, toPosition);
  const [active, setActive] = useState(0);
  useMotionValueEvent(position, "change", (v) => setActive(Math.round(v)));
  const m = markets[active];

  // Rail click: scroll to where that country is centred
  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (travel * i) / (N - 1), behavior: "smooth" });
  };

  return (
    // Tall track; the panel inside stays pinned while the globe turns.
    // overflow-clip (not hidden) so the sticky child still sticks.
    <section
      id="buyers"
      ref={ref}
      className="relative scroll-mt-0 overflow-clip border-y border-rule bg-ivory"
      style={{ height: `${N * 85 + 15}vh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="relative mx-auto flex h-full max-w-[1240px] flex-col lg:grid lg:grid-cols-[minmax(0,460px)_1fr]">
          <div className="relative z-10 flex flex-col px-5 pt-24 md:px-10 lg:pb-16 lg:pt-28">
            <div className="flex items-center gap-4">
              <Badge tint="sky">Buyers</Badge>
              <span className="font-mono text-[13px] tracking-[0.04em] text-black/55" aria-live="polite">
                {pad(active + 1)} <span className="mx-1 text-black/30">/</span> {pad(N)}
              </span>
            </div>

            <div className="mt-8 lg:mt-auto">
              <div className="min-h-[124px] md:min-h-[190px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease }}
                  >
                    <h2 className="flex items-center gap-4 font-serif text-[48px] font-normal leading-none tracking-[-0.03em] text-ink md:text-[80px]">
                      <Flag code={m.flag} className="h-[20px] w-[30px] shrink-0 shadow-[0_0_0_1px_rgba(20,20,19,0.08)] md:h-[26px] md:w-[39px]" />
                      {m.name}
                    </h2>
                    <p className="mt-4 max-w-[380px] text-[19px] leading-[27px] text-black/50 md:mt-6 md:text-[24px] md:leading-[34px]">
                      {m.focus}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <BookButton className="mt-5 h-11 px-6 text-[16px] md:mt-6">Buy data for your market</BookButton>
            </div>

            {/* Country rail: fills with the scroll, click to jump */}
            <div className="mt-8 grid grid-cols-5 gap-2 lg:mt-auto" role="tablist" aria-label="Buyer countries">
              {markets.map((c, i) => (
                <button key={c.id} role="tab" aria-selected={i === active} onClick={() => jump(i)} className="group text-left">
                  <RailBar progress={scrollYProgress} index={i} />
                  <span
                    className={`mt-2.5 block truncate text-[13px] transition-colors ${
                      i === active ? "text-black/85" : "text-black/40 group-hover:text-black/70"
                    }`}
                  >
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile: globe sits under the text */}
          <div className="relative min-h-0 flex-1 lg:hidden">
            <Globe markets={markets} position={position} className="absolute inset-0" />
          </div>
        </div>
        {/* Desktop: globe runs to the viewport's right edge, cropped like a
            horizon. The canvas covers only what's on screen. */}
        <div className="absolute inset-y-0 left-[38%] right-0 hidden lg:block">
          <Globe markets={markets} position={position} className="absolute inset-0" />
        </div>
      </div>
    </section>
  );
}
