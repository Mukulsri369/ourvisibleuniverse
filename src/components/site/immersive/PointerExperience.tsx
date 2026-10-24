import { useEffect, useRef } from "react";
export function PointerExperience() {
  const cursor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const pointer = cursor.current;
    const page = document.querySelector<HTMLElement>(".ovu-landing");
    const preference = matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!pointer || !page) return;
    let bounds: DOMRect | null = null;
    let magnetic: HTMLElement | null = null;
    let frame = 0;
    let px = 0;
    let py = 0;
    const paint = () => {
      pointer.style.transform = `translate3d(${px}px,${py}px,0)`;
      frame = 0;
    };
    const move = (event: PointerEvent) => {
      if (!preference.matches) return;
      px = event.clientX;
      py = event.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
      const target = event.target as Element;
      const media = target.closest<HTMLElement>(
        "[data-cursor], .ovu-product-image, .ovu-atlas-pictures a",
      );
      pointer.dataset.visible = media ? "true" : "false";
      pointer.textContent = media?.dataset.cursor || "View object";
      const button = target.closest<HTMLElement>(".ovu-button, .ovu-lens-control");
      if (button !== magnetic) {
        if (magnetic) {
          magnetic.style.removeProperty("translate");
        }
        magnetic = button;
        bounds = button?.getBoundingClientRect() ?? null;
      }
      if (magnetic && bounds) {
        const x = Math.max(
          -7,
          Math.min(7, (event.clientX - bounds.left - bounds.width / 2) * 0.12),
        );
        const y = Math.max(
          -5,
          Math.min(5, (event.clientY - bounds.top - bounds.height / 2) * 0.12),
        );
        magnetic.style.translate = `${x}px ${y}px`;
      }
      const image = target.closest<HTMLElement>(".ovu-product-image");
      if (image) {
        const rect = image.getBoundingClientRect();
        image.style.setProperty(
          "--px",
          `${((event.clientX - rect.left) / rect.width - 0.5) * 8}px`,
        );
        image.style.setProperty(
          "--py",
          `${((event.clientY - rect.top) / rect.height - 0.5) * 8}px`,
        );
      }
    };
    const reset = () => {
      pointer.dataset.visible = "false";
      if (magnetic) magnetic.style.removeProperty("translate");
      magnetic = null;
      bounds = null;
    };
    const resetMedia = (event: PointerEvent) => {
      const target = (event.target as Element).closest<HTMLElement>(".ovu-product-image");
      if (target) {
        target.style.removeProperty("--px");
        target.style.removeProperty("--py");
      }
    };
    page.addEventListener("pointermove", move, { passive: true });
    page.addEventListener("pointerleave", reset);
    page.addEventListener("pointerout", resetMedia, { passive: true });
    window.addEventListener("blur", reset);
    preference.addEventListener("change", reset);
    return () => {
      page.removeEventListener("pointermove", move);
      page.removeEventListener("pointerleave", reset);
      page.removeEventListener("pointerout", resetMedia);
      window.removeEventListener("blur", reset);
      preference.removeEventListener("change", reset);
      cancelAnimationFrame(frame);
      reset();
    };
  }, []);
  return (
    <div ref={cursor} className="ovu-context-cursor" aria-hidden="true" data-visible="false" />
  );
}
