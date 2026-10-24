import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Orbit } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/[0.08] bg-[#05060a] py-16 text-white/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-10 border-b border-white/[0.08] pb-12 md:flex-row md:items-center">
          <div className="flex items-center gap-3.5">
            <span className="flex size-9 items-center justify-center rounded-full border border-[#f5d08a]/35 bg-[#f5d08a]/10">
              <Orbit className="size-4 text-[#f5d08a]" />
            </span>
            <div>
              <p
                className="text-sm font-semibold uppercase tracking-[0.24em] text-white"
                style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
              >
                Our Visible Universe
              </p>
              <p className="mt-0.5 text-xs font-light text-white/45">
                Interactive 3D Astrophysics Observatory & Academy
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://ourvisibleuniverse.store"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 text-xs font-medium text-white transition-all hover:border-[#f5d08a]/50 hover:text-[#f5d08a]"
            >
              <span>Official Store</span>
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href="https://www.instagram.com/our_visibleuniverse"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 text-xs font-medium text-white transition-all hover:border-white/35"
            >
              <span>@our_visibleuniverse</span>
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-6 text-xs text-white/45 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/learn" className="hover:text-white transition-colors">
              Academy
            </Link>
            <Link to="/galaxies" className="hover:text-white transition-colors">
              Galaxies
            </Link>
            <Link to="/visible-universe-history" className="hover:text-white transition-colors">
              History
            </Link>
            <Link to="/verify-certificate" className="hover:text-white transition-colors">
              Verify Certificate
            </Link>
            <Link to="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link to="/refund-policy" className="hover:text-white transition-colors">
              Refunds
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>

          <p className="font-mono text-[11px] text-white/35">
            ourvisibleuniverse@gmail.com
          </p>
        </div>
      </div>
    </footer>
  );
}
