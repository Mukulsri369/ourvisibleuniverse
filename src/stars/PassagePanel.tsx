import { useState } from "react";
export function usePassagePanel(key: string) {
  const [hiddenKey, setHiddenKey] = useState<string | null>(null);
  return {
    collapsed: hiddenKey === key,
    hide: () => setHiddenKey(key),
    show: () => setHiddenKey(null),
  };
}
export function PassagePanelToggle({
  kind,
  collapsed,
  onClick,
}: {
  kind: "Galaxy" | "Nebula" | "Black hole";
  collapsed: boolean;
  onClick: () => void;
}) {
  const bottom = kind === "Galaxy" ? "bottom-6" : kind === "Nebula" ? "bottom-20" : "bottom-36";
  return (
    <button
      type="button"
      aria-label={(collapsed ? "Show " : "Hide ") + kind.toLowerCase() + " passage panel"}
      title={(collapsed ? "Show " : "Hide ") + kind.toLowerCase() + " passage panel"}
      aria-expanded={!collapsed}
      onClick={onClick}
      className={
        collapsed
          ? "pointer-events-auto fixed right-4 z-50 min-h-11 rounded-lg border border-white/20 bg-neutral-950/95 px-4 text-xs text-white " +
            bottom
          : "absolute right-2 top-2 grid size-11 place-items-center rounded-lg text-white/70 hover:bg-white/10 focus-visible:outline focus-visible:outline-white"
      }
    >
      {collapsed ? kind + " controls" : "−"}
    </button>
  );
}
