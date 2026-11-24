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
  anchorCustomer,
  backer,
  capacity,
  dental,
  deviceCount,
  deviceGroups,
  groupHours,
  orders,
  site,
  spec10k,
  totalHours,
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

function Traction() {
  const stats = [
    { value: `${fmt(Math.floor(totalHours / 1000) * 1000)}+`, unit: "h", label: "Validated data in stock, ready to ship" },
    { value: String(capacity.weeklyHours), unit: "h / week", label: "New egocentric data, every week" },
    { value: String(deviceCount), unit: "devices", label: "From head-mounted cameras to humanoid robots" },
  ];
  const ramp = anchorCustomer.ramp;
  return (
    <section id="traction" className="relative scroll-mt-24 bg-ivory pb-24 md:pb-32">
      <div className="mx-auto max-w-[1120px] px-5 md:px-10">
        <Reveal>
          <SectionHead
            badge="Traction"
            title="Already in production."
            body="World model and robotics teams are buying Velowen hours today, and coming back for more."
          />
        </Reveal>

        {/* Three numbers, nothing else */}
        <Reveal className="mt-16 grid gap-10 md:mt-20 md:grid-cols-3 md:gap-8">
          {stats.map((s) => (
            <div key={s.label} className="border-t border-black/70 pt-6">
              <p className="font-serif text-[52px] font-normal leading-none tracking-[-0.03em] text-ink md:text-[60px]">
                {s.value}
                <span className="ml-2 font-sans text-[16px] tracking-normal text-black/40">{s.unit}</span>
              </p>
              <p className="mt-4 text-[16px] leading-6 text-black/55">{s.label}</p>
            </div>
          ))}
        </Reveal>

        {/* Customers: one growth line, then the repeat orders */}
        <Reveal className="mt-20 grid gap-12 md:mt-24 md:grid-cols-2 md:gap-16">
          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-black/40">Anchor customer</p>
            <h3 className="mt-3 font-serif text-[28px] font-normal tracking-[-0.01em] text-ink">{anchorCustomer.name}</h3>
            <p className="mt-1 text-[15px] text-black/45">{anchorCustomer.about}</p>
            <div className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-2">
              {ramp.map((m, i) => (
                <span key={m.month} className="inline-flex items-baseline gap-3">
                  {i > 0 && <ArrowRight className="h-4 w-4 self-center text-black/30" strokeWidth={1.5} />}
                  <span className="font-serif text-[26px] tracking-[-0.01em] text-ink">
                    {m.label}
                    <span className="ml-1 font-sans text-[13px] text-black/40">h</span>
                  </span>
                </span>
              ))}
            </div>
            <p className="mt-2 text-[14px] text-black/45">Hours per month, months 1 to 3. Now a stable recurring order.</p>
          </div>
          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-black/40">Orders</p>
            <ul className="mt-3">
              {orders.map((o) => (
                <li key={o.name} className="flex items-baseline justify-between gap-6 border-b border-rule py-4">
                  <span className="text-[17px] text-black/80">{o.name}</span>
                  <span className="shrink-0 font-serif text-[20px] text-ink">
                    {o.hours.replace(" h", "")}
                    <span className="ml-1 font-sans text-[13px] text-black/40">h</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Inventory() {
  return (
    <section id="inventory" className="scroll-mt-24 bg-ivory pb-24 md:pb-32">
      <div className="mx-auto max-w-[1120px] px-5 md:px-10">
        <Reveal>
          <SectionHead
            badge="Inventory"
            tint="lilac"
            title="Data in stock, by device."
            body="Every hour below is collected, validated and ready to deliver. Need another rig or scenario? We collect to spec."
          />
        </Reveal>
        <div className="mt-16 space-y-14 md:mt-20">
          {deviceGroups.map((g) => (
            <Reveal key={g.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-black/70 pb-4">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h3 className="font-serif text-[26px] font-normal tracking-[-0.01em] text-ink">{g.name}</h3>
                  <span className="text-[14px] text-black/45">{g.about}</span>
                </div>
                <span className="font-serif text-[22px] text-ink">
                  {fmt(groupHours(g))}
                  <span className="ml-1 font-sans text-[13px] text-black/40">h</span>
                </span>
              </div>
              <ul className="grid md:grid-cols-2 md:gap-x-12">
                {g.devices.map((d) => (
                  <li key={d.name} className="flex items-baseline justify-between gap-6 border-b border-rule py-4">
                    <span className="min-w-0">
                      <span className="block text-[16px] text-black/85">{d.name}</span>
                      <span className="block text-[13px] text-black/45">{d.kind}</span>
                    </span>
                    <span className="shrink-0 text-[16px] tabular-nums text-black/70">
                      {fmt(d.hours)}
                      <span className="ml-1 text-[13px] text-black/40">h</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
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
        <Inventory />
        <Supporters />
        <Spec />
        <DentalEntry />
        <Partner />
      </main>
      <Footer />
    </div>
  );
}
