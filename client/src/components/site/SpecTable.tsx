import type { SpecRow } from "@/content/site";

// build.ai-style spec sheet: square corners, hairline rules, corner bolts,
// sans labels and serif values.
export function SpecTable({ rows, title, meta }: { rows: SpecRow[]; title: string; meta?: string }) {
  return (
    <div className="relative border border-rule bg-white/70 [--bolt-bg:#fbfaf7]">
      <span className="bolt left-0 top-0" />
      <span className="bolt left-full top-0" />
      <span className="bolt left-0 top-full" />
      <span className="bolt left-full top-full" />
      <div className="flex items-baseline justify-between border-b border-rule px-5 py-4 md:px-6">
        <h3 className="text-[15px] font-medium text-black/85">{title}</h3>
        {meta && <span className="text-[13px] text-black/45">{meta}</span>}
      </div>
      <dl>
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`grid grid-cols-[minmax(110px,32%)_1fr] gap-4 px-5 py-3.5 md:px-6 ${i ? "border-t border-rule" : ""}`}
          >
            <dt className="text-[13px] leading-6 text-black/50">{row.label}</dt>
            <dd className="font-serif text-[16px] leading-6 text-black/85">
              {row.value}
              {row.note && <span className="ml-2 font-sans text-[12px] text-black/40">{row.note}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
