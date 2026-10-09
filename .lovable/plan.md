# Add "Visualize Maths" link to the sitemap and update landing text

## Goal
Add a button in the universe sitemap that opens your math-visualization tool
(MathSpace at https://visualizemaths.ai.studio) in a new tab, and update the
landing page so it mentions this companion tool for visualizing astronomical
mathematics.

## Changes

### 1. Sitemap button (src/stars/UI.tsx)
- Add a "∑ Visualize Maths" button at the bottom of the SiteMap panel, below
  the destination list, so it is always visible regardless of the selected
  section (planets / stars / galaxies / objects).
- The button opens `https://visualizemaths.ai.studio` in a new browser tab
  (`target="_blank"`, `rel="noopener noreferrer"`) — it does not leave or
  unload the universe.
- Styled to match the existing sitemap rows, with a small "opens in new tab"
  hint (↗).
- Works on both desktop (left sidebar) and mobile (bottom sheet), since both
  render the same panel body.

### 2. Landing page text (src/routes/index.tsx)
- In the "Learn by exploring" section, add a short mention that the
  mathematics behind the universe — orbits, curves, fields and multivariable
  functions — can be explored interactively in the companion tool
  VisualizeMaths, with a link button to https://visualizemaths.ai.studio.
- Keep all existing sections, pricing and layout unchanged.

### 3. Features page (src/routes/features.tsx)
- Add one short section "Visualize the mathematics" pointing to the same
  tool, so the public pages stay consistent.

## Verification
- Type check and build pass.
- Open the universe in the preview, open the sitemap (desktop and mobile
  widths), confirm the button appears and opens the tool in a new tab.
