import { useEffect, useRef, useState } from "react";
import type { StoreProduct } from "@/lib/store-products";
export function ProductMedia({ product }: { product: StoreProduct }) {
  const image = useRef<HTMLImageElement>(null);
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<"pending" | "loaded" | "failed">("pending");
  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer"
      className="ovu-product-image"
      data-image-state={state}
    >
      <span className="ovu-product-story" aria-hidden={state === "loaded"}>
        <span>{product.category}</span>
        <span>{product.description.replace(/[➤►▶★☆]/g, "").trim()}</span>
        <span>Discover this object</span>
      </span>
      {mounted && state !== "failed" && (
        <img
          ref={image}
          src={product.image}
          alt={product.name}
          width="900"
          height="1000"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setState("loaded")}
          onError={() => setState("failed")}
        />
      )}
    </a>
  );
}
