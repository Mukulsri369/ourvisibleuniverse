# Implementation Plan: Fix SSR Hydration Mismatch & Eliminate Runtime Inconsistencies

This plan addresses the React hydration mismatch warning reported during server-side rendering (SSR) on TanStack Start routes, while strictly safeguarding the 5 protected Lovable authentication and core star field files (`/.lovable/mcp/manifest.json`, `/src/integrations/supabase/previewAuthStorage.ts`, `/src/integrations/supabase/types.ts`, `/src/routes/auth.tsx`, and `/src/stars/StarField.tsx`).

---

## 1. Root Cause Analysis: Hydration Attribute & Node Mismatch

The hydration mismatch (`https://react.dev/link/hydration-mismatch`) occurs when client initial render differs from server rendered HTML:
1. **Server/Client State Branch in `src/routes/galaxies.tsx`**:
   - `exploredChapters` state was initialized using a function returning `if (typeof window === "undefined") return []`.
   - On the server, `exploredChapters` was `[]` (rendering `0 of 5 Chapters Explored`, and `aria-checked="false"` on list items).
   - On the client during hydration, `window !== undefined` evaluated, returning `["13-1-morphology"]` from the initial state initializer. This caused React to detect mismatched HTML attributes and text content on first render.
2. **Date & Time Locale Differences in `src/routes/_authenticated/account.tsx`**:
   - `toLocaleDateString()` without fixed locale or hydration suppression rendered server-side in UTC/server format while matching client local browser format differently.
   - `Date.now()` within the render pass created sub-second/day-boundary drift.

---

## 2. Proposed Changes

### Route Hydration Alignment (`src/routes/galaxies.tsx`)
- Standardize initial state to `["13-1-morphology"]` on both server and client.
- Hydrate custom `localStorage` state inside `useEffect` post-hydration, guaranteeing identical initial DOM trees.

### Deterministic Locale & Hydration Guards (`src/routes/_authenticated/account.tsx`)
- Add `suppressHydrationWarning` to date displays rendered from dynamic timestamps.

### Root Shell Robustness (`src/routes/__root.tsx`)
- Ensure root shell `<html>` and `<body>` tags maintain `suppressHydrationWarning` to absorb external browser extension mutations (Grammarly, translate, dark mode extensions).

---

## 3. Verification Plan

1. **Compilation**: Run `compile_applet` to ensure zero build errors.
2. **Automated Test Suite**: Run `npm run test:all` (all 339 astronomy, physics, visual regression, and catalog tests).
3. **Protected Files Invariant**: Confirm zero edits to the 5 Lovable authentication files.
