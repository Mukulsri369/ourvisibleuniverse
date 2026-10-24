import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import family from "@/assets/images/parent_kid_stargazing_1791934612266.jpg";
export function AcademyScene() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    let disposed = false;
    let clean: (() => void) | undefined;
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (disposed || !root.current) return;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        media.add("(min-width: 1000px) and (prefers-reduced-motion: no-preference)", () => {
          const section = root.current!;
          section.classList.add("is-live");
          section.classList.remove("is-rest");
          section.style.setProperty("--hold", "1");
          const ctx = gsap.context(() => {
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.6,
                invalidateOnRefresh: true,
                onUpdate: (self) => section.style.setProperty("--p", String(self.progress)),
              },
            });
            tl.to(".ovu-academy-opening", { y: -55, opacity: 0, duration: 0.12, ease: "none" }, 0)
              .to(
                ".ovu-academy-window",
                { clipPath: "inset(0% 0% 0% 0%)", duration: 0.64, ease: "none" },
                0.12,
              )
              .fromTo(
                ".ovu-academy-window img",
                { xPercent: -24, scale: 1.1 },
                { xPercent: 0, scale: 1, duration: 0.64, ease: "none" },
                0.12,
              )
              .to(".ovu-academy-shade", { opacity: 0.58, duration: 0.4, ease: "none" }, 0.35)
              .fromTo(
                ".ovu-academy-arrival",
                { y: 45, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.3, ease: "none" },
                0.78,
              );
          }, section);
          return () => {
            ctx.revert();
            section.classList.remove("is-live");
            section.classList.add("is-rest");
            section.style.removeProperty("--hold");
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
      className="scene ovu-academy-scene is-rest"
      data-scene="sky-classroom"
      aria-labelledby="academy-title"
    >
      <div className="scene-stage ovu-academy-stage">
        <div className="ovu-academy-window">
          <img
            src={family}
            alt="A parent and child discovering the night sky together"
            width="1100"
            height="1400"
            loading="eager"
          />
        </div>
        <div className="ovu-academy-shade" />
        <div className="ovu-academy-opening">
          <h2 id="academy-title">
            Wonder is
            <br />
            just the start.
          </h2>
          <p>
            Turn the sky into something you understand. Follow 24 interactive modules across six
            stages, with age-adaptive lessons and an AI Observatory Tutor.
          </p>
          <div className="ovu-actions">
            <Link to="/learn" className="ovu-button">
              Explore the academy <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/verify-certificate" className="ovu-text-link">
              Verify a certificate
            </Link>
          </div>
        </div>
        <div className="ovu-academy-arrival">
          <h3>
            Your sky.
            <br />
            Your classroom.
          </h3>
          <p>Start with a question. Leave with a different view of everything.</p>
          <Link to="/learn" className="ovu-button">
            Start discovering <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
