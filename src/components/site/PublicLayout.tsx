import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
export function PublicLayout({ children }: { children: ReactNode }) { return <div className="min-h-screen bg-background text-foreground"><SiteHeader />{children}<SiteFooter /></div>; }