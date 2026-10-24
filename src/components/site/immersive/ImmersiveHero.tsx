import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
const ObservatoryLens = lazy(() => import("./ObservatoryLens"));
export type LensState = {
  x: number;
  y: number;
  scroll: number;
  pressed: number;
  active: boolean;
  wake?: () => void;
};
class LensBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export function ImmersiveHero() {
  const root = useRef<HTMLElement>(null);
  const interaction = useRef<LensState>({ x: 0, y: 0, scroll: 0, pressed: 0, active: true });
  const [enhanced, setEnhanced] = useState(false);
  const [ready, setReady] = useState(false);
  const [bending, setBending] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => setReady(false), []);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      setEnhanced(!mq.matches);
      if (mq.matches) setReady(false);
    };
    syncMotion();
    mq.addEventListener("change", syncMotion);
    const observer = new IntersectionObserver(
      ([entry]) => {
        interaction.current.active = entry.isIntersecting && !document.hidden;
        interaction.current.wake?.();
      },
      { threshold: 0 },
    );
    observer.observe(element);
    const visibility = () => {
      interaction.current.active = !document.hidden && element.getBoundingClientRect().bottom > 0;
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      mq.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    let disposed = false;
    let clean: (() => void) | undefined;
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (disposed || !root.current) return;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        media.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
          const section = root.current!;
          section.classList.add("is-live");
          section.classList.remove("is-rest");
          section.style.setProperty("--hold", "1.35");
          const context = gsap.context(() => {
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.65,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                  interaction.current.scroll = self.progress;
                  interaction.current.wake?.();
                  section.style.setProperty("--p", String(self.progress));
                },
              },
            });
            tl.to(".ovu-exp-opening", { y: -90, opacity: 0, duration: 0.34, ease: "none" }, 0)
              .to(".ovu-exp-art", { xPercent: -12, scale: 1.65, duration: 1, ease: "none" }, 0)
              .fromTo(
                ".ovu-exp-arrival",
                { y: 48, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.28, ease: "none" },
                0.48,
              )
              .to(".ovu-exp-hero-bottom", { opacity: 0, duration: 0.18 }, 0);
          }, section);
          return () => {
            context.revert();
            section.classList.remove("is-live");
            section.classList.add("is-rest");
            section.style.removeProperty("--hold");
            interaction.current.scroll = 0;
          };
        });
        clean = () => media.revert();
        void document.fonts.ready.then(() => {
          if (!disposed) ScrollTrigger.refresh();
        });
      })
      .catch(() => {});
    return () => {
      disposed = true;
      clean?.();
    };
  }, []);
  return (
    <section
      ref={root}
      className="scene ovu-exp-hero is-rest"
      data-scene="gravity-approach"
      aria-labelledby="universe-title"
    >
      <div className="scene-stage ovu-exp-stage">
        <div className={`ovu-exp-art ${ready ? "is-ready" : ""}`}>
          <img
            className="ovu-exp-poster"
            src="/assets/aistudio/kerr1_poster.jpg"
            alt="A black hole surrounded by a luminous accretion disk"
            width="1920"
            height="1080"
            fetchPriority="high"
          />
          {enhanced && (
            <LensBoundary onFailure={onFailure}>
              <Suspense fallback={null}>
                <ObservatoryLens interaction={interaction} onReady={onReady} />
              </Suspense>
            </LensBoundary>
          )}
        </div>
        <div className="ovu-exp-scrim" />
        <div className="ovu-exp-opening ovu-frame">
          <h1 id="universe-title">
            <span className="ovu-title-line">
              <span>A universe</span>
            </span>
            <span className="ovu-title-line">
              <span>within reach.</span>
            </span>
          </h1>
          <p>From our solar system to distant galaxies. Let curiosity lead the way.</p>
          <Link to="/universe" className="ovu-button">
            Enter the universe <ArrowUpRight size={19} aria-hidden="true" />
          </Link>
        </div>
        <div className="ovu-exp-arrival ovu-frame">
          <h2>Follow the light.</h2>
          <p>
            From our solar system to the edge of a black hole. Choose where curiosity takes you.
          </p>
          <a href="#observatory" className="ovu-button">
            Choose a destination <ArrowUpRight size={19} aria-hidden="true" />
          </a>
        </div>
        <div
          className="ovu-exp-lens-zone"
          data-cursor="Hold to bend"
          aria-hidden="true"
          onPointerMove={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            interaction.current.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
            interaction.current.y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
            interaction.current.wake?.();
          }}
          onPointerDown={(event) => {
            if (event.pointerType === "mouse") {
              event.currentTarget.setPointerCapture(event.pointerId);
              interaction.current.pressed = 1;
              interaction.current.wake?.();
            }
          }}
          onPointerUp={() => {
            interaction.current.pressed = bending ? 1 : 0;
            interaction.current.wake?.();
          }}
          onPointerCancel={() => {
            interaction.current.pressed = bending ? 1 : 0;
            interaction.current.wake?.();
          }}
          onPointerLeave={() => {
            interaction.current.x = 0;
            interaction.current.y = 0;
            interaction.current.pressed = bending ? 1 : 0;
            interaction.current.wake?.();
          }}
        />
        <div className="ovu-exp-hero-bottom ovu-frame">
          <p>
            Our Visible Universe
            <br />
            Your personal observatory.
          </p>
          <button
            className="ovu-lens-control"
            aria-pressed={bending}
            onClick={() => {
              const next = !bending;
              setBending(next);
              interaction.current.pressed = next ? 1 : 0;
              interaction.current.wake?.();
            }}
          >
            {bending ? "Release the lens" : "Bend the light"}
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </section>
  );
}
