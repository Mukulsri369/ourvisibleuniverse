import type { ReactNode } from "react";
import { PublicLayout } from "./PublicLayout";
export function InfoPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return <PublicLayout><main className="mx-auto max-w-4xl px-5 pb-24 pt-36 lg:px-8"><p className="text-sm font-semibold uppercase text-primary">{eyebrow}</p><h1 className="mt-4 text-4xl font-semibold sm:text-6xl">{title}</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">{intro}</p><div className="prose-universe mt-14 space-y-10 text-muted-foreground">{children}</div></main></PublicLayout>;
}