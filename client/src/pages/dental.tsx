import { useEffect } from "react";
import { ArrowDown } from "lucide-react";
import { Nav, BookButton } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { Badge, SectionHead } from "@/components/site/Badge";
import { SpecTable } from "@/components/site/SpecTable";
import { LazyDentistSplat as DentistSplat } from "@/components/dental/LazyDentistSplat";
import { dental } from "@/content/site";

const tracks = [
  {
    title: "Dataset",
    lead: dental.rows[0][1],
    body: "First-person video of dental work, captured from the clinician's point of view: fine, two-handed, high-stakes manipulation.",
  },
  {
    title: "Model",
    lead: dental.rows[1][1],
    body: "We train on what we collect, building toward physical AI that can assist in the clinic.",
  },
];

export default function DentalPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { count, city } = dental.clinics;

  return (
    <div className="min-h-screen bg-ivory">
      <Nav />
      <main>
        {/* Hero: copy on the left, the splat operatory on the right */}
        <section className="relative overflow-hidden pb-20 pt-32 md:pb-28 md:pt-40">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "linear-gradient(160deg, #dff3ee 0%, #e9eff6 45%, #faf9f5 85%)",
              maskImage: "linear-gradient(to bottom, #000 60%, transparent 100%)",
            }}
          />
          <div className="relative mx-auto grid max-w-[1240px] items-center gap-10 px-5 md:px-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
            <div>
              <Reveal>
                <Badge tint="mint">Healthcare · Dental</Badge>
              </Reveal>
              <Reveal delay={0.08}>
                <h1 className="mt-6 font-serif text-[42px] font-normal leading-[48px] tracking-[-0.02em] text-ink md:text-[60px] md:leading-[66px]">
                  Egocentric data for dentistry.
                </h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="mt-6 max-w-[520px] text-[19px] leading-[28px] text-black/55 md:text-[21px] md:leading-[31px]">
                  We're building the dental industry's egocentric dataset, and the healthcare physical AI that learns from it.
                </p>
              </Reveal>
              <Reveal delay={0.24} className="mt-9 flex flex-wrap items-center gap-3">
                <BookButton className="h-11 px-6 text-[16px]">Partner with us</BookButton>
                <a
                  href="#shanghai"
                  className="inline-flex h-11 items-center gap-1.5 rounded-full border border-white/60 bg-white/50 px-6 text-[16px] font-medium text-black/70 backdrop-blur-[20px] transition-colors hover:text-black/90"
                >
                  {count} clinics in {city} <ArrowDown className="h-4 w-4" strokeWidth={1.5} />
                </a>
              </Reveal>
            </div>

            <Reveal delay={0.2}>
              <div className="relative">
                <div
                  className="relative aspect-[4/3.2] overflow-hidden rounded-[28px] border border-white/60 shadow-[0_2px_30px_rgba(50,61,86,0.10)]"
                  style={{ background: "radial-gradient(120% 90% at 50% 20%, #ffffff 0%, #eef4f8 55%, #e2efec 100%)" }}
                >
                  <DentistSplat className="absolute inset-0" />
                  <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-[12px] text-black/55 backdrop-blur-[10px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#46ccbd]" />
                    Gaussian splat · illustrative
                  </div>
                </div>
                <p className="mt-3 hidden text-center text-[13px] text-black/40 md:block">Move your cursor over the scene to look around.</p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Shanghai data collaboration */}
        <section id="shanghai" className="scroll-mt-24 py-20 md:py-28">
          <div className="mx-auto grid max-w-[1240px] gap-12 px-5 md:px-10 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <Reveal>
              <SectionHead
                align="left"
                badge="Data collaboration"
                tint="mint"
                title={`${count} partner clinics in ${city}.`}
                body="Our dental data collection runs with partner clinics in Shanghai, capturing real procedures from the clinician's point of view."
              />
            </Reveal>
            <Reveal delay={0.1}>
              <SpecTable
                title="Shanghai collaboration"
                meta={dental.status}
                rows={[
                  { label: "Partner clinics", value: String(count) },
                  { label: "City", value: city },
                  { label: "Capture", value: "Egocentric, clinician's point of view" },
                  { label: "Dataset", value: dental.rows[0][1] },
                  { label: "Model", value: dental.rows[1][1] },
                ]}
              />
            </Reveal>
          </div>
          <div className="mx-auto mt-14 grid max-w-[1240px] gap-3 px-5 sm:grid-cols-3 md:px-10">
            {Array.from({ length: count }, (_, i) => (
              <Reveal key={i} delay={0.08 * i}>
                <div className="glass flex items-end justify-between rounded-[24px] p-6">
                  <div>
                    <p className="text-[13px] text-black/45">Partner clinic</p>
                    <p className="mt-1 font-serif text-[22px] text-ink">{city}</p>
                  </div>
                  <span className="font-serif text-[44px] leading-none tracking-[-0.03em] text-black/15">0{i + 1}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* What we're building */}
        <section
          className="py-20 md:py-28"
          style={{ background: "linear-gradient(180deg, #faf9f5 0%, #f0eee6 30%, #f0eee6 70%, #faf9f5 100%)" }}
        >
          <div className="mx-auto max-w-[1240px] px-5 md:px-10">
            <Reveal>
              <SectionHead badge="What we're building" tint="lilac" title="Data and models, for the clinic." />
            </Reveal>
            <div className="mx-auto mt-12 grid max-w-[980px] gap-4 md:grid-cols-2 md:gap-5">
              {tracks.map((t, i) => (
                <Reveal key={t.title} delay={i * 0.1}>
                  <div className="glass h-full rounded-[28px] p-6 md:p-8">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-[28px] font-normal tracking-[-0.01em] text-ink">{t.title}</h3>
                      <span className="text-[13px] text-black/40">0{i + 1}</span>
                    </div>
                    <p className="mt-3 font-serif text-[18px] leading-[26px] text-black/80">{t.lead}</p>
                    <p className="mt-3 text-[16px] leading-[25px] text-black/60">{t.body}</p>
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
                badge="Partner with us"
                title="Clinics, labs and research teams: let's talk."
                body="Join the collaboration as a clinic, or train on the data as it grows."
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
