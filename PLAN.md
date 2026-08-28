# DualCam Xiangqi Arena — Build Plan

## Intent
A premium client-only command center combining two local camera streams with a playable Xiangqi board against a deliberately challenging local AI.

## Risk slices
1. **Dual camera permissions:** request a user-facing stream and an environment-facing stream, attach each stream to a dedicated video element, stop tracks on unmount, and gracefully fall back when only one camera is available.
2. **Board interaction:** implement legal-looking Xiangqi movement rules for all seven piece types, selection states, captures, and mobile-friendly controls.
3. **Hard AI:** use a bounded minimax search with alpha-beta pruning, capture ordering, and a deliberate response delay so the mode feels computational rather than random.
4. **Visual verification:** confirm the command center hierarchy, full board visibility, camera states, responsive layout, and mobile overflow behavior.

## Verification criteria
- Arena and Camera lab navigation both render.
- Red pieces can be selected and moved to legal highlighted cells.
- Black AI responds automatically and move history updates.
- New game, undo, and hint controls work.
- Start/stop camera controls handle permissions and unavailable second camera without crashing.
- Camera streams remain local in-browser and are stopped on unmount.
- `pnpm check` and `pnpm build` pass.
