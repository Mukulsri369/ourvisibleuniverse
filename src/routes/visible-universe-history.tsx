import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Compass,
  Telescope,
  Sparkles,
  ArrowDown,
  ArrowUp,
  Layers,
  Calendar,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Globe2,
  Atom,
  Clock,
  RotateCcw,
  Orbit,
  Maximize2,
  Minimize2,
  GraduationCap,
  HelpCircle,
} from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { HISTORY_CHAPTERS, HistoryChapter } from "@/lib/visible-universe-history-data";
import { CosmicHistoryVisualizer } from "@/components/history/CosmicHistoryVisualizer";
import { CosmicConceptSheet } from "@/components/cosmic-history/CosmicConceptSheet";
import { CosmicConceptPill } from "@/components/cosmic-history/CosmicConceptPill";
import { ChapterFaqAccordion } from "@/components/cosmic-history/ChapterFaqAccordion";
import { HighlightCosmicText } from "@/components/cosmic-history/HighlightCosmicText";
import { getChapterFaqs, getChapterConceptIds } from "@/lib/chapter-faqs";
import { COSMIC_CONCEPTS, CosmicConcept } from "@/lib/cosmic-concepts";
import ancientSkyImg from "@/assets/images/history_ancient_sky_1792040616385.jpg";
import cosmicWebImg from "@/assets/images/history_deep_space_web_1792040615422.jpg";

export const Route = createFileRoute("/visible-universe-history")({
  head: () => ({
    meta: [
      { title: "Visible Universe History | How Humanity Discovered the Cosmos" },
      {
        name: "description",
        content:
          "Interactive cosmological timeline for students: from ancient astronomical models to the Big Bang, redshift, dark matter, and modern space observatories with verified NASA and Wikipedia sources.",
      },
      {
        property: "og:title",
        content: "Visible Universe History | How Humanity Discovered the Cosmos",
      },
      {
        property: "og:description",
        content:
          "An interactive, scroll-driven scientific journey through every major cosmological model in human history with animated mathematical geometry and verified evidence.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VisibleUniverseHistoryPage,
});

function VisibleUniverseHistoryPage() {
  const [activeChapterId, setActiveChapterId] = useState<number>(1);
  const [timelineFilter, setTimelineFilter] = useState<string>("All");
  const [isMobileVisExpanded, setIsMobileVisExpanded] = useState<boolean>(true);
  const [selectedConcept, setSelectedConcept] = useState<CosmicConcept | null>(null);
  const [isConceptSheetOpen, setIsConceptSheetOpen] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  const chapterRefs = useRef<{ [key: number]: HTMLElement | null }>({});

  const activeChapter =
    HISTORY_CHAPTERS.find((c) => c.id === activeChapterId) || HISTORY_CHAPTERS[0];

  const handleOpenConcept = (concept: CosmicConcept) => {
    setSelectedConcept(concept);
    setIsConceptSheetOpen(true);
  };

  // Keyboard shortcut: Esc to exit maximized mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMaximized) {
        setIsMaximized(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMaximized]);

  // Sync scroll in maximized mode with activeChapterId
  useEffect(() => {
    if (!isMaximized) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = Number(entry.target.getAttribute("data-max-chapter-id"));
            if (id) {
              setActiveChapterId(id);
            }
          }
        });
      },
      { rootMargin: "-20% 0px -40% 0px", threshold: 0.1 },
    );

    HISTORY_CHAPTERS.forEach((ch) => {
      const el = document.getElementById(`max-ch-${ch.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isMaximized]);

  // IntersectionObserver in regular mode to synchronize scrolling with active chapter
  useEffect(() => {
    if (isMaximized) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = Number(entry.target.getAttribute("data-chapter-id"));
            if (id) {
              setActiveChapterId(id);
            }
          }
        });
      },
      {
        rootMargin: "-20% 0px -40% 0px",
        threshold: 0.1,
      },
    );

    Object.values(chapterRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isMaximized]);

  const scrollToChapter = (id: number) => {
    const clampedId = Math.max(1, Math.min(HISTORY_CHAPTERS.length, id));
    const target = chapterRefs.current[clampedId];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveChapterId(clampedId);
    }
  };

  const scrollToFirstChapter = () => {
    scrollToChapter(1);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEnterMaximized = (targetId?: number) => {
    const idToScroll = targetId ?? activeChapterId;
    setIsMaximized(true);
    setTimeout(() => {
      const el = document.getElementById(`max-ch-${idToScroll}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  };

  const handleExitMaximized = () => {
    setIsMaximized(false);
    setTimeout(() => {
      scrollToChapter(activeChapterId);
    }, 60);
  };

  const scrollToMaxChapter = (id: number) => {
    setActiveChapterId(id);
    const el = document.getElementById(`max-ch-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Grouped eras for quick timeline jump bar
  const ERAS = [
    "All",
    "Ancient & Prehistoric",
    "Classical Antiquity",
    "Medieval & Global Astronomy",
    "Scientific Revolution",
    "Stellar & Early Modern",
    "Relativity & Galaxies",
    "Cosmology & Big Bang",
    "Contemporary Frontier",
  ] as const;

  const filteredChapters =
    timelineFilter === "All"
      ? HISTORY_CHAPTERS
      : HISTORY_CHAPTERS.filter((c) => c.era === timelineFilter);

  return (
    <PublicLayout>
      <div className="relative min-h-screen bg-[#030611] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* ============================================================== */}
        {/* 1. CINEMATIC FULL-SCREEN OPENING HERO SCENE                    */}
        {/* ============================================================== */}
        <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 pt-24 text-center sm:px-12">
          {/* Hero Atmospheric Background */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <img
              src={ancientSkyImg}
              alt="Ancient megalithic observatory under starry sky"
              className="size-full object-cover opacity-25 filter blur-[1px] brightness-75 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#030611]/80 via-[#030611]/60 to-[#030611]" />
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-cyan-500/10 blur-[130px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl">
            {/* Topic Kicker */}
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-cyan-300 backdrop-blur-md">
              <Compass className="size-3.5 text-cyan-400" />
              <span>Visible Universe History · Grade 10–11 Interactive Astronomy Guide</span>
            </div>

            {/* Display Headline */}
            <h1 className="mt-8 text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.08] text-balance">
              Humanity Has Reimagined the Universe for Thousands of Years
            </h1>

            {/* Editorial Body */}
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Every civilization inherited a sky. Every generation found new ways to explain it.
              Follow the changing models that transformed the universe from a mysterious canopy into
              an evolving, 13.8-billion-year-old cosmos—complete with verified NASA research,
              Wikipedia archives, and high school physics insights.
            </p>

            {/* Primary Action Button */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={scrollToFirstChapter}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:bg-cyan-400 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Begin the Journey</span>
                <ArrowDown className="size-4" />
              </button>

              <button
                type="button"
                onClick={() => handleEnterMaximized(1)}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-950/40 px-6 py-3.5 text-sm font-bold text-cyan-200 shadow-lg shadow-cyan-950/50 backdrop-blur-md transition hover:bg-cyan-900/50 hover:text-white hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Maximize2 className="size-4 text-cyan-300" />
                <span>Maximize Chapters Screen</span>
              </button>

              <Link
                to="/learn"
                search={{ module: "19" }}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-950/40 px-6 py-3.5 text-sm font-semibold text-amber-200 shadow-lg shadow-amber-950/40 transition hover:bg-amber-900/50 hover:text-white"
              >
                <GraduationCap className="size-4 text-amber-300" />
                <span>Cosmic Academy: Module 19</span>
              </Link>

              <Link
                to="/universe"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Orbit className="size-4 text-cyan-400" />
                <span>Explore 3D Universe Engine</span>
              </Link>
            </div>

            {/* Editorial Timeline Metric Strip */}
            <div className="mx-auto mt-14 grid max-w-2xl grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-slate-950/70 p-4 backdrop-blur-md text-xs text-slate-400">
              <div>
                <span className="block font-mono text-lg font-bold text-white">32,000+</span>
                <span>Years of Human Models</span>
              </div>
              <div>
                <span className="block font-mono text-lg font-bold text-cyan-400">26 Chapters</span>
                <span>Scientific Breakthroughs</span>
              </div>
              <div>
                <span className="block font-mono text-lg font-bold text-amber-400">
                  NASA & Wiki
                </span>
                <span>Verified Scholarly Guides</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 2. ERA FILTER TABS & TIMELINE JUMP BAR                         */}
        {/* ============================================================== */}
        <div className="sticky top-16 z-40 border-y border-white/10 bg-slate-950/95 px-4 py-2.5 backdrop-blur-xl shadow-lg shadow-black/40">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 overflow-x-auto text-xs no-scrollbar">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
                Filter Era:
              </span>
              {ERAS.map((era) => (
                <button
                  key={era}
                  type="button"
                  onClick={() => setTimelineFilter(era)}
                  className={`rounded-lg px-2.5 py-1 transition whitespace-nowrap text-[11px] font-medium cursor-pointer ${
                    timelineFilter === era
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {era}
                </button>
              ))}
            </div>

            {/* Active Model Indicator & Maximize Trigger */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-slate-400">
                <span>Epoch:</span>
                <span className="text-cyan-300 font-semibold">{activeChapter.yearDisplay}</span>
              </div>

              <button
                type="button"
                onClick={() => handleEnterMaximized()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-3 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/30 transition cursor-pointer"
                title="Maximize chapters images and text to full screen"
              >
                <Maximize2 className="size-3.5" />
                <span>Maximize</span>
                <span className="hidden md:inline">Chapters</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2B. MOBILE STICKY COSMIC ANIMATION VIEWPORT (SCREENS < LG)     */}
        {/* Sticks directly to the top as students scroll chapters!         */}
        {/* ============================================================== */}
        <div className="lg:hidden sticky top-[108px] z-30 border-b border-cyan-500/30 bg-slate-950/95 shadow-2xl shadow-cyan-950/60 backdrop-blur-xl">
          <div className="px-3 py-2 sm:px-4">
            {/* Header controls bar */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0 rounded bg-cyan-500/20 border border-cyan-500/40 px-1.5 py-0.5 font-mono text-[10px] font-bold text-cyan-300">
                  CH {activeChapter.id.toString().padStart(2, "0")}
                </span>
                <span className="font-semibold text-white text-xs truncate">
                  {activeChapter.title}
                </span>
                <span className="text-[10px] text-amber-300/80 font-mono hidden xs:inline shrink-0">
                  ({activeChapter.yearDisplay})
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Prev Chapter */}
                <button
                  type="button"
                  disabled={activeChapter.id <= 1}
                  onClick={() => scrollToChapter(activeChapter.id - 1)}
                  className="rounded-lg bg-white/5 p-1 text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  title="Previous chapter"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                {/* Next Chapter */}
                <button
                  type="button"
                  disabled={activeChapter.id >= HISTORY_CHAPTERS.length}
                  onClick={() => scrollToChapter(activeChapter.id + 1)}
                  className="rounded-lg bg-white/5 p-1 text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  title="Next chapter"
                >
                  <ChevronRight className="size-3.5" />
                </button>

                {/* Maximize Chapters Button (Mobile) */}
                <button
                  type="button"
                  onClick={() => handleEnterMaximized()}
                  className="inline-flex items-center gap-1 rounded-md border border-cyan-500/40 bg-cyan-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300 hover:bg-cyan-500/30 transition cursor-pointer"
                  title="Maximize chapters images and text to full screen"
                >
                  <Maximize2 className="size-3" />
                  <span>Max</span>
                </button>

                {/* Collapsible toggle */}
                <button
                  type="button"
                  onClick={() => setIsMobileVisExpanded(!isMobileVisExpanded)}
                  className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-300 hover:bg-white/10 transition cursor-pointer"
                >
                  {isMobileVisExpanded ? (
                    <>
                      <Minimize2 className="size-3" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3 text-cyan-400" />
                      <span>Sim</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Embedded Live Simulation Viewport (Completely visible with aspect ratio scaling) */}
            {isMobileVisExpanded && (
              <div className="mt-2 overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-900/90 shadow-inner animate-in fade-in duration-200">
                <CosmicHistoryVisualizer
                  chapter={activeChapter}
                  onJumpToChapter={scrollToChapter}
                  onMaximize={() => handleEnterMaximized()}
                  compact={true}
                />
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. CORE EXPERIENCE: SPLIT-SCREEN INTERACTIVE SCROLLER          */}
        {/* ============================================================== */}
        <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* ------------------------------------------------------------ */}
            {/* LEFT / STICKY VISUALIZATION CONSOLE (DESKTOP ONLY: LG+)       */}
            {/* Sized cleanly within viewport height so COMPLETE animation is */}
            {/* 100% visible on desktop without overflow!                     */}
            {/* ------------------------------------------------------------ */}
            <div className="hidden lg:block lg:sticky lg:top-24 lg:col-span-6 xl:col-span-7 space-y-3 lg:max-h-[calc(100vh-6.5rem)]">
              <CosmicHistoryVisualizer
                chapter={activeChapter}
                onJumpToChapter={scrollToChapter}
                onMaximize={() => handleEnterMaximized()}
                isMaximized={false}
              />

              {/* Quick Jump Timeline Rail with Maximize Button */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3.5 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold uppercase tracking-wider text-slate-300 text-[11px]">
                      Chronological Index ({filteredChapters.length} Models)
                    </span>
                    <span className="font-mono text-cyan-400 text-[11px]">
                      Ch {activeChapter.id} of 26
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleEnterMaximized()}
                    className="inline-flex items-center gap-1 rounded-md border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/25 transition cursor-pointer"
                    title="Maximize chapters images and text to full screen"
                  >
                    <Maximize2 className="size-3" />
                    <span>Maximize View</span>
                  </button>
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {filteredChapters.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => scrollToChapter(ch.id)}
                      title={`Ch ${ch.id}: ${ch.title} (${ch.yearDisplay})`}
                      className={`h-7 min-w-7 rounded-lg px-2 font-mono text-xs transition flex items-center justify-center shrink-0 cursor-pointer ${
                        activeChapterId === ch.id
                          ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25"
                          : "border border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {ch.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* RIGHT: NARRATIVE STREAM (FULL ON MOBILE, 6 COLS ON DESKTOP)   */}
            {/* ------------------------------------------------------------ */}
            <div className="lg:col-span-6 xl:col-span-5 space-y-16">
              {/* Header Banner to Maximize */}
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-cyan-500/25 bg-cyan-950/20 p-3.5 backdrop-blur-md">
                <div className="text-xs">
                  <span className="font-semibold text-white block">26 Cosmic Epochs</span>
                  <span className="text-slate-400 text-[11px]">
                    Scroll through chapters below or maximize to focus on images & text
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleEnterMaximized()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400 transition cursor-pointer shrink-0"
                >
                  <Maximize2 className="size-3.5" />
                  <span>Maximize</span>
                </button>
              </div>

              {HISTORY_CHAPTERS.map((ch) => {
                const isActive = activeChapterId === ch.id;
                const conceptIds = getChapterConceptIds(ch.id);
                const faqs = getChapterFaqs(ch.id);

                return (
                  <article
                    key={ch.id}
                    data-chapter-id={ch.id}
                    ref={(el) => {
                      chapterRefs.current[ch.id] = el;
                    }}
                    className={`relative rounded-3xl border transition-all duration-300 p-5 sm:p-8 backdrop-blur-md ${
                      isActive
                        ? "border-cyan-500/40 bg-slate-900/80 shadow-2xl shadow-cyan-950/30 ring-1 ring-cyan-500/20"
                        : "border-white/10 bg-slate-950/40 hover:border-white/20"
                    }`}
                  >
                    {/* Chapter Metadata Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-400">
                          CHAPTER {ch.id.toString().padStart(2, "0")}
                        </span>
                        <span className="text-white/30">·</span>
                        <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-amber-300">
                          {ch.yearDisplay}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">{ch.era}</span>
                        <button
                          type="button"
                          onClick={() => handleEnterMaximized(ch.id)}
                          className="rounded-md border border-white/10 bg-white/5 p-1 text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition cursor-pointer"
                          title="Maximize this chapter to full screen"
                        >
                          <Maximize2 className="size-3" />
                        </button>
                      </div>
                    </div>

                    {/* Titles */}
                    <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      {ch.title}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-cyan-300/90">{ch.subtitle}</p>

                    {/* Civilizations & Key Thinkers */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="font-medium text-slate-300">Civilizations:</span>
                      <span>{ch.civilizations.join(", ")}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="font-medium text-slate-300">Key Observers:</span>
                      <span>{ch.keyFigures.join(", ")}</span>
                    </div>

                    {/* Grade 10-11 Concept Spotlight Badges (NASA & Wikipedia) */}
                    {conceptIds.length > 0 && (
                      <div className="mt-5 rounded-2xl border border-cyan-500/25 bg-gradient-to-r from-cyan-950/30 via-slate-900/40 to-indigo-950/30 p-4">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-semibold mb-2.5">
                          <GraduationCap className="h-4 w-4 text-amber-400" />
                          <span>Grade 10–11 Concept Spotlight (NASA & Wikipedia):</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {conceptIds.map((cid) => (
                            <CosmicConceptPill
                              key={cid}
                              conceptId={cid}
                              onSelect={handleOpenConcept}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Summary Lead with concept highlighting */}
                    <div className="mt-5 text-sm leading-relaxed text-slate-200">
                      <HighlightCosmicText text={ch.summary} onSelectConcept={handleOpenConcept} />
                    </div>

                    {/* Historical Context */}
                    <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                        <Clock className="size-3.5 text-cyan-400" />
                        <span>Historical & Cultural Context</span>
                      </div>
                      <div className="mt-2 text-xs leading-relaxed text-slate-300">
                        <HighlightCosmicText
                          text={ch.historicalContext}
                          onSelectConcept={handleOpenConcept}
                        />
                      </div>
                    </div>

                    {/* The Model Itself */}
                    <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                        <Layers className="size-3.5 text-cyan-400" />
                        <span>The Proposed Model</span>
                      </div>
                      <div className="mt-2 text-xs leading-relaxed text-slate-300 whitespace-pre-line">
                        <HighlightCosmicText
                          text={ch.theModel}
                          onSelectConcept={handleOpenConcept}
                        />
                      </div>
                    </div>

                    {/* Observations & Supporting Evidence */}
                    <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                        <CheckCircle2 className="size-3.5 text-emerald-400" />
                        <span>What Observations Supported It?</span>
                      </div>
                      <div className="mt-2 text-xs leading-relaxed text-slate-300 whitespace-pre-line">
                        <HighlightCosmicText
                          text={ch.supportingEvidence}
                          onSelectConcept={handleOpenConcept}
                        />
                      </div>
                    </div>

                    {/* Limitations & Anomalies */}
                    <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-950/20 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                        <AlertTriangle className="size-3.5 text-amber-400" />
                        <span>What Evidence Challenged or Refined It?</span>
                      </div>
                      <div className="mt-2 text-xs leading-relaxed text-slate-300">
                        <HighlightCosmicText
                          text={ch.limitations}
                          onSelectConcept={handleOpenConcept}
                        />
                      </div>
                    </div>

                    {/* What Changed in the Next Major Model */}
                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                        <ChevronRight className="size-3.5 text-cyan-400" />
                        <span>What Changed Next?</span>
                      </div>
                      <div className="mt-2 text-xs leading-relaxed text-slate-300">
                        <HighlightCosmicText
                          text={ch.whatChangedNext}
                          onSelectConcept={handleOpenConcept}
                        />
                      </div>
                    </div>

                    {/* Scientific Accuracy Note */}
                    <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3 text-[11px] text-cyan-200/90 leading-relaxed">
                      <strong>Scientific Accuracy Note:</strong> {ch.accuracyNotes}
                    </div>

                    {/* Verified Scholarly Sources */}
                    <div className="mt-6 border-t border-white/10 pt-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Explore the Evidence & Citations:
                      </div>
                      <ul className="space-y-1.5 text-xs">
                        {ch.sources.map((src, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300">
                            <span className="text-cyan-400">·</span>
                            <div>
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-cyan-300 hover:text-cyan-200 underline inline-flex items-center gap-1"
                              >
                                <span>{src.title}</span>
                                <ExternalLink className="size-3 opacity-70" />
                              </a>
                              <span className="text-slate-400 text-[11px] ml-1.5">
                                ({src.authorOrOrg})
                              </span>
                              <p className="text-[11px] text-slate-400 leading-normal mt-0.5">
                                {src.description}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Student Inquiry & Exam Questions Accordion (Grade 10-11) */}
                    <ChapterFaqAccordion
                      faqs={faqs}
                      chapterTitle={ch.title}
                      chapterNumber={ch.id}
                      onSelectConcept={handleOpenConcept}
                    />
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        {/* Floating Maximize Button on standard view */}
        <button
          type="button"
          onClick={() => handleEnterMaximized()}
          className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-slate-950/90 px-4 py-2.5 text-xs font-bold text-cyan-300 shadow-2xl backdrop-blur-md hover:bg-cyan-500 hover:text-slate-950 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Maximize chapters images and text to full screen"
        >
          <Maximize2 className="size-4" />
          <span className="font-mono">Maximize Chapters</span>
        </button>

        {/* ============================================================== */}
        {/* 4. CONCLUDING REFLECTION & CALLS TO ACTION                     */}
        {/* ============================================================== */}
        <section className="relative overflow-hidden border-t border-white/10 bg-slate-950 py-24 px-6 text-center sm:px-12">
          {/* Background Atmospheric Glow */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <img
              src={cosmicWebImg}
              alt="Cosmic web visualization"
              className="size-full object-cover opacity-20 filter blur-[1px] brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030611] via-[#030611]/80 to-transparent" />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
              <Sparkles className="size-3.5" />
              <span>The Unbroken Human Quest</span>
            </div>

            <h2 className="mt-6 text-3xl font-black text-white sm:text-5xl tracking-tight text-balance">
              We Have Mapped an Observable Universe. We Have Not Answered Every Question.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Every model was a way of asking a better question. From prehistoric megaliths to
              space-based gravitational wave observatories, the next picture of the cosmos may begin
              with something humanity has not yet understood.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => handleEnterMaximized(1)}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/25 transition hover:bg-cyan-400 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Maximize2 className="size-4" />
                <span>Maximize Chapters Screen</span>
              </button>

              <Link
                to="/universe"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Orbit className="size-4 text-cyan-400" />
                <span>Explore Our Visible Universe 3D Engine</span>
              </Link>

              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 cursor-pointer"
              >
                <RotateCcw className="size-4 text-cyan-400" />
                <span>Revisit Top</span>
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 5. DEDICATED MAXIMIZED CHAPTERS FULLSCREEN VIEW                */}
        {/* "once user click on maximize button then the image and text    */}
        {/* should maximize and user can see the whole chapters by         */}
        {/* scroling down, make sure only chapters images and text should  */}
        {/* be visible in max screen."                                     */}
        {/* ============================================================== */}
        {isMaximized && (
          <div className="fixed inset-0 z-50 bg-[#02040b] text-slate-100 overflow-y-auto selection:bg-cyan-500/30 selection:text-cyan-200 animate-in fade-in duration-200">
            {/* Minimalist Floating Top HUD */}
            <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 px-4 py-3 backdrop-blur-2xl shadow-2xl shadow-black/80">
              <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs font-mono">
                    MAX
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-sm font-bold text-white truncate flex items-center gap-2">
                      <span>Maximized Chapters Screen</span>
                      <span className="hidden sm:inline text-xs font-normal text-slate-400">
                        · Images & Text Stream
                      </span>
                    </h1>
                    <p className="text-[11px] font-mono text-cyan-400 truncate">
                      Active: Ch {activeChapter.id.toString().padStart(2, "0")} ·{" "}
                      {activeChapter.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Quick Chapter Selector */}
                  <select
                    value={activeChapterId}
                    onChange={(e) => scrollToMaxChapter(Number(e.target.value))}
                    aria-label="Jump to chapter"
                    className="rounded-lg border border-white/15 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono hidden xs:block cursor-pointer"
                  >
                    {HISTORY_CHAPTERS.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        Ch {ch.id}: {ch.title.slice(0, 24)}...
                      </option>
                    ))}
                  </select>

                  {/* Minimize Button */}
                  <button
                    type="button"
                    onClick={handleExitMaximized}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/50 bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:bg-cyan-400 transition cursor-pointer"
                    title="Minimize to standard layout (Esc)"
                  >
                    <Minimize2 className="size-3.5" />
                    <span>Minimize</span>
                    <span className="hidden sm:inline text-[10px] opacity-75 font-mono ml-0.5">
                      (Esc)
                    </span>
                  </button>
                </div>
              </div>
            </header>

            {/* Dedicated Chapters Stream: ONLY Images and Text */}
            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8 space-y-24">
              {HISTORY_CHAPTERS.map((ch) => {
                const conceptIds = getChapterConceptIds(ch.id);
                const faqs = getChapterFaqs(ch.id);

                return (
                  <article
                    key={ch.id}
                    id={`max-ch-${ch.id}`}
                    data-max-chapter-id={ch.id}
                    className="rounded-3xl border border-white/15 bg-slate-950/80 p-6 sm:p-10 backdrop-blur-md shadow-2xl space-y-6"
                  >
                    {/* Chapter Metadata Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-1 font-mono text-xs font-bold text-cyan-300">
                          CHAPTER {ch.id.toString().padStart(2, "0")}
                        </span>
                        <span className="text-white/30">·</span>
                        <span className="rounded-full bg-white/5 px-3 py-1 font-mono text-amber-300 text-xs">
                          {ch.yearDisplay}
                        </span>
                      </div>
                      <span className="text-slate-400 text-xs font-medium">{ch.era}</span>
                    </div>

                    {/* Titles */}
                    <div>
                      <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                        {ch.title}
                      </h2>
                      <p className="mt-2 text-base font-medium text-cyan-300">{ch.subtitle}</p>
                    </div>

                    {/* ======================================================= */}
                    {/* THE CHAPTER IMAGE / ANIMATED COSMIC VISUALIZER (MAX)    */}
                    {/* ======================================================= */}
                    <div className="overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950 shadow-2xl">
                      <CosmicHistoryVisualizer
                        chapter={ch}
                        onMaximize={handleExitMaximized}
                        isMaximized={true}
                      />
                    </div>

                    {/* Civilizations & Key Observers */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <div>
                        <span className="font-semibold text-slate-300">Civilizations: </span>
                        <span>{ch.civilizations.join(", ")}</span>
                      </div>
                      <span className="text-white/20">·</span>
                      <div>
                        <span className="font-semibold text-slate-300">Key Observers: </span>
                        <span>{ch.keyFigures.join(", ")}</span>
                      </div>
                    </div>

                    {/* Grade 10-11 Concept Spotlight Badges (NASA & Wikipedia) */}
                    {conceptIds.length > 0 && (
                      <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-r from-cyan-950/30 via-slate-900/40 to-indigo-950/30 p-4">
                        <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-cyan-300 font-semibold mb-2.5">
                          <GraduationCap className="h-4 w-4 text-amber-400" />
                          <span>Grade 10–11 Concept Spotlight (NASA & Wikipedia):</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {conceptIds.map((cid) => (
                            <CosmicConceptPill
                              key={cid}
                              conceptId={cid}
                              onSelect={handleOpenConcept}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Summary Lead with concept highlighting */}
                    <div className="text-base leading-relaxed text-slate-200">
                      <HighlightCosmicText text={ch.summary} onSelectConcept={handleOpenConcept} />
                    </div>

                    {/* Historical Context */}
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                        <Clock className="size-4 text-cyan-400" />
                        <span>Historical & Cultural Context</span>
                      </div>
                      <div className="mt-2 text-sm leading-relaxed text-slate-300">
                        <HighlightCosmicText
                          text={ch.historicalContext}
                          onSelectConcept={handleOpenConcept}
                        />
                      </div>
                    </div>

                    {/* The Model Itself */}
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                        <Layers className="size-4 text-cyan-400" />
                        <span>The Proposed Model</span>
                      </div>
                      <div className="mt-2 text-sm leading-relaxed text-slate-300 whitespace-pre-line">
                        <HighlightCosmicText
                          text={ch.theModel}
                          onSelectConcept={handleOpenConcept}
                        />
                      </div>
                    </div>

                    {/* Observations & Supporting Evidence */}
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                        <CheckCircle2 className="size-4 text-emerald-400" />
                        <span>What Observations Supported It?</span>
                      </div>
                      <div className="mt-2 text-sm leading-relaxed text-slate-300 whitespace-pre-line">
                        <HighlightCosmicText
                          text={ch.supportingEvidence}
                          onSelectConcept={handleOpenConcept}
                        />
                      </div>
                    </div>

                    {/* Limitations & Anomalies */}
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                        <AlertTriangle className="size-4 text-amber-400" />
                        <span>What Evidence Challenged or Refined It?</span>
                      </div>
                      <div className="mt-2 text-sm leading-relaxed text-slate-300">
                        <HighlightCosmicText
                          text={ch.limitations}
                          onSelectConcept={handleOpenConcept}
                        />
                      </div>
                    </div>

                    {/* What Changed in the Next Major Model */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                        <ChevronRight className="size-4 text-cyan-400" />
                        <span>What Changed Next?</span>
                      </div>
                      <div className="mt-2 text-sm leading-relaxed text-slate-300">
                        <HighlightCosmicText
                          text={ch.whatChangedNext}
                          onSelectConcept={handleOpenConcept}
                        />
                      </div>
                    </div>

                    {/* Scientific Accuracy Note */}
                    <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 text-xs text-cyan-200/90 leading-relaxed">
                      <strong>Scientific Accuracy Note:</strong> {ch.accuracyNotes}
                    </div>

                    {/* Verified Scholarly Sources */}
                    <div className="border-t border-white/10 pt-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Explore the Evidence & Citations:
                      </div>
                      <ul className="space-y-2 text-xs">
                        {ch.sources.map((src, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300">
                            <span className="text-cyan-400">·</span>
                            <div>
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-cyan-300 hover:text-cyan-200 underline inline-flex items-center gap-1"
                              >
                                <span>{src.title}</span>
                                <ExternalLink className="size-3 opacity-70" />
                              </a>
                              <span className="text-slate-400 text-xs ml-1.5">
                                ({src.authorOrOrg})
                              </span>
                              <p className="text-xs text-slate-400 leading-normal mt-0.5">
                                {src.description}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Student Inquiry & Exam Questions Accordion (Grade 10-11) */}
                    <ChapterFaqAccordion
                      faqs={faqs}
                      chapterTitle={ch.title}
                      chapterNumber={ch.id}
                      onSelectConcept={handleOpenConcept}
                    />
                  </article>
                );
              })}

              {/* Bottom Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-8 pb-16">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("max-ch-1");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <ArrowUp className="size-4 text-cyan-400" />
                  <span>Back to Chapter 01</span>
                </button>

                <button
                  type="button"
                  onClick={handleExitMaximized}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-xs font-bold text-slate-950 shadow-xl shadow-cyan-500/25 hover:bg-cyan-400 transition cursor-pointer"
                >
                  <Minimize2 className="size-4" />
                  <span>Minimize / Return to Timeline</span>
                </button>
              </div>
            </main>

            {/* Floating Minimize Button in bottom right */}
            <button
              type="button"
              onClick={handleExitMaximized}
              className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-slate-900/95 px-5 py-3 text-xs font-bold text-white shadow-2xl backdrop-blur-xl hover:bg-cyan-500 hover:text-slate-950 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Minimize to standard layout (Esc)"
            >
              <Minimize2 className="size-4 text-cyan-400" />
              <span>Minimize Screen</span>
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* 6. COSMIC CONCEPT POPUP MODAL SHEET                           */}
        {/* ============================================================== */}
        <CosmicConceptSheet
          concept={selectedConcept}
          isOpen={isConceptSheetOpen}
          onClose={() => setIsConceptSheetOpen(false)}
        />
      </div>
    </PublicLayout>
  );
}
