import { useEffect } from "react";
import "lenis/dist/lenis.css";
export function SmoothScroll() {
  useEffect(() => {
    let disposed = false;
    let clean: (() => void) | undefined;
    void Promise.all([import("lenis"), import("gsap"), import("gsap/ScrollTrigger")])
      .then(([{ default: Lenis }, { gsap }, { ScrollTrigger }]) => {
        if (disposed) return;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        media.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
          const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, anchors: true, autoRaf: false });
          const tick = (time: number) => lenis.raf(time * 1000);
          lenis.on("scroll", ScrollTrigger.update);
          gsap.ticker.add(tick);
          document.documentElement.dataset.ovuSmooth = "true";
          return () => {
            gsap.ticker.remove(tick);
            lenis.destroy();
            delete document.documentElement.dataset.ovuSmooth;
          };
        });
        clean = () => media.revert();
      })
      .catch(() => {});
    return () => {
      disposed = true;
      clean?.();
    };
  }, []);
  return null;
}
