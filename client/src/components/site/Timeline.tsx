import { releases } from "@/content/site";

// Dataset roadmap rail. Hovering (or tapping) a row asks the montage to peek
// at that scale; the active row tracks wherever the montage currently sits.
export function Timeline({
  active,
  onPeek,
}: {
  active: number;
  onPeek: (level: number | null) => void;
}) {
  return (
    <ul className="flex flex-col" onPointerLeave={() => onPeek(null)}>
      {releases.map((r, i) => {
        const on = i === active;
        return (
          <li key={r.id}>
            <button
              type="button"
              onPointerEnter={() => onPeek(i)}
              onFocus={() => onPeek(i)}
              onBlur={() => onPeek(null)}
              onClick={() => onPeek(i)}
              className="relative flex w-full items-center justify-between gap-4 rounded-full px-4 py-2.5 text-left transition-colors duration-150 hover:bg-white/40"
            >
              <span
                className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-black/80 transition-opacity duration-200"
                style={{ opacity: on ? 1 : 0 }}
              />
              <span className={`text-[14px] transition-colors duration-150 ${on ? "text-black/85" : "text-black/45"}`}>
                {r.name}
              </span>
              <span className="flex items-center gap-2 text-[13px]">
                {r.status === "launching" && (
                  <span className="rounded-full bg-[rgba(3,169,244,0.08)] px-2 py-0.5 text-[12px] text-[#3a7fb8]">
                    Launching
                  </span>
                )}
                <span className={on ? "text-black/70" : "text-black/35"}>{r.date}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
