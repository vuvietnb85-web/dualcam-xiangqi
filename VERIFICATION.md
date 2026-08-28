# Verification notes

Desktop preview at 1280×720 confirms the intended visual hierarchy: lacquer background, compact command header, large Vietnamese headline, green/gold arena accents, player strip, and camera monitor sidebar. The board continues below the initial viewport as expected for a scrollable workspace; no clipping or overflow was observed in the visible frame.

Static checks completed successfully: `pnpm check` and `pnpm build`. The build retains the uploaded `/manus-storage/xiangqi-lacquer-bg_2414e2fb.png` path for runtime resolution.

Browser interaction check: the top navigation successfully switches from Arena to Camera lab. Camera lab renders two distinct stream tiles, the activate button, local-only privacy note, and fullscreen controls. The browser preview correctly shows the permission-gated offline state before camera access.

## Minimal UI pass

The second pass removes the generated background and grain layer from the active canvas, flattens cards, tightens spacing, and keeps only the jade/amber semantic accents. Desktop preview reads more like a focused chess room; the board has a clear 9×10 grid, consistent coordinates, traditional river band, restrained wood frame, and stronger piece contrast. Mobile preview keeps the complete board geometry legible without horizontal overflow.

## 9:16 and audio pass

The active presentation is now a centered vertical 9:16 stage (480px maximum width) that fills mobile screens and reads as a phone-like experience on desktop. The board remains a responsive 9×10 layout with clean intersections, coordinates, river label, compact wood frame, and strong piece contrast.

The generated ancient-war ambience is stored in WebDev storage and exposed through a header volume control. Browser interaction verification confirmed the button changes from “Bật âm thanh chiến trận” to “Tắt âm thanh chiến trận” after a user gesture, which satisfies autoplay policy while keeping the sound optional.
