import type { ReactNode } from "react";

const tints = {
  sky: "radial-gradient(112% 100% at 50% 0%, rgba(239,240,179,.22) 44%, rgba(146,203,232,.24) 100%), linear-gradient(rgba(255,255,255,.6), rgba(255,255,255,.6))",
  lilac: "radial-gradient(112% 100% at 50% 0%, rgba(229,219,246,.24) 44%, rgba(114,195,239,.2) 100%), linear-gradient(rgba(255,255,255,.6), rgba(255,255,255,.6))",
  peach: "radial-gradient(112% 100% at 50% 0%, rgba(255,226,195,.3) 44%, rgba(234,201,118,.2) 100%), linear-gradient(rgba(255,255,255,.6), rgba(255,255,255,.6))",
};

export function Badge({ children, tint = "sky" }: { children: ReactNode; tint?: keyof typeof tints }) {
  return (
    <span
      className="inline-flex h-9 items-center rounded-[28px] border border-black/5 px-4 text-[16px] text-black/75 shadow-[0_2px_4px_rgba(0,0,0,0.04)]"
      style={{ backgroundImage: tints[tint] }}
    >
      {children}
    </span>
  );
}

export function SectionHead({
  badge,
  title,
  body,
  tint,
  align = "center",
}: {
  badge: string;
  title: ReactNode;
  body?: ReactNode;
  tint?: keyof typeof tints;
  align?: "center" | "left";
}) {
  const center = align === "center";
  return (
    <div className={`flex flex-col gap-5 ${center ? "items-center text-center" : "items-start"}`}>
      <Badge tint={tint}>{badge}</Badge>
      <h2 className="max-w-[820px] font-serif text-[34px] font-normal leading-[40px] tracking-[-0.015em] text-ink md:text-[48px] md:leading-[54px]">
        {title}
      </h2>
      {body && (
        <p className={`max-w-[640px] text-[18px] leading-[26px] text-black/60 md:text-[21px] md:leading-[30px] ${center ? "mx-auto" : ""}`}>
          {body}
        </p>
      )}
    </div>
  );
}
