import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Nav, BookButton } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { ScrubText } from "@/components/site/ScrubText";
import { Badge, SectionHead } from "@/components/site/Badge";
import { LazyDentistSplat as DentistSplat } from "@/components/dental/LazyDentistSplat";
import { SpecTable } from "@/components/site/SpecTable";
import { Timeline } from "@/components/site/Timeline";
import { Montage } from "@/components/montage/Montage";
import { Buyers } from "@/components/site/Buyers";
import {
  backer,
  capacity,
  dental,
  deviceCount,
  deviceGroups,
  groupHours,
  site,
  spec10k,
  totalHours,
  type DeviceGroup,
} from "@/content/site";

function useHashScroll() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
  }, []);
}

function Hero() {
  const [level, setLevel] = useState(0);
  const [peek, setPeek] = useState<number | null>(null);

  return (
    <section className="relative overflow-hidden pb-24 pt-36 md:pb-32 md:pt-44">
      {/* Daylight sky that dissolves into the ivory page */}
      <div
        className="pointer-events-none absolute inset-0 bg-daylight"
        style={{ maskImage: "linear-gradient(to bottom, #000 0%, #000 calc(100% - 320px), transparent 100%)" }}
      />
      <div
        className="pointer-events-none absolute -left-[20%] top-[-10%] h-[900px] w-[900px] rounded-full opacity-80"
        style={{ background: "radial-gradient(circle farthest-side, rgba(255,255,255,.7), rgba(255,255,255,0) 70%)" }}
      />
      <div
        className="pointer-events-none absolute -right-[15%] top-[30%] h-[800px] w-[800px] rounded-full"
        style={{ background: "radial-gradient(circle farthest-side, rgba(238,183,128,.28), rgba(238,183,128,.08) 60%, transparent)" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-white/20" />

      <div className="relative mx-auto max-w-[1240px] px-5 md:px-10">
        <Reveal className="mx-auto max-w-[900px] text-center">
          <h1 className="whitespace-pre-line font-serif text-[42px] font-normal leading-[48px] tracking-[-0.02em] text-ink md:text-[64px] md:leading-[70px]">
            {site.hero.title}
          </h1>
        </Reveal>
        <Reveal delay={0.12} className="mx-auto mt-6 max-w-[680px] text-center">
          <p className="text-[19px] leading-[28px] text-black/50 md:text-[22px] md:leading-[32px]">{site.hero.subtitle}</p>
        </Reveal>
        <Reveal delay={0.22} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <BookButton className="h-11 px-6 text-[16px]" />
          <Link
            href="/data"
            className="inline-flex h-11 items-center gap-1.5 rounded-full border border-white/60 bg-white/50 px-6 text-[16px] font-medium text-black/70 backdrop-blur-[20px] transition-colors hover:text-black/90"
          >
            Explore the data <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </Reveal>

        {/* Demo shell: montage + roadmap */}
        <Reveal delay={0.32} className="mx-auto mt-16 max-w-[1120px] md:mt-20">
          <div className="rounded-[28px] border border-white/50 bg-white/35 p-2 shadow-[0_2px_20px_rgba(0,0,0,0.08)] backdrop-blur-[4px] md:p-3">
            <div className="grid gap-2 md:gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="overflow-hidden rounded-[20px]">
                <Montage peek={peek} onLevel={setLevel} className="aspect-video w-full" />
              </div>
              <div className="flex flex-col rounded-[20px] bg-daylight p-3">
                <div className="mx-auto flex h-10 items-center rounded-[34px] bg-white/45 p-1 text-[14px] backdrop-blur-[20px]">
                  <span className="rounded-full bg-black/5 px-3 py-1.5 text-black/85">Roadmap</span>
                  <Link href="/data" className="px-3 py-1.5 text-black/55 hover:text-black/80">
                    Spec
                  </Link>
                </div>
                <div className="mt-3 rounded-[20px] border border-white/40 bg-white/60 p-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur-[8px]">
                  <Timeline active={peek ?? level} onPeek={setPeek} />
                </div>
                <div className="mt-auto grid grid-cols-3 gap-2 pt-3">
                  {[
                    ["10,000", "hours"],
                    ["20+", "worksites"],
                    ["Dec '26", "release"],
                  ].map(([v, l]) => (
                    <div key={l} className="rounded-2xl bg-white/50 px-3 py-3 text-center">
                      <div className="font-serif text-[19px] leading-6 text-ink">{v}</div>
                      <div className="text-[12px] text-black/45">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-[13px] text-black/40">
            Each square is a clip. Hover the roadmap to see where the dataset is going.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Mission() {
  return (
    <section id="mission" className="relative scroll-mt-24 bg-ivory py-28 md:py-40">
      <div className="mx-auto max-w-[1000px] px-5 text-center md:px-10">
        <p className="mb-6 text-[13px] font-medium uppercase tracking-[0.14em] text-black/40">Our mission</p>
        <ScrubText
          parts={site.mission}
          className="font-serif text-[36px] font-normal leading-[1.2] tracking-[-0.02em] text-ink md:text-[60px]"
        />
      </div>
    </section>
  );
}

// Soft background glows, feathered at the section's top and bottom so
// neighbouring sections blend instead of meeting at a hard edge.
function Glows({ children }: { children: React.ReactNode }) {
  const fade = "linear-gradient(to bottom, transparent 0%, #000 18%, #000 82%, transparent 100%)";
  return (
    <div className="pointer-events-none absolute inset-0" style={{ maskImage: fade, WebkitMaskImage: fade }}>
      {children}
    </div>
  );
}

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

// Per-group look: accent for the share bar, soft wash for the card
const groupStyle: Record<string, { accent: string; wash: string }> = {
  ego: {
    accent: "#7cbffe",
    wash: "radial-gradient(120% 90% at 0% 0%, rgba(172,205,236,.45), rgba(231,235,244,.35) 55%, rgba(255,255,255,.55))",
  },
  umi: {
    accent: "#eeb780",
    wash: "radial-gradient(120% 90% at 0% 0%, rgba(255,221,185,.6), rgba(255,240,225,.4) 55%, rgba(255,255,255,.55))",
  },
  robot: {
    accent: "#46ccbd",
    wash: "radial-gradient(120% 90% at 0% 0%, rgba(214,244,236,.7), rgba(231,244,240,.4) 55%, rgba(255,255,255,.55))",
  },
};

function DeviceCard({ g, className = "" }: { g: DeviceGroup; className?: string }) {
  const st = groupStyle[g.id];
  return (
    <div
      className={`rounded-[24px] border border-white/70 p-6 shadow-[0_2px_20px_rgba(0,0,0,0.05)] md:p-7 ${className}`}
      style={{ background: st.wash }}
    >
      <div className="flex items-center gap-2 text-[14px] text-black/55">
        <span className="h-2 w-2 rounded-full" style={{ background: st.accent }} />
        {g.name}
      </div>
      <p className="mt-3 font-serif text-[40px] font-normal leading-none tracking-[-0.025em] text-ink">
        {fmt(groupHours(g))}
        <span className="ml-1.5 font-sans text-[15px] tracking-normal text-black/40">h</span>
      </p>
      <p className="mt-2 text-[14px] text-black/45">{g.about}</p>
      <ul className="mt-6 border-t border-black/[0.08]">
        {g.devices.map((d) => (
          <li key={d.name} className="flex items-baseline justify-between gap-4 border-b border-black/[0.06] py-3 last:border-b-0">
            <span className="min-w-0">
              <span className="text-[15px] text-black/85">{d.name}</span>
              <span className="ml-2 hidden text-[13px] text-black/40 sm:inline">{d.kind}</span>
            </span>
            <span className="shrink-0 text-[15px] tabular-nums text-black/65">
              {fmt(d.hours)}
              <span className="ml-0.5 text-[12px] text-black/35">h</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Traction() {
  const [ego, umi, robot] = deviceGroups;
  return (
    <section id="traction" className="relative scroll-mt-24 overflow-hidden bg-ivory pb-24 md:pb-32">
      <Glows>
        <div
          className="absolute left-1/2 top-[18%] h-[760px] w-[1200px] -translate-x-1/2"
          style={{ background: "radial-gradient(closest-side, rgba(172,205,236,.35), rgba(255,221,185,.18) 60%, transparent)" }}
        />
      </Glows>
      <div className="relative mx-auto max-w-[1120px] px-5 md:px-10">
        <Reveal className="flex flex-col items-center text-center">
          <Badge tint="mint">In production</Badge>
          <h2 className="mt-6 font-serif text-[56px] font-normal leading-none tracking-[-0.035em] text-ink md:text-[96px]">
            {fmt(Math.floor(totalHours / 1000) * 1000)}+
            <span className="ml-3 align-baseline font-sans text-[20px] tracking-normal text-black/40 md:text-[24px]">hours</span>
          </h2>
          <p className="mt-5 max-w-[600px] text-[18px] leading-[27px] text-black/55 md:text-[21px] md:leading-[31px]">
            Validated, in stock and ready to ship, across {deviceCount} capture devices. World model and robotics teams
            are already buying.
          </p>
          <span className="glass mt-7 inline-flex h-10 items-center gap-2.5 rounded-full px-4 text-[15px] text-black/70">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#46ccbd] opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-[#46ccbd]" />
            </span>
            +{capacity.weeklyHours} new egocentric hours every week
          </span>
        </Reveal>

        <div id="devices" className="scroll-mt-24">
          {/* Where the hours sit, at a glance */}
          <Reveal delay={0.1} className="mt-16 md:mt-20">
            <div className="flex h-3 overflow-hidden rounded-full bg-black/[0.04]">
              {deviceGroups.map((g) => (
                <div
                  key={g.id}
                  className="h-full first:rounded-l-full last:rounded-r-full [&:not(:first-child)]:ml-[3px]"
                  style={{ width: `${(groupHours(g) / totalHours) * 100}%`, background: groupStyle[g.id].accent }}
                />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-black/50">
              {deviceGroups.map((g) => (
                <span key={g.id} className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: groupStyle[g.id].accent }} />
                  {g.name} · {Math.round((groupHours(g) / totalHours) * 100)}%
                </span>
              ))}
            </div>
          </Reveal>

          {/* Every device, named */}
          <Reveal delay={0.15} className="mt-8 grid gap-4 lg:grid-cols-2 lg:gap-5">
            <div className="flex flex-col gap-4 lg:gap-5">
              <DeviceCard g={ego} />
              <DeviceCard g={umi} />
            </div>
            <DeviceCard g={robot} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Supporters() {
  return (
    <section id="supporters" className="relative scroll-mt-24 overflow-hidden bg-ivory pb-24 pt-8 md:pb-32 md:pt-12">
      <Glows>
        <div
          className="absolute left-1/2 top-[10%] h-[700px] w-[1100px] -translate-x-1/2"
          style={{ background: "radial-gradient(closest-side, rgba(255,221,185,.45), rgba(255,221,185,.12) 55%, transparent)" }}
        />
      </Glows>
      <div className="relative mx-auto max-w-[1120px] px-5 md:px-10">
        <Reveal>
          <SectionHead badge="Supporters" tint="peach" title="Backed by builders." body="Velowen is funded by Spark Lab." />
        </Reveal>
        <Reveal delay={0.1} className="mt-12 flex justify-center md:mt-14">
          <a
            href={backer.href}
            target="_blank"
            rel="noreferrer"
            className="glass group flex w-full max-w-[520px] flex-col items-center rounded-[28px] px-8 pb-7 pt-12 transition-transform duration-300 hover:-translate-y-0.5"
          >
            <img src="/logos/sparklab.svg" alt={backer.name} className="h-16 w-auto md:h-20" draggable={false} />
            <span className="mt-10 inline-flex items-center gap-1 text-[14px] text-black/45 transition-colors group-hover:text-black/75">
              sparklab.city <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

// Entry to the dental page: copy on one side, the live splat scene on the other
function DentalEntry() {
  return (
    <section id="dental" className="scroll-mt-24 bg-ivory pb-24 md:pb-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-10">
        <Reveal>
          <Link
            href="/dental"
            className="group relative grid overflow-hidden rounded-[32px] border border-black/[0.05] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]"
            style={{ background: "linear-gradient(135deg, #e3f5f1 0%, #eef2f7 50%, #fbeee2 100%)" }}
          >
            <div className="relative z-10 flex flex-col justify-center p-7 md:p-12">
              <div>
                <Badge tint="mint">Healthcare</Badge>
              </div>
              <h2 className="mt-5 font-serif text-[34px] font-normal leading-[40px] tracking-[-0.015em] text-ink md:text-[48px] md:leading-[54px]">
                Next frontier: dental.
              </h2>
              <p className="mt-4 max-w-[460px] text-[18px] leading-[26px] text-black/60 md:text-[19px] md:leading-[28px]">
                The dental industry's egocentric dataset, and healthcare physical AI built on it. Now collecting with{" "}
                {dental.clinics.count} partner clinics in {dental.clinics.city}.
              </p>
              <span className="pill-dark mt-8 inline-flex h-11 w-fit items-center gap-2 rounded-full px-6 text-[16px] font-medium">
                Explore dental
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
              </span>
            </div>
            <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[480px]">
              <DentistSplat className="absolute inset-0" detail="low" />
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function Spec() {
  return (
    <section
      id="dataset"
      className="scroll-mt-24 py-24 md:py-32"
      style={{ background: "linear-gradient(180deg, #faf9f5 0%, #f0eee6 30%, #f0eee6 70%, #faf9f5 100%)" }}
    >
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 md:px-10 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <Reveal>
          <SectionHead
            align="left"
            badge="Egocentric-10K"
            title="Our first open release."
            body="Ten thousand hours of first-person work across 20+ worksites, packaged for training from day one."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Get early access</BookButton>
            <Link
              href="/data"
              className="inline-flex h-9 items-center gap-1 rounded-full px-4 text-[15px] font-medium text-black/65 hover:text-black/85"
            >
              Full spec <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <SpecTable title="Egocentric-10K" meta="Launching Dec 2026" rows={spec10k.slice(0, 7)} />
        </Reveal>
      </div>
    </section>
  );
}

function Partner() {
  return (
    <section id="partner" className="relative scroll-mt-24 overflow-hidden py-28 md:py-36">
      <div className="pointer-events-none absolute inset-0" style={{ background: "var(--daylight-soft), #faf9f5" }} />
      <div className="relative mx-auto max-w-[1240px] px-5 text-center md:px-10">
        <Reveal>
          <SectionHead
            badge="Partner with us"
            title="Train on our data, or tell us what to collect."
            body="We work with research teams on the data behind their core bets. Start with Egocentric-10K, or scope a custom collection with us."
          />
          <div className="mt-10 flex justify-center">
            <BookButton className="h-11 px-6 text-[16px]">Book a call</BookButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function HomePage() {
  useHashScroll();
  return (
    <div className="min-h-screen bg-ivory">
      <Nav />
      <main>
        <Hero />
        <Mission />
        <Traction />
        <Buyers />
        <Supporters />
        <Spec />
        <DentalEntry />
        <Partner />
      </main>
      <Footer />
    </div>
  );
}
