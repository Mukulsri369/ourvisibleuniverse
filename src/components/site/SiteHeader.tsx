import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Orbit, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const links = [
  ["/learn", "Cosmic Learning Academy"],
  ["/cosmic-evolution", "Cosmic Evolution"],
  ["/features", "Features"],
  ["/science", "Science"],
  ["/visible-universe-history", "History"],
  ["/pricing", "Pricing"],
  ["/about", "About"],
  ["/faq", "FAQ"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const overHero = pathname === "/" && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        overHero
          ? "border-transparent bg-transparent"
          : "border-white/10 bg-slate-950/80 backdrop-blur-xl text-slate-100"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link
          to="/"
          className={`flex items-center gap-2 font-semibold transition-transform hover:scale-105 ${
            overHero ? "text-hero-foreground" : "text-white"
          }`}
        >
          <Orbit className="size-6 text-cyan-400" />
          Our Visible Universe
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map(([to, label]) => {
            const isAcademy = to === "/learn";
            return (
              <Link
                key={to}
                to={to}
                className={`text-sm transition hover:scale-105 ${
                  isAcademy
                    ? "font-bold text-cyan-300 hover:text-cyan-200 bg-cyan-500/15 border border-cyan-500/40 px-3 py-1 rounded-full shadow-sm shadow-cyan-500/20"
                    : overHero
                      ? "text-hero-muted hover:text-hero-foreground"
                      : "text-slate-300 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-border hover:border-cyan-400 hover:text-cyan-300"
          >
            <a
              href="https://ourvisibleuniverse.store"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5"
            >
              <ShoppingBag className="size-3.5 text-cyan-400" />
              <span>Store</span>
            </a>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={overHero ? "text-hero-foreground" : ""}
          >
            <Link to="/account">Account</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/universe">Explore universe</Link>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={`md:hidden ${overHero ? "text-hero-foreground" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <nav className="border-t border-white/10 bg-slate-950/95 backdrop-blur-2xl p-5 md:hidden">
          {links.map(([to, label]) => {
            const isAcademy = to === "/learn";
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`block py-3 transition-colors ${
                  isAcademy
                    ? "text-cyan-300 font-bold bg-cyan-500/15 border border-cyan-500/30 px-3.5 rounded-xl my-1.5 shadow-sm shadow-cyan-500/10"
                    : "border-b border-white/10 text-slate-200 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <Button
            asChild
            variant="outline"
            className="mt-5 w-full border-cyan-500/30 text-cyan-300"
          >
            <a
              href="https://ourvisibleuniverse.store"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2"
            >
              <ShoppingBag className="size-4 text-cyan-400" />
              <span>Visit Official Store</span>
            </a>
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full">
            <Link to="/account" onClick={() => setOpen(false)}>
              Account
            </Link>
          </Button>
          <Button asChild className="mt-2 w-full">
            <Link to="/universe" onClick={() => setOpen(false)}>
              Explore universe
            </Link>
          </Button>
        </nav>
      )}
    </header>
  );
}
