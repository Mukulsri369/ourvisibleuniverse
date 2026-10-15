import React, { useState } from "react";
import { ChevronDown, HelpCircle, GraduationCap, Sparkles, BookOpen } from "lucide-react";
import { ChapterFaq } from "@/lib/chapter-faqs";
import { COSMIC_CONCEPTS, CosmicConcept } from "@/lib/cosmic-concepts";

interface ChapterFaqAccordionProps {
  faqs: ChapterFaq[];
  chapterTitle: string;
  chapterNumber: number;
  onSelectConcept: (concept: CosmicConcept) => void;
}

export function ChapterFaqAccordion({
  faqs,
  chapterTitle,
  chapterNumber,
  onSelectConcept,
}: ChapterFaqAccordionProps) {
  const [openIndices, setOpenIndices] = useState<number[]>([]);

  if (!faqs || faqs.length === 0) return null;

  const toggleIndex = (idx: number) => {
    setOpenIndices((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));
  };

  return (
    <div className="mt-8 rounded-2xl border border-indigo-500/20 bg-slate-950/60 p-4 sm:p-6 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <HelpCircle className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              Student Inquiry & Exam FAQ
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
                Grade 10–11
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Key conceptual questions for Chapter {chapterNumber}: {chapterTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Accordion Items */}
      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndices.includes(idx);
          const relatedConcept = faq.relatedConceptId
            ? COSMIC_CONCEPTS[faq.relatedConceptId]
            : null;

          return (
            <div
              key={idx}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "border-indigo-500/40 bg-indigo-950/20 shadow-md shadow-indigo-950/30"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleIndex(idx)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left transition"
                aria-expanded={isOpen}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-[10px] font-bold text-slate-300 mt-0.5">
                    Q{idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-100 leading-snug">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-indigo-400" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-white/5 px-4 pb-4 pt-3 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 animate-in fade-in-50 duration-200">
                  <p className="whitespace-pre-line">{faq.answer}</p>

                  {faq.curriculumHint && (
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300/90 pt-1">
                      <GraduationCap className="h-3 w-3 shrink-0" />
                      <span>{faq.curriculumHint}</span>
                    </div>
                  )}

                  {relatedConcept && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => onSelectConcept(relatedConcept)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-1.5 text-[11px] font-medium text-cyan-300 hover:bg-cyan-900/50 hover:text-white transition cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3 text-amber-400" />
                        <span>Explore Topic: {relatedConcept.title}</span>
                        <span className="font-mono text-[10px] text-cyan-400/80 flex items-center gap-0.5 ml-1">
                          <BookOpen className="h-2.5 w-2.5" />
                          NASA & Wiki
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
