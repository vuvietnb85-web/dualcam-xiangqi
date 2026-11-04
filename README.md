# DualCam Xiangqi Arena — Chinese Chess (Cờ Tướng) vs AI with Dual Live Cameras

🔗 **Live demo / Chơi thử ngay:** https://vuvietnb85-web.github.io/dualcam-xiangqi/

**DualCam Xiangqi Arena is a mobile-first web app where you play Xiangqi (Chinese chess / cờ tướng) against a local minimax AI while two live device cameras (front and rear) are shown beside the board.**

## Features

- Playable international 9×10 Xiangqi board with a river band and coordinates, red vs. black piece contrast.
- Movement rules for all seven Xiangqi piece types, piece selection, legal-target highlighting and captures, touch-friendly.
- Local AI opponent using minimax search with alpha-beta pruning and capture ordering — runs entirely in the browser.
- Two live camera tiles (user-facing and environment-facing streams) with permission/error feedback and fullscreen view.
- Optional, user-toggled generated "ancient battlefield" ambience sound (autoplay-safe).
- Vertical 9:16 dark layout designed for phones; no account and no server-side game data — camera video stays on your device.

## How to run

Requirements: Node.js 20+ and pnpm.

```bash
pnpm install
pnpm dev        # local development server
pnpm build      # production build
pnpm start      # run the production build
```

## Tech stack

React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Web APIs (`getUserMedia`, Web Audio API), a small Express server for production serving.

## FAQ

**What is DualCam Xiangqi Arena?** A browser game for playing Xiangqi (Chinese chess, Vietnamese *cờ tướng*) against an AI, with two live camera views on screen.

**Does the camera video get uploaded?** No. Streams are attached directly to video elements in your browser; the app does not upload them.

**How strong is the AI?** It uses a bounded minimax search with alpha-beta pruning and material/position heuristics; it is a casual-to-intermediate opponent, not a professional engine.

**What if my device has only one camera?** The app shows a permission/availability message for the missing stream and keeps the game playable.

**Does it work on mobile?** Yes, it is designed for a portrait 9:16 phone screen and also works on desktop browsers.

## Tiếng Việt

**DualCam Xiangqi Arena** là ứng dụng web chơi **cờ tướng với máy (AI)** trên điện thoại, hiển thị đồng thời **hai camera trước và sau**. Bàn cờ 9×10 chuẩn quốc tế, AI minimax alpha-beta chạy ngay trong trình duyệt, có âm thanh chiến trường cổ tùy chọn, giao diện tối dọc 9:16. Video camera không bị tải lên mạng.

Từ khóa: cờ tướng online, chơi cờ tướng với máy, cờ tướng AI, Chinese chess, Xiangqi.

## Support / Ủng hộ

If this project helps you, you can support the author:

- ☕ Ko-fi: https://ko-fi.com/quocvietvu
- 💙 PayPal: https://www.paypal.com/donate?business=vuvietnb85%40gmail.com&currency_code=USD

## Author

**Vu Quoc Viet (Vũ Quốc Việt)** — VXO Digital Lab, Vietnam · GitHub [@vuvietnb85-web](https://github.com/vuvietnb85-web)

## 📺 Trình phát media tích hợp / Built-in media player

Nút **▶︎ Media** nổi ở góc màn hình mở một bảng toàn màn hình (giao diện tiếng Việt):

- **TV tiếng Việt**: một số kênh địa phương phát HLS công khai (hls.js), đã thử phát được trên trình duyệt ngày 05/11/2026. Các kênh không cho nhúng (VTV, HTV, THVL, Hà Nội, DRT, NTV…) chỉ có nút mở trang chính thức của đài. Không dùng nguồn phát lại lậu. Luồng do đài cung cấp, có thể ngừng bất cứ lúc nào.
- **Radio**: VOV1–VOV5, VOV Giao thông Hà Nội / TP.HCM, VOV Mekong (luồng công khai của VOV).
- **Nhạc tải lên**: chọn tệp hoặc cả thư mục; lưu trên máy bằng IndexedDB (không tải lên mạng). Dung lượng **không giới hạn cứng nhưng phụ thuộc bộ nhớ thiết bị và hạn mức trình duyệt**. Có trộn bài, lặp, điều khiển trên màn hình khoá (Media Session).
- **Đọc EPUB** (epub.js): mục lục, cỡ chữ, nền tối, nhớ vị trí đọc.
- **OCR ảnh / PDF scan** (tesseract.js, tiếng Việt + tiếng Anh): xử lý ngay trên máy; lần đầu cần tải dữ liệu ngôn ngữ (~vài MB). Sao chép hoặc tải về .txt.

EN: a floating **▶︎ Media** button opens Vietnamese TV (legal public streams only; others link to the official site), VOV radio, a local music library stored in IndexedDB (capacity limited by device/browser storage), an EPUB reader and on-device Vietnamese/English OCR. Heavy libraries are lazy-loaded.
