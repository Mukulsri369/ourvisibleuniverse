import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Orbit, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const links = [
  ["/features", "Features"],
  ["/science", "Science"],
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
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${overHero ? "border-transparent bg-transparent" : "border-border/60 bg-background/80 backdrop-blur-xl"}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link
          to="/"
          className={`flex items-center gap-2 font-semibold transition-transform hover:scale-105 ${overHero ? "text-hero-foreground" : "text-foreground"}`}
        >
          <Orbit className="size-6 text-primary" />
          Our Visible Universe
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map(([to, label]) => (
            <Link
              key={to}
              to={to}
              className={`text-sm transition hover:scale-105 ${overHero ? "text-hero-muted hover:text-hero-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden gap-2 md:flex">
          <Button asChild variant="ghost" className={overHero ? "text-hero-foreground" : ""}>
            <Link to="/account">Account</Link>
          </Button>
          <Button asChild>
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
        <nav className="border-t border-border bg-background p-5 md:hidden">
          {links.map(([to, label]) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="block border-b border-border py-3 text-foreground"
            >
              {label}
            </Link>
          ))}
          <Button asChild variant="outline" className="mt-5 w-full">
            <Link to="/account" onClick={() => setOpen(false)}>
              Account
            </Link>
          </Button>
          <Button asChild className="mt-3 w-full">
            <Link to="/universe" onClick={() => setOpen(false)}>
              Explore universe
            </Link>
          </Button>
        </nav>
      )}
    </header>
  );
}
