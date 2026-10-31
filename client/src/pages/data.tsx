import { useEffect, useState } from "react";
import { Nav, BookButton } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { SectionHead } from "@/components/site/Badge";
import { SpecTable } from "@/components/site/SpecTable";
import { Timeline } from "@/components/site/Timeline";
import { Montage } from "@/components/montage/Montage";
import { EnvTiles } from "@/components/montage/EnvTiles";
import { environments, releases, spec10k } from "@/content/site";

export default function DataPage() {
  const [level, setLevel] = useState(0);
  const [peek, setPeek] = useState<number | null>(null);

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
  }, []);

  return (
    <div className="min-h-screen bg-ivory">
      <Nav />
      <main>
        <section className="relative overflow-hidden pb-16 pt-36 md:pt-44">
          <div
            className="pointer-events-none absolute inset-0 bg-daylight"
            style={{ maskImage: "linear-gradient(to bottom, #000 0%, #000 40%, transparent 100%)" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-white/25" />
          <div className="relative mx-auto max-w-[1240px] px-5 md:px-10">
            <Reveal>
              <SectionHead
                badge="Dataset"
                title="Egocentric-10K"
                body="Ten thousand hours of first-person footage from 20+ real worksites. Public release in December 2026."
              />
            </Reveal>
          </div>
        </section>

        <section className="pb-24">
          <div className="mx-auto grid max-w-[1240px] gap-10 px-5 md:px-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-14">
            <Reveal>
              <SpecTable title="Specification" meta="v0 · subject to change" rows={spec10k} />
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex h-full flex-col gap-4">
                <div className="overflow-hidden rounded-[24px] border border-rule bg-[#fbfaf7]">
                  <Montage peek={peek} onLevel={setLevel} className="aspect-video w-full" />
                </div>
                <div className="rounded-[24px] bg-daylight p-3">
                  <div className="rounded-[18px] border border-white/40 bg-white/60 p-2 backdrop-blur-[8px]">
                    <Timeline active={peek ?? level} onPeek={setPeek} />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section
          id="environments"
          className="scroll-mt-24 py-24"
          style={{ background: "linear-gradient(180deg, #faf9f5, #f0eee6 40%, #faf9f5)" }}
        >
          <div className="mx-auto max-w-[1240px] px-5 md:px-10">
            <Reveal>
              <SectionHead align="left" badge="Environments" tint="peach" title="Where the hours come from." />
            </Reveal>
            <div className="mt-12 border-t border-rule">
              {environments.map((env, i) => (
                <Reveal key={env.id} delay={i * 0.04}>
                  <div className="grid items-center gap-5 border-b border-rule py-5 md:grid-cols-[200px_1fr_auto] md:gap-10">
                    <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl md:w-[200px]">
                      <EnvTiles env={env} cols={2} rows={2} />
                    </div>
                    <div>
                      <h3 className="font-serif text-[22px] font-normal text-ink">{env.name}</h3>
                      <p className="mt-1 text-[15px] text-black/55">{env.tasks.join(", ")}</p>
                    </div>
                    <span
                      className="justify-self-start rounded-full px-2.5 py-0.5 text-[12px] font-semibold text-white md:justify-self-end"
                      style={{ background: env.tag }}
                    >
                      {env.short}
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-[760px] px-5 text-center md:px-10">
            <Reveal>
              <SectionHead
                badge="Roadmap"
                tint="lilac"
                title={`${releases[0].name} first. Then every order of magnitude after it.`}
                body="Want early access, or a collection scoped to your task? Let's talk."
              />
              <div className="mt-10 flex justify-center">
                <BookButton className="h-11 px-6 text-[16px]">Book a call</BookButton>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
