# Mobile Sticky Cosmic Animation, Student Concept Spotlights (NASA & Wikipedia), and Chapter FAQs

Redesign the Visible Universe History page so high school students (grades 10–11) have an engaging, interactive learning experience on both mobile and desktop. On mobile devices, the dynamic cosmic visualizer stays pinned at the top of the viewport with collapsible controls as students scroll through chapters, while highlighted scientific terms (e.g., Redshift, Cosmic Microwave Background, Epicycles) open dedicated concept sheets with NASA and Wikipedia references, and each chapter features an expandable student FAQ accordion.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product and design choices were confirmed during Phase 1 clarification:
>
> - **Mobile Animation Visibility**: Sticky top viewport with collapsible controls while scrolling, ensuring students can observe the changing cosmic model at the top of their screen without losing their reading place.
> - **Concept Spotlights**: Highlighted interactive concept buttons embedded directly into the narrative that open a quick slide-up knowledge sheet with a student-friendly explanation, key formulas, and verified direct links to NASA and Wikipedia.
> - **Chapter Inquiry Format**: Standard expandable FAQ accordions at the conclusion of each chapter answering authentic questions 10th and 11th graders ask about astronomical models and physical evidence.

- **Confirmed Decision 1**: Sticky mobile simulation deck anchored beneath the navigation header (`sticky top-14 z-30 lg:top-28`) with an adaptive height (`h-44` to `h-52` on mobile) and a quick tap-to-collapse toggle to respect the mobile 15% sticky guideline when reading long text.
- **Confirmed Decision 2**: Centralized scientific knowledge repository (`src/lib/cosmic-concepts.ts`) mapping terms like _Redshift_, _Hubble's Law_, _Cosmic Microwave Background_, _Gravitational Lensing_, _Inflation_, and _Epicycles_ to student-level explanations and curated official NASA and Wikipedia destinations.
- **Confirmed Decision 3**: Engaging chapter FAQ data added to every history chapter in `src/lib/visible-universe-history-data.ts`, addressing common misconceptions (e.g., "Why does light stretch?", "How could Eratosthenes measure Earth with just sticks and shadows?", "What does space expand into?").

---

## 1. Overview & Core Concept

- **What It Does**: Upgrades the 26-epoch history of cosmic models into a classroom-ready, mobile-friendly interactive textbook. As students scroll down through chapters on smartphones, the visualizer remains pinned at the top, synchronizing its dynamic 3D/2D animation to whichever epoch is in view. Key scientific terms are highlighted as interactive beacons that open quick reference drawers linking directly to official NASA science missions and Wikipedia articles. Each chapter concludes with expandable FAQ inquiries designed for high school physics and astronomy curricula.
- **Target Audience & Persona**: 10th and 11th-grade students (ages 15–17), science teachers, and curious stargazers seeking rigorous yet accessible historical cosmology.
- **Key Value**: Bridges visual intuition and academic research. Students see how the geometric model looks in motion while having instant access to verified scientific literature without leaving their flow.

---

## 2. User Experience & Visual Design

### Mobile Layout Ergonomics & Thumb Zone

```
+-------------------------------------------------+  ^
| Top Site Header (Brand + Store CTA)             |  | 56px sticky top-0
+-------------------------------------------------+  v
| [STICKY MOBILE VIEWPORT]                        |  ^
|  • Compact 3D/Canvas Simulation (h-44 / h-50)   |  | Pinned sticky top-14
|  • Active Chapter Tag + Era Badge               |  | (15-20% height,
|  • [Collapse / Expand] Toggle Button            |  | tap to minimize)
+-------------------------------------------------+  v
| [CHRONOLOGICAL CHAPTER NARRATIVE]               |  ^
|  • Chapter 18: Hubble & Redshift Expansion      |  |
|  • Highlighted Concept: [⚡ Redshift (NASA/Wiki)]|  | Scrollable Stream
|  • Historical context & physical evidence       |  | (Touch-friendly 44px
|  • [?] Curious Minds: Student FAQs (Accordion)  |  | hitboxes, readable
|  • [Next Chapter →] Touch Navigation            |  | 16px body prose)
+-------------------------------------------------+  v
```

### Visual Identity & Theme Tokens

- **Dominant Canvas**: Obsidian slate (`#020617` / `#0B0F19`) providing high contrast for glowing planetary orbits, starfields, and spectral wave diagrams.
- **Concept Highlight Badges**: Laser-cyan and violet interactive underline buttons (`text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-500/20`) with external link mini-indicators, inviting exploration without cluttering prose.
- **Concept Sheet Modal**: Smooth slide-up bottom sheet on mobile (`rounded-t-3xl backdrop-blur-xl bg-slate-950/95 border-t border-cyan-500/30`) with drag/close handle, a clear 2-paragraph student explanation, "Key Takeaway for Exams", and dual external action buttons (NASA Official Mission Site + Wikipedia Academic Reference).
- **Chapter FAQ Accordions**: Clean card drawers (`bg-slate-900/50 border border-white/10 rounded-2xl p-4`) with smooth chevron expansion and clear, friendly Q&A explanations.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Sticky Top Viewport vs Fullscreen Video Switcher on Mobile**
  - _Chosen Approach_: A dedicated sticky container pinned at `top-14` on mobile with a compact canvas height (`h-48`) and a "Compact / Minimize" control pill.
  - _Why_: Allows students to read the explanatory text, evidence, and questions while continuously watching the astronomical model rotate or expand.
  - _Alternatives Considered_: Inline visualizer repeated in every chapter (wasteful WebGL contexts and memory leaks) or fixed floating picture-in-picture (blocks reading text).

- **Decision 2: Interactive Concept Sheets vs Raw External Links**
  - _Chosen Approach_: Clicking highlighted concepts opens a styled in-app modal sheet with an immediate 10th-11th grade explanation, accompanied by direct buttons to NASA and Wikipedia.
  - _Why_: Clicking directly out to an external website forces the student away from the app and breaks their focus. The sheet provides instant clarity and lets them choose whether to dive deeper into NASA or Wikipedia.
  - _Alternatives Considered_: Direct anchor links (causes navigation friction and lost scroll position).

- **Decision 3: Curated Educational FAQs per Chapter**
  - _Chosen Approach_: Integrate structured FAQ pairs (`question`, `answer`, `targetStandard`) into each chapter in `visible-universe-history-data.ts`.
  - _Why_: Aligns with high school science curricula (CBSE/ICSE 10th-11th, AP Physics/Astronomy, NGSS) and addresses the most common student misconceptions.

---

## 4. Technical Architecture & Data Strategy

### System & State Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                   VisibleUniverseHistory Route                         │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ State Management:                                                │  │
│  │  • activeChapterId: number (updated via IntersectionObserver)   │  │
│  │  • selectedConcept: CosmicConcept | null                         │  │
│  │  • isMobileVisualizerCollapsed: boolean                          │  │
│  │  • expandedFaqId: string | null                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                │                                       │
│          ┌─────────────────────┴─────────────────────┐                 │
│          ▼                                           ▼                 │
│  ┌──────────────────────────────┐       ┌───────────────────────────┐  │
│  │ Mobile Sticky Visualizer     │       │ Desktop 2-Column Grid     │  │
│  │  • sticky top-14 (h-48)      │       │  • Col 1: Sticky 3D Deck  │  │
│  │  • Chapter metadata bar      │       │  • Col 2: Chapter Stream  │  │
│  │  • Smooth canvas rendering   │       └───────────────────────────┘  │
│  └──────────────────────────────┘                                      │
│                                │                                       │
│          ┌─────────────────────┴─────────────────────┐                 │
│          ▼                                           ▼                 │
│  ┌──────────────────────────────┐       ┌───────────────────────────┐  │
│  │ Chapter Narrative Stream     │       │ CosmicConceptSheet Modal  │  │
│  │  • Highlighted Concept Words │──────▶│  • 10th-11th Explanation  │  │
│  │  • Evidence & Context        │       │  • NASA Science Link      │  │
│  │  • Expandable FAQ Accordion  │       │  • Wikipedia Deep Dive    │  │
│  └──────────────────────────────┘       └───────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### New Modules & Data Structures

1. **`src/lib/cosmic-concepts.ts`**:
   - Contains educational definitions, exam relevance, NASA URLs, and Wikipedia URLs for terms including:
     - `redshift`: Doppler vs cosmological expansion, Hubble's discovery, NASA Webb redshift measurements.
     - `cosmic-microwave-background`: Penzias & Wilson, COBE/WMAP/Planck, 2.725 K afterglow.
     - `dark-matter`: Vera Rubin, galactic rotation curves, gravitational lensing.
     - `dark-energy`: Type Ia supernovae, accelerating universe, Nobel Prize 2011.
     - `epicycles`: Ptolemaic deferent and epicycle mechanism, explaining retrograde motion.
     - `heliocentrism`: Aristarchus & Copernicus, retrograde motion naturally solved.
     - `spacetime-curvature`: Einstein's General Relativity, 1919 solar eclipse test.
     - `gravitational-lensing`: Light deflection around massive clusters, Einstein rings.
     - `eratosthenes-earth-radius`: Shadow angles at Alexandria & Syene, geometry of a sphere.
     - `kepler-laws`: Elliptical orbits, equal areas in equal times, harmonic orbital periods.

2. **`src/components/history/CosmicConceptSheet.tsx`**:
   - Slide-up bottom sheet (mobile) and centered dialog (desktop).
   - Shows concept name, simple high-school level breakdown, "Why It Matters in 11th Grade Physics", official NASA button with badge icon, and Wikipedia button.

3. **`src/components/history/ChapterFaqAccordion.tsx`**:
   - Clean, accessible accordion component with smooth chevron toggle and high-contrast answers.

---

## 5. Implementation Steps & Verification Plan

1. **Step 1: Create `src/lib/cosmic-concepts.ts`**
   - Populate high school curriculum concepts with verified NASA and Wikipedia URLs.
2. **Step 2: Enrich `visible-universe-history-data.ts`**
   - Add high-school curiosity questions and concept tags to all chapters.
3. **Step 3: Create `CosmicConceptSheet.tsx` & `ChapterFaqAccordion.tsx`**
   - Implement the slide-up modal sheet and clean FAQ accordion.
4. **Step 4: Update `visible-universe-history.tsx`**
   - Build the mobile sticky top visualizer with collapsible controls (`sticky top-14 z-30`).
   - Wire concept highlight click handlers to open `CosmicConceptSheet`.
   - Embed `ChapterFaqAccordion` at the bottom of each chapter.
5. **Step 5: Verification & Quality Assurance**
   - Run `lint_applet` and `compile_applet`.
   - Verify mobile viewport layout, touch targets ($\ge 44\text{px}$), and smooth sticky transitions.
