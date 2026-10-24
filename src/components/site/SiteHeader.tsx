import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, Menu, Orbit, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  ["/learn", "Academy"],
  ["/galaxies", "Galaxies"],
  ["/science", "Science"],
  ["/pricing", "Passes"],
  ["/about", "About"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const overHero = pathname === "/" && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        overHero
          ? "bg-transparent py-4"
          : "border-b border-white/[0.08] bg-[#05060a]/85 py-3 backdrop-blur-2xl"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link
          to="/"
          className="group flex items-center gap-3 text-white transition-opacity hover:opacity-90"
        >
          <span className="flex size-8 items-center justify-center rounded-full border border-[#f5d08a]/35 bg-[#f5d08a]/10">
            <Orbit className="size-4 text-[#f5d08a] transition-transform duration-500 group-hover:rotate-180" />
          </span>
          <span
            className="text-xs font-semibold uppercase tracking-[0.24em] text-white"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            Our Visible Universe
          </span>
        </Link>

        {/* Minimalist Floating Center Pill Nav */}
        <nav className="hidden items-center gap-1 rounded-full border border-white/[0.1] bg-white/[0.03] px-2 py-1 backdrop-blur-xl md:flex">
          {links.map(([to, label]) => (
            <Link
              key={to}
              to={to}
              className="rounded-full px-4 py-1.5 text-xs font-medium tracking-wide text-white/70 transition-colors hover:bg-white/[0.07] hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden items-center gap-2.5 md:flex">
          <a
            href="https://ourvisibleuniverse.store"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-4 text-xs font-medium text-white/80 backdrop-blur-xl transition-all hover:border-white/30 hover:text-white"
          >
            <ShoppingBag className="size-3.5 text-[#f5d08a]" />
            <span>Store</span>
          </a>

          <Link
            to="/account"
            className="px-3 py-1.5 text-xs font-medium text-white/65 transition-colors hover:text-white"
          >
            Account
          </Link>

          <Link
            to="/universe"
            className="group inline-flex h-9 items-center gap-2 rounded-full bg-[#f5d08a] pl-4 pr-1.5 text-xs font-semibold text-[#05060a] transition-all hover:bg-white"
          >
            <span>3D Atlas</span>
            <span className="flex size-6 items-center justify-center rounded-full bg-[#05060a] text-[#f5d08a] transition-transform duration-300 group-hover:rotate-45 group-hover:text-white">
              <ArrowUpRight className="size-3.5" />
            </span>
          </Link>
        </div>

        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open && (
        <nav className="mt-3 border-t border-white/10 bg-[#05060a]/95 px-6 py-6 backdrop-blur-2xl md:hidden">
          <div className="flex flex-col space-y-2">
            {links.map(([to, label]) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="border-b border-white/[0.06] py-2.5 text-sm text-white/80 hover:text-white"
              >
                {label}
              </Link>
            ))}
            <Link
              to="/account"
              onClick={() => setOpen(false)}
              className="border-b border-white/[0.06] py-2.5 text-sm text-white/80 hover:text-white"
            >
              Account
            </Link>
          </div>
          <div className="mt-5 flex flex-col gap-2.5">
            <a
              href="https://ourvisibleuniverse.store"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 text-xs font-medium uppercase tracking-widest text-white"
            >
              <ShoppingBag className="size-3.5 text-[#f5d08a]" />
              <span>Official Store</span>
            </a>
            <Link
              to="/universe"
              onClick={() => setOpen(false)}
              className="flex h-11 items-center justify-center rounded-full bg-[#f5d08a] text-xs font-semibold uppercase tracking-widest text-[#05060a]"
            >
              Enter 3D Universe
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
