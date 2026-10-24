import type { ReactNode } from "react";
import { PublicLayout } from "./PublicLayout";
import { CosmicBackgroundCanvas } from "./CosmicBackgroundCanvas";

export function InfoPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <PublicLayout className="bg-[#05060a] text-white">
      <CosmicBackgroundCanvas />
      <main className="relative z-10 mx-auto max-w-5xl px-6 pb-28 pt-36 lg:px-10">
        <div className="border-b border-white/[0.08] pb-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#f5d08a]">
            {eyebrow}
          </p>
          <h1
            className="mt-4 text-4xl font-normal uppercase tracking-tight text-white sm:text-6xl"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-base font-light leading-relaxed text-white/70 sm:text-lg">
            {intro}
          </p>
        </div>
        <div className="prose-universe mt-14 space-y-10 text-white/75">{children}</div>
      </main>
    </PublicLayout>
  );
}
