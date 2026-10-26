import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
export type ObjectView = {
  exposure: number;
  brightness: number;
  contrast: number;
  dust: number;
  stars: number;
  auto: boolean;
};
export const DEFAULT_OBJECT_VIEW: ObjectView = {
  exposure: 0,
  brightness: 1,
  contrast: 1,
  dust: 1,
  stars: 1,
  auto: true,
};
const bounds = {
  exposure: [-3, 3],
  brightness: [0.2, 2],
  contrast: [0.65, 1.5],
  dust: [0.15, 2],
  stars: [0.2, 3],
} as const;
type ViewState = {
  views: Record<string, ObjectView>;
  set: (id: string, patch: Partial<ObjectView>) => void;
  reset: (id: string) => void;
};
export const useObjectView = create<ViewState>()(
  persist(
    (set) => ({
      views: {},
      set: (id, patch) =>
        set((s) => {
          const next = { ...(s.views[id] ?? DEFAULT_OBJECT_VIEW), ...patch };
          for (const k of Object.keys(bounds) as (keyof typeof bounds)[]) {
            const [lo, hi] = bounds[k];
            next[k] = Number.isFinite(next[k])
              ? Math.min(hi, Math.max(lo, next[k]))
              : DEFAULT_OBJECT_VIEW[k];
          }
          return { views: { ...s.views, [id]: next } };
        }),
      reset: (id) =>
        set((s) => {
          const views = { ...s.views };
          delete views[id];
          return { views };
        }),
    }),
    {
      name: "ovu-object-view-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ views: s.views }),
    },
  ),
);
export const objectView = (id: string) => useObjectView.getState().views[id] ?? DEFAULT_OBJECT_VIEW;
export const viewGain = (view: ObjectView) => Math.pow(2, view.exposure) * view.brightness;
