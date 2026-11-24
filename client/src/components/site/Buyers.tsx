import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe } from "@/components/site/Globe";
import { Badge } from "@/components/site/Badge";
import { BookButton } from "@/components/site/Nav";
import { markets, type Market } from "@/content/site";

const HOLD_MS = 5200;
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

export function Buyers() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const m = markets[active];

  // Auto-advance; the timer restarts whenever the country changes, so a
  // click gives the chosen country a full turn on screen.
  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => setActive((i) => (i + 1) % markets.length), HOLD_MS);
    return () => window.clearTimeout(id);
  }, [active, paused]);

  return (
    <section id="buyers" className="relative scroll-mt-24 overflow-hidden border-y border-rule bg-ivory">
      <div className="relative mx-auto grid max-w-[1240px] lg:min-h-[760px] lg:grid-cols-[minmax(0,460px)_1fr]">
        <div
          className="relative z-10 flex flex-col px-5 pb-4 pt-16 md:px-10 lg:pb-16 lg:pt-24"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="flex items-center gap-4">
            <Badge tint="sky">Buyers</Badge>
            <span className="font-mono text-[13px] tracking-[0.04em] text-black/55" aria-live="polite">
              {pad(active + 1)} <span className="mx-1 text-black/30">/</span> {pad(markets.length)}
            </span>
          </div>

          <div className="mt-10 lg:mt-auto">
            <div className="min-h-[150px] md:min-h-[190px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
                transition={{ duration: 0.55, ease }}
              >
                <h2 className="flex items-center gap-4 font-serif text-[56px] font-normal leading-none tracking-[-0.03em] text-ink md:text-[80px]">
                  <Flag code={m.flag} className="h-[22px] w-[33px] shrink-0 shadow-[0_0_0_1px_rgba(20,20,19,0.08)] md:h-[26px] md:w-[39px]" />
                  {m.name}
                </h2>
                <p className="mt-6 max-w-[380px] text-[21px] leading-[30px] text-black/50 md:text-[24px] md:leading-[34px]">
                  {m.focus}
                </p>
              </motion.div>
            </AnimatePresence>
            </div>
            <BookButton className="mt-6 h-11 px-6 text-[16px]">Buy data for your market</BookButton>
          </div>

          {/* Country rail: shows progress and lets you jump */}
          <div className="mt-10 grid grid-cols-5 gap-2 lg:mt-auto" role="tablist" aria-label="Buyer countries">
            {markets.map((c, i) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                className="group text-left"
              >
                <span className="relative block h-[2px] overflow-hidden bg-black/[0.08]">
                  {i === active && (
                    <motion.span
                      key={`${c.id}-${paused}`}
                      className="absolute inset-y-0 left-0 bg-ink"
                      initial={{ width: paused ? "100%" : "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: paused ? 0 : HOLD_MS / 1000, ease: "linear" }}
                    />
                  )}
                </span>
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

        {/* Globe: bleeds past the right and bottom edges, like a horizon */}
        <div className="relative h-[420px] sm:h-[560px] lg:h-auto">
          <Globe markets={markets} active={active} className="absolute inset-0 h-full w-full lg:-right-[20vw] lg:w-[calc(100%+20vw)]" />
        </div>
      </div>
    </section>
  );
}
