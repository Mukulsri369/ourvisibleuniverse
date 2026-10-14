import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
export function PublicLayout({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`min-h-screen bg-background text-foreground ${className ?? ""}`}>
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
