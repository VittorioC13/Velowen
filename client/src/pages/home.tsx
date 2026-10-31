import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Nav, BookButton } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { ScrubText } from "@/components/site/ScrubText";
import { SectionHead } from "@/components/site/Badge";
import { SpecTable } from "@/components/site/SpecTable";
import { Timeline } from "@/components/site/Timeline";
import { Montage } from "@/components/montage/Montage";
import { pillars, site, spec10k } from "@/content/site";

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

function DataModels() {
  return (
    <section className="relative overflow-hidden bg-ivory py-24 md:py-32">
      <div
        className="pointer-events-none absolute left-[-10%] top-[10%] h-[920px] w-[920px]"
        style={{ background: "radial-gradient(circle farthest-side, rgba(238,183,128,.40) 0%, rgba(238,183,128,.18) 38%, rgba(238,183,128,.06) 66%, transparent 100%)" }}
      />
      <div
        className="pointer-events-none absolute right-[-12%] top-[-5%] h-[920px] w-[920px]"
        style={{ background: "radial-gradient(circle farthest-side, rgba(140,166,212,.38) 0%, rgba(140,166,212,.18) 38%, rgba(140,166,212,.06) 66%, transparent 100%)" }}
      />
      <div className="relative mx-auto max-w-[1240px] px-5 md:px-10">
        <Reveal>
          <SectionHead
            badge="Data × Models"
            tint="lilac"
            title="Data and models, in parallel."
            body="We collect the data and train on it at the same time. Each side tells the other what to do next."
          />
        </Reveal>
        <div className="mx-auto mt-14 grid max-w-[980px] gap-4 md:grid-cols-2 md:gap-5">
          {pillars.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.1}>
              <div className="glass h-full rounded-[28px] p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-[28px] font-normal tracking-[-0.01em] text-ink">{p.title}</h3>
                  <span className="text-[13px] text-black/40">0{i + 1}</span>
                </div>
                <p className="mt-3 text-[16px] leading-[25px] text-black/65">{p.body}</p>
                <dl className="mt-6 border-t border-rule">
                  {p.rows.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 border-b border-rule py-3 text-[14px]">
                      <dt className="text-black/45">{k}</dt>
                      <dd className="text-right text-black/80">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          ))}
        </div>
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
        <DataModels />
        <Spec />
        <Partner />
      </main>
      <Footer />
    </div>
  );
}
