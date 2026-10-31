import { useEffect, useRef } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

type Part = { text: string; color?: string };

// Scroll-scrubbed reading effect: words brighten from 25% to full as the
// paragraph passes through the viewport. Highlighted words fade in their tint.
export function ScrubText({ parts, className }: { parts: Part[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = useRef<HTMLSpanElement[]>([]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });

  const paint = (p: number) => {
    const list = words.current;
    const lit = p * list.length;
    list.forEach((el, i) => {
      const o = Math.min(1, Math.max(0.22, lit - i + 0.22));
      el.style.opacity = String(o);
    });
  };

  useMotionValueEvent(scrollYProgress, "change", paint);
  useEffect(() => paint(scrollYProgress.get()), []);

  words.current = [];
  let key = 0;
  return (
    <p ref={ref} className={`relative ${className ?? ""}`}>
      {parts.map((part) =>
        part.text.split(/(\s+)/).map((w) =>
          /^\s+$/.test(w) || w === "" ? (
            w
          ) : (
            <span
              key={key++}
              ref={(el) => el && words.current.push(el)}
              style={{ color: part.color, opacity: 0.22, transition: "opacity .2s linear" }}
            >
              {w}
            </span>
          ),
        ),
      )}
    </p>
  );
}
