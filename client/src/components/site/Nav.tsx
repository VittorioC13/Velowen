import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { CALENDLY_URL, nav } from "@/content/site";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`text-[22px] font-semibold tracking-[-0.035em] text-ink ${className}`}>
      velowen<span className="text-[#7cbffe]">.</span>
    </span>
  );
}

function NavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  const cls =
    "flex h-8 items-center rounded-full px-3 text-[15px] font-medium text-black/65 transition-colors duration-150 hover:text-black/85";
  // Hash links stay plain anchors so the browser scrolls to the section
  return href.includes("#") ? (
    <a href={href} className={cls} onClick={onClick}>
      {label}
    </a>
  ) : (
    <Link href={href} className={cls} onClick={onClick}>
      {label}
    </Link>
  );
}

export function BookButton({ className = "", children = "Book a call" }: { className?: string; children?: React.ReactNode }) {
  return (
    <a
      href={CALENDLY_URL}
      target="_blank"
      rel="noreferrer"
      className={`pill-dark group relative inline-flex h-9 items-center justify-center overflow-hidden rounded-full px-5 text-[15px] font-medium ${className}`}
    >
      <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
      <span className="relative">{children}</span>
    </a>
  );
}

export function Nav() {
  const [glass, setGlass] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setGlass(Math.min(1, window.scrollY / 120));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-10 md:pt-5">
      <header className="relative mx-auto grid h-12 max-w-[1240px] grid-cols-[1fr_auto] items-center rounded-[34px] px-2 md:grid-cols-[1fr_auto_1fr]">
        <div
          className="absolute inset-0 rounded-[34px] border border-white/50 bg-white/70 shadow-[0_8px_30px_rgba(50,61,86,0.08)] backdrop-blur-[10px]"
          style={{ opacity: open ? 1 : glass }}
        />
        <Link href="/" className="relative flex items-center pl-3">
          <Wordmark />
        </Link>
        <nav className="relative hidden items-center md:flex">
          {nav.map((n) => (
            <NavLink key={n.href} {...n} />
          ))}
        </nav>
        <div className="relative flex items-center justify-end gap-1">
          <BookButton className="hidden md:inline-flex" />
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-black/70 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
          </button>
        </div>
      </header>
      {open && (
        <div className="glass mx-auto mt-2 flex max-w-[1240px] flex-col gap-1 rounded-[28px] p-3 md:hidden">
          {nav.map((n) => (
            <NavLink key={n.href} {...n} onClick={() => setOpen(false)} />
          ))}
          <BookButton className="mt-2 w-full" />
        </div>
      )}
    </div>
  );
}
