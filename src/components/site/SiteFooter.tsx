import { Link } from "@tanstack/react-router";
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-semibold text-foreground">Our Visible Universe</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            A cinematic, interactive journey through our scientifically observed cosmos.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/refund-policy">Refund policy</Link>
          <Link to="/faq">FAQ</Link>
        </div>
        <div className="text-sm text-muted-foreground md:text-right">
          <p>Support: ourvisibleuniverse@gmail.com</p>
          <p className="mt-2">Chandigarh, India</p>
        </div>
      </div>
    </footer>
  );
}
