import { Link } from "wouter";
import { CALENDLY_URL, site } from "@/content/site";

const columns = [
  {
    title: "Data",
    links: [
      { label: "Egocentric-10K", href: "/data" },
      { label: "Environments", href: "/data#environments" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Mission", href: "/#mission" },
      { label: "Partner with us", href: "/#partner" },
      { label: "Book a call", href: CALENDLY_URL, external: true },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ivory text-ink">
      <div className="mx-auto max-w-[1240px] px-5 pt-16 md:px-10">
        <div className="grid grid-cols-2 gap-y-10 border-b border-rule pb-12 md:grid-cols-4">
          <div className="col-span-2">
            <p className="max-w-[220px] font-serif text-[18px] leading-6 text-black/75">{site.tagline}</p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-[15px] font-medium">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {"external" in l || l.href.includes("#") ? (
                      <a
                        href={l.href}
                        target={"external" in l ? "_blank" : undefined}
                        rel="noreferrer"
                        className="text-[16px] text-black/55 transition-colors hover:text-black/85"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="text-[16px] text-black/55 transition-colors hover:text-black/85">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Giant wordmark with the daylight line tucked underneath */}
      <div className="mx-auto max-w-[1240px] px-5 pb-12 pt-10 md:px-10">
        <div className="relative select-none">
          <div className="text-[clamp(72px,17vw,232px)] font-medium leading-[0.9] tracking-[-0.05em] text-ink">
            velowen<span className="text-[#7cbffe]">.</span>
          </div>
          <div
            className="-mt-[0.12em] pr-[0.04em] text-right font-serif text-[clamp(40px,9.5vw,132px)] font-normal italic leading-[1.05] tracking-[-0.02em] md:-mt-[0.22em]"
            style={{
              backgroundImage: "linear-gradient(180deg, #accdec 0%, #e7ebf4 55%, #ffddb9 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            for physical AI
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4 text-[14px] text-black/45">
          <p className="max-w-[320px]">Egocentric data and models for the frontier of human physical labor.</p>
          <p>© 2026 Velowen</p>
        </div>
      </div>
    </footer>
  );
}
