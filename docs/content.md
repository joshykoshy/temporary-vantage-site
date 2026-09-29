# Vantage — Page copy

Source: rendered text of vantagevision.ai (`/`, `/vantage-vision-halo`, `/impact`, `/contact`, `/manifesto`) plus strings in its live JS bundle (feature descriptions only show on interaction). Product facts only. Anything not on the live site is marked **TODO**.

Excluded on purpose: 250M / $26B / "1 device" stats, manifesto (mission, vision, values), "Who are we doing this for" narrative, UAE 2031 policy framing, Impact-page stock scenarios (sports, society), the Red Bull Basement pitch deck, and Vantage Lucid (a separate Chrome-extension product — see TODO 6).

---

## Meta

- **Title:** Vantage Vision Halo — Navigate with instinct
- **Description:** A head-worn AI wearable that gives blind and low-vision people real-time awareness of the space around them.

## Nav

Logo · How it works · Features · Hardware · Partners · **[Get in touch]**

## Hero

- **Eyebrow:** Vantage Vision Halo
- **Headline:** Navigate with instinct.
- **Subhead:** AI-powered spatial awareness for blind and low-vision people.
- **CTA:** Get in touch → contact section

## The problem (one line, leads into How it works)

A white cane maps the ground. It can't warn you about a branch at head height or a drop-off ahead.

## How it works (steps, each paired with a clip)

1. **Detects what's around you.** Identifies and tracks objects in real time — cars, people, traffic lights — including head-level obstacles a cane misses. *(clip: obstacle_detection)*
2. **Reads the world aloud.** Street signs, menus and documents are converted to clear speech. *(clip: text_recognition)*
3. **Senses depth.** LiDAR depth mapping catches stairs, drop-offs and low-hanging obstacles. *(clip: depth_perception)*
4. **Guides you there.** Route planning with precise turn-by-turn haptic cues. *(clip: ai_navigation)*

## Features (grid of 6)

| Feature | Copy |
|---|---|
| Obstacle detection | Real-time detection and tracking of multiple objects, with context-aware feedback. |
| Text recognition | Instant OCR reads signs, menus and documents aloud. |
| Depth perception | LiDAR maps drop-offs, stairs and low-hanging obstacles in 3D. |
| AI navigation | Pathfinding that routes around obstacles with turn-by-turn haptic cues. |
| Haptic-first feedback | Guidance through touch, not constant audio, so you can still hear conversations and the street. |
| SOS mode | One gesture shares your live location and camera feed with trusted contacts. |

Secondary line (optional, under grid): **Vantage View app** — customise feedback, plan routes and find your device.

## Hardware

- **Headline:** Split-pack design.
- **Body:** Sensing sits on the halo; compute sits in a separate pack at the back of the head. The result is a light, balanced wearable. *(live site: "Split-Pack Architecture: Separating sensing from compute for weightless autonomy.")*
- **Callouts** — taken from the labels printed on the product renders `front-view.png` / `side-view.png`, not from site text:
  - TF Mini LiDAR — central, front
  - ToF sensors (render label "VLC3CX") — front and sides
  - Camera (render label "MIPI 327E Cam"; component asset: Sony IMX327)
  - Vibration motors — left and right
  - Bone-conduction speakers — left and right, ears stay open
  - Vantage Compute Pack — rear
- **TODO 1:** confirm component names/spellings (render says "VLC3CX"; the ToF component image shows a differently labelled breakout board) and the compute platform (asset named "Qualcomm RB5 Gen2" shows a Thundercomm TurboX C8550 board; a Lantronix Open-Q 5165RB image also exists). Until confirmed I will label the callouts generically (LiDAR, ToF sensors, camera, haptics, bone-conduction audio, compute pack).
- **TODO 2:** no weight, battery life, field of view, range or latency spec is stated for the hardware. (Impact page shows "< 20ms response latency" and "360° full spatial awareness" as stats — I will **not** use them unless you confirm they are real measured specs.)

## Built with users

Co-developed with **Al Noor Centre for Research, Innovation & Development (CRID)** in Dubai. Memorandum of collaboration signed; mobility therapists vet ergonomics and haptics, and students test the Halo in ongoing trials. *(photos: al-noor-01..03)*

## Credibility strip

- **Al Noor Centre (CRID)** — Co-creation partner
- **Expo City Dubai Foundation** — Incubated, Changemakers Academy
- **MBRIF Innovation Pitch** — Grant prize winner
- **Accessibility Expo 2025** — Presented at World Trade Centre Dubai

## Contact CTA

- **Headline:** Try Vantage. Partner with us.
- **Body:** We're working with partners, researchers and investors to bring the Halo to more people.
- **Primary:** Email us → mailto:devbhodia17@gmail.com
- **Direct:** Dev Bhodia, Founder — +971 55 785 7806 · Joshua Koshy, Co-founder — +971 50 997 0129
- **Location:** University of Wollongong Dubai, Knowledge Park, Dubai, UAE
- **TODO 3:** the live site has **no waitlist, pre-order, pricing or availability**. Its contact form has no visible backend. The CTA is therefore "Get in touch" by email. Tell me if you want a waitlist (and where submissions should go).
- **TODO 4:** the only email is a personal Gmail. Is there a `@vantagevision.ai` address?

## Footer

Vantage logo · © 2026 Vantage · Dubai, UAE · Email
- **TODO 5:** Privacy and Accessibility links on the live site point to `#`. No policy pages exist; I'll omit them unless you supply URLs.
- **TODO 6:** Vantage Lucid (Chrome extension) — include a one-line footer link, or leave it off this page?

---

## Build decisions for open TODOs (2026-09-28, pending your confirmation)

1. Hardware callouts use generic names (LiDAR, time-of-flight sensors, camera, haptic motors, bone-conduction audio, compute pack). No compute platform or model numbers are named.
2. No specs are shown. "< 20ms" and "360°" are left out.
3. The CTA is "Email the team" (a mailto link to the Gmail address). There is no waitlist form.
4. The footer has no Privacy or Accessibility links, and there is no Lucid link.
