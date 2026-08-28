# Verification notes

Desktop preview at 1280×720 confirms the intended visual hierarchy: lacquer background, compact command header, large Vietnamese headline, green/gold arena accents, player strip, and camera monitor sidebar. The board continues below the initial viewport as expected for a scrollable workspace; no clipping or overflow was observed in the visible frame.

Static checks completed successfully: `pnpm check` and `pnpm build`. The build retains the uploaded `/manus-storage/xiangqi-lacquer-bg_2414e2fb.png` path for runtime resolution.

Browser interaction check: the top navigation successfully switches from Arena to Camera lab. Camera lab renders two distinct stream tiles, the activate button, local-only privacy note, and fullscreen controls. The browser preview correctly shows the permission-gated offline state before camera access.

## Minimal UI pass

The second pass removes the generated background and grain layer from the active canvas, flattens cards, tightens spacing, and keeps only the jade/amber semantic accents. Desktop preview reads more like a focused chess room; the board has a clear 9×10 grid, consistent coordinates, traditional river band, restrained wood frame, and stronger piece contrast. Mobile preview keeps the complete board geometry legible without horizontal overflow.
