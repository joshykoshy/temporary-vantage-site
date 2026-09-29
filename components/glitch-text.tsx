"use client";

import { useEffect, useId, useRef, type PointerEvent, type ReactNode } from "react";

// A soft radial mask: noise only distorts the text inside this lens, centred on the cursor.
const LENS = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><radialGradient id="g"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><circle cx="50" cy="50" r="50" fill="url(#g)"/></svg>',
);
const R = 190; // lens radius, px

/**
 * Distorts its text around the cursor while the pointer moves over it: noise displacement inside a
 * lens plus an amber ghost pushed along the direction of travel. Strength follows pointer speed and
 * decays when the pointer stops. Off entirely for reduced motion.
 */
export function GlitchText({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  const id = useId().replace(/:/g, "");
  const el = useRef<HTMLSpanElement>(null);
  const lens = useRef<SVGFEImageElement>(null);
  const noise = useRef<SVGFETurbulenceElement>(null);
  const disp = useRef<SVGFEDisplacementMapElement>(null);
  const ghost = useRef<SVGFEOffsetElement>(null);
  const flood = useRef<SVGFEFloodElement>(null);
  const s = useRef({ energy: 0, target: 0, vx: 0, vy: 0, lx: 0, ly: 0, t: 0, raf: 0, last: 0 });

  useEffect(() => () => cancelAnimationFrame(s.current.raf), []);

  const tick = () => {
    const st = s.current;
    st.energy += (st.target - st.energy) * 0.25;
    st.target *= 0.9; // decays once the pointer stops
    const e = st.energy;
    disp.current?.setAttribute("scale", String(e * 46));
    ghost.current?.setAttribute("dx", String(st.vx * e * 10));
    ghost.current?.setAttribute("dy", String(st.vy * e * 4));
    flood.current?.setAttribute("flood-opacity", String(Math.min(0.85, e * 1.2)));
    if (++st.t % 4 === 0) noise.current?.setAttribute("seed", String((st.t * 37) % 97));
    if (el.current) el.current.style.filter = e > 0.01 ? `url(#${id})` : "none";
    st.raf = e > 0.01 || st.target > 0.01 ? requestAnimationFrame(tick) : 0;
  };

  const onMove = (ev: PointerEvent) => {
    if (disabled || ev.pointerType !== "mouse" || !el.current) return;
    const st = s.current, r = el.current.getBoundingClientRect();
    const x = ev.clientX - r.left, y = ev.clientY - r.top;
    const now = performance.now(), dt = Math.max(8, now - st.last);
    const dx = x - st.lx, dy = y - st.ly, speed = Math.hypot(dx, dy) / dt; // px per ms
    if (st.last) {
      st.target = Math.min(1, Math.max(st.target, speed * 0.9));
      st.vx = dx / (Math.hypot(dx, dy) || 1); st.vy = dy / (Math.hypot(dx, dy) || 1);
    }
    st.lx = x; st.ly = y; st.last = now;
    lens.current?.setAttribute("x", String(x - R));
    lens.current?.setAttribute("y", String(y - R));
    if (!st.raf) st.raf = requestAnimationFrame(tick);
  };

  return (
    <>
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <filter id={id} x="-10%" y="-25%" width="120%" height="150%" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feTurbulence ref={noise} type="fractalNoise" baseFrequency="0.012 0.08" numOctaves="2" seed="4" result="noise" />
          <feImage ref={lens} href={LENS} x="-999" y="-999" width={R * 2} height={R * 2} preserveAspectRatio="none" result="lens" />
          <feFlood floodColor="rgb(128,128,128)" result="neutral" />
          <feComposite in="noise" in2="lens" operator="in" result="local" />
          <feComposite in="local" in2="neutral" operator="over" result="map" />
          <feDisplacementMap ref={disp} in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" result="warped" />
          <feOffset ref={ghost} in="warped" dx="0" dy="0" result="shifted" />
          <feFlood ref={flood} floodColor="#f0a830" floodOpacity="0" result="amber" />
          <feComposite in="amber" in2="shifted" operator="in" result="ghost" />
          <feMerge>
            <feMergeNode in="ghost" />
            <feMergeNode in="warped" />
          </feMerge>
        </filter>
      </svg>
      <span ref={el} data-glitch="" onPointerMove={onMove} className="inline-block cursor-crosshair px-[0.1em]">
        {children}
      </span>
    </>
  );
}
