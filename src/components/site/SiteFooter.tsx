import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80 backdrop-blur-xl py-14 text-slate-300">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Top Strip with Brand & Prominent Store CTA */}
        <div className="flex flex-col gap-6 border-b border-white/10 pb-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xl font-bold text-white">Our Visible Universe</p>
            <p className="mt-1 text-sm text-slate-400">
              A cinematic, interactive journey through our scientifically observed cosmos.
            </p>
          </div>
          <Button
            asChild
            className="border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:text-white"
          >
            <a
              href="https://ourvisibleuniverse.store"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <ShoppingBag className="size-4" />
              <span>Visit Official Store</span>
              <ArrowUpRight className="size-3.5 opacity-70" />
            </a>
          </Button>
        </div>

        {/* Links and Contact Details */}
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <div className="text-sm text-slate-400">
            <p className="font-semibold text-white">Authentic Stargazing</p>
            <p className="mt-2 text-xs leading-relaxed">
              Real catalog stars, physically scaled planetary systems, and verified optical gear
              curated for curious minds worldwide.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-400">
            <Link to="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link
              to="/visible-universe-history"
              className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              Cosmic History
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link to="/refund-policy" className="hover:text-white transition-colors">
              Refund policy
            </Link>
            <Link to="/faq" className="hover:text-white transition-colors">
              FAQ
            </Link>
            <a
              href="https://ourvisibleuniverse.store"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
            >
              Physical Store ↗
            </a>
            <a
              href="https://www.instagram.com/our_visibleuniverse"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-300 hover:underline transition-colors flex items-center gap-1"
            >
              Instagram @our_visibleuniverse ↗
            </a>
          </div>
          <div className="text-sm text-slate-400 md:text-right">
            <p>Support: ourvisibleuniverse@gmail.com</p>
            <p className="mt-1 text-slate-300">
              Instagram:{" "}
              <a
                href="https://www.instagram.com/our_visibleuniverse"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 underline"
              >
                @our_visibleuniverse
              </a>
            </p>
            <p className="mt-1">Chandigarh, India</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
