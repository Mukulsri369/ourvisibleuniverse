import { forwardRef } from "react";
import type * as React from "react";
import type { Object3D, Camera } from "three";

export interface SafeHtmlProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  eps?: number;
  style?: React.CSSProperties;
  className?: string;
  prepend?: boolean;
  center?: boolean;
  fullscreen?: boolean;
  portal?: React.RefObject<HTMLElement | null>;
  distanceFactor?: number;
  sprite?: boolean;
  transform?: boolean;
  zIndexRange?: [number, number];
  calculatePosition?: (
    el: Object3D,
    camera: Camera,
    size: { width: number; height: number },
  ) => [number, number];
  as?: string;
  wrapperClass?: string;
  pointerEvents?: React.CSSProperties["pointerEvents"];
}

// Scene labels are intentionally disabled. Keep the adapter's typed API for
// educational overlays without mounting DOM roots or per-frame layout work.
// Names and descriptions remain available in the sitemap and information panels.
export const SafeHtml = forwardRef<HTMLDivElement, SafeHtmlProps>(() => null);
SafeHtml.displayName = "SafeHtml";
