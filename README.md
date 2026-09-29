# Vantage — landing page

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Framer Motion.

```bash
npm install
npm run dev -- -p 3001      # http://localhost:3001
npm run build && npm start  # production
```

- `app/page.tsx` — the whole page (copy lives in the arrays at the top).
- `components/loop-video.tsx` — muted decorative loop over a `next/image` poster, with a pause button.
- `components/motion.tsx` — scroll reveal + hero parallax (reduced motion handled in CSS).
- `docs/asset-inventory.md`, `docs/content.md` — asset/palette research and page copy.
- `docs/scripts/build-assets.js` — regenerates everything in `public/media` and the icons/OG image from the source project:
  `FFMPEG=<path to ffmpeg> node docs/scripts/build-assets.js <vantage-site-main>/public`
- `docs/scripts/contrast.js docs/scripts/pairs.json` — WCAG + APCA check for the palette.
