import { useEffect, useRef, useCallback } from "react";

export interface ScrollBeatHandle {
  /**
   * Called inside the rAF/scroll loop with current smoothed progress [0..1]
   * and raw target progress [0..1]. Mutate DOM styles directly here for 0 React re-renders.
   */
  onUpdate: (smoothedProgress: number, rawProgress: number) => void;
}

interface ScrollScrubVideoCanvasProps {
  videoSrc: string;
  mobileVideoSrc?: string;
  posterSrc?: string;
  scrollHeightVh?: number;
  linger?: number;
  chapterCode?: string;
  chapterTitle?: string;
  showScrollHint?: boolean;
  onMountController?: (controller: {
    registerListener: (fn: (smoothedProgress: number, rawProgress: number) => void) => () => void;
    scrubToProgress: (targetProgress: number) => void;
  }) => void;
  children?: (api: {
    registerListener: (fn: (smoothedProgress: number, rawProgress: number) => void) => () => void;
    scrubToProgress: (targetProgress: number) => void;
  }) => React.ReactNode;
}

// Module-level Blob URL cache so videos are fetched once and stay 100% seekable in RAM
const blobUrlCache = new Map<string, string>();
const blobPromiseCache = new Map<string, Promise<string>>();

function fetchVideoBlobUrl(url: string): Promise<string> {
  const existing = blobUrlCache.get(url);
  if (existing) return Promise.resolve(existing);

  const pending = blobPromiseCache.get(url);
  if (pending) return pending;

  const promise = fetch(url)
    .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(`HTTP ${r.status}`))))
    .then((blob) => {
      const objUrl = URL.createObjectURL(blob);
      blobUrlCache.set(url, objUrl);
      return objUrl;
    });

  blobPromiseCache.set(url, promise);
  return promise;
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (x: number) => {
  const c = clamp(x, 0, 1);
  return c * c * (3 - 2 * c);
};

/**
 * scroll-world lingerEase: monotone remap of scroll -> time so the camera settles
 * gracefully mid-scene while copy peaks and moves briskly near the seams.
 */
const lingerEase = (x: number, L: number) => {
  const l = clamp(L, 0, 1);
  const c = x - 0.5;
  return (1 - l) * x + l * (4 * c * c * c + 0.5);
};

export function ScrollScrubVideoCanvas({
  videoSrc,
  mobileVideoSrc,
  posterSrc,
  scrollHeightVh = 320,
  linger = 0.22,
  chapterCode,
  chapterTitle,
  showScrollHint = false,
  children,
}: ScrollScrubVideoCanvasProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const stillImgRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressBarFillRef = useRef<HTMLDivElement | null>(null);
  const progressTextRef = useRef<HTMLSpanElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);

  const listenersRef = useRef<Set<(smoothedProgress: number, rawProgress: number) => void>>(
    new Set(),
  );

  const registerListener = useCallback(
    (fn: (smoothedProgress: number, rawProgress: number) => void) => {
      listenersRef.current.add(fn);
      return () => {
        listenersRef.current.delete(fn);
      };
    },
    [],
  );

  const scrubToProgress = useCallback((target: number) => {
    const clamped = clamp(target, 0, 1);
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const pageTop = window.scrollY + rect.top;
    const scrollableDistance = Math.max(section.offsetHeight - window.innerHeight, 1);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: pageTop + clamped * scrollableDistance,
      behavior: reduce ? "auto" : "smooth",
    });
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const scene = sceneRef.current;
    const stillImg = stillImgRef.current;
    if (!section || !scene) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const smallMQ = window.matchMedia("(max-width: 860px)");
    const isMobile = () => coarse || smallMQ.matches;

    let vh = window.innerHeight;
    let laidOutW = window.innerWidth;
    let segStart = 0;
    let segEnd = 1;
    let ticking = false;
    let isDisposed = false;

    const state = {
      loading: false,
      ready: false,
      hasClip: false,
      cur: 0,
      target: 0,
      rawLocal: 0,
      visible: true,
      video: null as HTMLVideoElement | null,
    };

    // iOS priming on first touch/pointer gesture (from scroll-world scrub-engine.js)
    let userReady = false;
    const primeVideo = (v: HTMLVideoElement | null) => {
      if (!isMobile() || !v) return;
      try {
        const p = v.play();
        if (p && typeof p.then === "function") {
          p.then(() => {
            try {
              v.pause();
            } catch {
              // ignore
            }
          }).catch(() => {});
        }
      } catch {
        // ignore
      }
    };

    const onFirstGesture = () => {
      if (userReady) return;
      userReady = true;
      primeVideo(state.video);
    };

    window.addEventListener("pointerdown", onFirstGesture, { once: true, passive: true });
    window.addEventListener("touchstart", onFirstGesture, { once: true, passive: true });

    const loadClip = () => {
      if (reduce || state.loading || !videoSrc) return;
      state.loading = true;

      const chosenUrl = isMobile() && mobileVideoSrc ? mobileVideoSrc : videoSrc;

      fetchVideoBlobUrl(chosenUrl)
        .then((blobUrl) => {
          if (isDisposed) return;
          const v = document.createElement("video");
          v.className =
            "pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_45%] z-[2]";
          v.muted = true;
          v.playsInline = true;
          v.preload = "auto";
          v.setAttribute("muted", "");
          v.setAttribute("playsinline", "");
          v.src = blobUrl;

          v.addEventListener("loadedmetadata", () => {
            if (isDisposed) return;
            state.ready = true;
            // Perform initial seek immediately so frame 0 is decoded
            try {
              const dur = v.duration || 10;
              v.currentTime = clamp(state.cur, 0.001, 0.999) * dur;
            } catch {
              // ignore
            }
            read();
          });

          // Reveal the video (hide the still poster) only once a real frame has painted
          v.addEventListener(
            "seeked",
            () => {
              if (isDisposed) return;
              if (stillImg) {
                stillImg.style.opacity = "0";
              }
            },
            { once: true },
          );

          v.addEventListener("loadeddata", () => {
            if (isDisposed) return;
            try {
              v.pause();
            } catch {
              // ignore
            }
            if (userReady) primeVideo(v);
            if (stillImg) {
              stillImg.style.opacity = "0";
            }
          });

          scene.insertBefore(v, scene.firstChild?.nextSibling || null);
          state.video = v;
          videoRef.current = v;
          state.hasClip = true;
        })
        .catch(() => {
          if (isDisposed) return;
          // Fallback to direct video URL if blob fetch fails
          const v = document.createElement("video");
          v.className =
            "pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_45%] z-[2]";
          v.muted = true;
          v.playsInline = true;
          v.preload = "auto";
          v.src = chosenUrl;
          v.addEventListener("loadedmetadata", () => {
            state.ready = true;
            read();
          });
          v.addEventListener(
            "seeked",
            () => {
              if (stillImg) stillImg.style.opacity = "0";
            },
            { once: true },
          );
          scene.insertBefore(v, scene.firstChild?.nextSibling || null);
          state.video = v;
          videoRef.current = v;
          state.hasClip = true;
        });
    };

    const layout = () => {
      vh = window.innerHeight;
      laidOutW = window.innerWidth;
      const rect = section.getBoundingClientRect();
      segStart = (window.scrollY || window.pageYOffset) + rect.top;
      segEnd = segStart + Math.max(section.offsetHeight - vh, 1);
      read();
    };

    const notifyListeners = (smoothedP: number, rawP: number) => {
      if (progressBarFillRef.current) {
        progressBarFillRef.current.style.transform = `scaleX(${clamp(smoothedP, 0, 1)})`;
      }
      if (progressTextRef.current) {
        progressTextRef.current.textContent = `${String(Math.round(smoothedP * 100)).padStart(2, "0")}%`;
      }
      if (hintRef.current) {
        const y = window.scrollY || window.pageYOffset;
        hintRef.current.style.opacity = String(clamp(1 - y / (0.45 * vh), 0, 1));
      }
      listenersRef.current.forEach((fn) => fn(smoothedP, rawP));
    };

    const read = () => {
      const y = window.scrollY || window.pageYOffset;
      const rect = section.getBoundingClientRect();
      segStart = y + rect.top;
      segEnd = segStart + Math.max(section.offsetHeight - vh, 1);

      // Lazy-load clip when within 1.8 viewport heights
      if (y > segStart - 1.8 * vh && y < segEnd + 1.8 * vh) {
        loadClip();
      }

      const local = clamp((y - segStart) / Math.max(segEnd - segStart, 1), 0, 1);
      state.rawLocal = local;
      state.target = linger > 0 ? lingerEase(local, linger) : local;

      // Seam / edge visibility check
      const fade = 0.14 * vh;
      let outside = 0;
      if (y < segStart - vh) outside = segStart - vh - y;
      else if (y > segEnd + vh) outside = y - (segEnd + vh);
      const op = smooth(1 - outside / Math.max(fade, 1));
      state.visible = op > 0.001;

      if ((!state.hasClip || !state.ready) && stillImg) {
        const sc = reduce ? 1 : 1.02 + local * 0.08;
        stillImg.style.transform = `scale(${sc.toFixed(3)})`;
      }

      ticking = false;
    };

    let rafId = 0;
    const raf = () => {
      if (isDisposed) return;

      const eps = isMobile() ? 0.018 : 0.004; // Fine seek resolution on desktop with -g 4 keyframes
      const v = state.video;

      // Smoothly advance cur toward target on every animation frame (scrub-engine.js 0.18 lerp)
      const diff = state.target - state.cur;
      if (Math.abs(diff) > 0.00005) {
        state.cur += diff * (reduce ? 1 : 0.18);
      } else {
        state.cur = state.target;
      }

      // Notify foreground choreography & progress bar at 60-120fps without React re-renders
      notifyListeners(state.cur, state.rawLocal);

      if (state.hasClip && state.ready && v) {
        // Seek-coalescing from scroll-world scrub-engine.js:
        // Never queue a seek while the hardware decoder is still resolving the last one!
        if (!v.seeking && (state.visible || Math.abs(state.cur - state.target) >= 0.002)) {
          const dur = v.duration || 10;
          const t = clamp(state.cur, 0.001, 0.999) * dur;
          if (Math.abs(v.currentTime - t) > eps) {
            try {
              v.currentTime = t;
            } catch {
              // ignore
            }
          }
        }
      }

      rafId = requestAnimationFrame(raf);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(read);
      }
    };

    // Ignore height-only mobile URL bar resizes so scroll never jumps (from scrub-engine.js)
    const onResize = () => {
      if (coarse && window.innerWidth === laidOutW) return;
      layout();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", layout);

    layout();
    state.cur = state.target;
    notifyListeners(state.cur, state.rawLocal);
    rafId = requestAnimationFrame(raf);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", layout);
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
      if (state.video && scene.contains(state.video)) {
        try {
          state.video.pause();
          state.video.removeAttribute("src");
          state.video.load();
        } catch {
          // ignore
        }
        scene.removeChild(state.video);
      }
    };
  }, [videoSrc, mobileVideoSrc, linger]);

  return (
    <section
      ref={sectionRef}
      style={{ height: `${scrollHeightVh}vh` }}
      className="relative w-full select-none bg-[#05060a]"
    >
      <div
        ref={sceneRef}
        className="sticky top-0 h-screen w-full overflow-hidden bg-[#05060a]"
      >
        {/* First-Frame Still Poster (stays visible until the video paints its first seeked frame) */}
        {posterSrc && (
          <img
            ref={stillImgRef}
            src={posterSrc}
            alt=""
            decoding="async"
            className="pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover object-[center_45%] transition-opacity duration-300 will-change-transform"
          />
        )}

        {/* scroll-world Left Scrim + Top/Bottom Horizon Blend so copy is always crisp */}
        <div
          className="pointer-events-none absolute inset-0 z-[3]"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,6,10,0.86) 0%, rgba(5,6,10,0.58) 34%, rgba(5,6,10,0.18) 62%, transparent 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 z-[3]"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,6,10,0.55) 0%, transparent 15%, transparent 84%, rgba(5,6,10,0.92) 100%)",
          }}
        />

        {/* Foreground Scroll-Choreographed Content Layer */}
        <div className="relative z-20 h-full w-full">
          {children?.({
            registerListener,
            scrubToProgress,
          })}
        </div>

        {/* scroll-world Animated Scroll Wheel Hint */}
        {showScrollHint && (
          <div
            ref={hintRef}
            className="pointer-events-none absolute bottom-10 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2.5 transition-opacity duration-300"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/55">
              Scroll
            </span>
            <i className="relative block h-[34px] w-[22px] rounded-[12px] border-2 border-white/25">
              <span className="absolute left-1/2 top-[7px] h-[7px] w-[4px] -translate-x-1/2 rounded-[2px] bg-[#f5d08a] animate-bounce" />
            </i>
          </div>
        )}

        {/* Minimalist Bottom Progress Hairline (GPU scaleX — Zero Layout Thrash) */}
        <div className="absolute inset-x-0 bottom-0 z-30">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 pb-3.5 lg:px-10">
            {chapterCode && (
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">
                {chapterCode}
              </span>
            )}
            {chapterTitle && (
              <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">
                {chapterTitle}
              </span>
            )}
            <span
              ref={progressTextRef}
              className="font-mono text-[10px] tracking-[0.22em] text-[#f5d08a]/85 tabular-nums"
            >
              00%
            </span>
          </div>

          <div className="relative h-[2px] w-full overflow-hidden bg-white/[0.08]">
            <div
              ref={progressBarFillRef}
              className="pointer-events-none h-full w-full origin-left bg-gradient-to-r from-[#38bdf8] via-[#e5a93c] to-[#f5d08a] will-change-transform"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
