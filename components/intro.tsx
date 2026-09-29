"use client";

import Image, { type StaticImageData } from "next/image";
import { m, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { GlitchText } from "./glitch-text";
import { useMedia } from "./use-media";

import posterDefault from "@/public/media/intro/default.jpg";
import posterObstacles from "@/public/media/intro/obstacles.jpg";
import posterReading from "@/public/media/intro/reading.jpg";
import posterDepth from "@/public/media/intro/depth.jpg";
import posterNavigation from "@/public/media/intro/navigation.jpg";
import posterHaptics from "@/public/media/intro/haptics.jpg";
import posterSos from "@/public/media/intro/sos.jpg";

type Scene = {
  video: string;
  poster: StaticImageData;
  title: [string, string, string]; // HEAVY · italic · HEAVY
  name: string; // the one-line feature label on the HUD
};

const intro: Scene = {
  video: "default", poster: posterDefault, title: ["Navigate", "with", "instinct"],
  name: "",
};

// Order = on-screen anchors: top-left, top-centre, top-right, bottom-left, bottom-centre, bottom-right.
const scenes: Scene[] = [
  { video: "obstacles", poster: posterObstacles, title: ["Above", "the", "cane"],
    name: "Obstacle detection" },
  { video: "reading", poster: posterReading, title: ["Signs", "out", "loud"],
    name: "Text recognition" },
  { video: "depth", poster: posterDepth, title: ["Step", "by", "step"],
    name: "Depth perception" },
  { video: "navigation", poster: posterNavigation, title: ["Find", "your", "way"],
    name: "AI navigation" },
  { video: "haptics", poster: posterHaptics, title: ["Feel", "the", "route"],
    name: "Haptic guidance" },
  { video: "sos", poster: posterSos, title: ["Help", "at", "hand"],
    name: "SOS mode" },
];
const all = [...scenes, intro];
const DEFAULT = scenes.length;

// rev: right-hand anchors put the diamond on the outer edge.
const anchor = [
  { pos: "top-10 left-20", rev: false },
  { pos: "top-10 left-1/2 -translate-x-1/2", rev: false },
  { pos: "top-10 right-20", rev: true },
  { pos: "bottom-10 left-20", rev: false },
  { pos: "bottom-10 left-1/2 -translate-x-1/2", rev: false },
  { pos: "bottom-10 right-20", rev: true },
];

const still = "motion-reduce:transform-none!";
const shadow = "[text-shadow:0_1px_3px_rgb(0_0_0/0.7)]";

function Diamond({ n, on }: { n: number; on: boolean }) {
  return (
    <span aria-hidden="true" className={`grid size-8 shrink-0 rotate-45 place-items-center border transition-colors ${on ? "border-amber bg-amber text-bg" : "border-current"}`}>
      <span className="-rotate-45 font-display text-xs tabular-nums [text-shadow:none]">{String(n).padStart(2, "0")}</span>
    </span>
  );
}

export function Intro() {
  const [active, setActive] = useState(DEFAULT);
  const [seen, setSeen] = useState<Set<number>>(() => new Set());
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const [pointerIn, setPointerIn] = useState(false);
  const [touched, setTouched] = useState(false); // first title paints without animation (LCP)
  const [warm, setWarm] = useState(false); // other posters load after first paint
  const reduce = useMedia("(prefers-reduced-motion: reduce)");
  const touch = useMedia("(hover: none)");
  const paused = userPaused ?? reduce;
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  const select = (i: number) => {
    setTouched(true);
    setActive(i);
    setSeen((s) => (s.has(i) ? s : new Set(s).add(i)));
  };

  // Parallax + cursor dot, driven by the pointer position inside the intro.
  const px = useMotionValue(0), py = useMotionValue(0), cx = useMotionValue(-100), cy = useMotionValue(-100);
  const sx = useSpring(px, { stiffness: 60, damping: 20 }), sy = useSpring(py, { stiffness: 60, damping: 20 });
  const bgX = useTransform(sx, (v) => v * -14), bgY = useTransform(sy, (v) => v * -10);
  const tX = useTransform(sx, (v) => v * 12), tY = useTransform(sy, (v) => v * 8);
  const dotX = useSpring(cx, { stiffness: 500, damping: 40 }), dotY = useSpring(cy, { stiffness: 500, damping: 40 });

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    px.set(x * 2 - 1); py.set(y * 2 - 1); cx.set(e.clientX - r.left); cy.set(e.clientY - r.top);
    if ((e.target as Element).closest("[data-glitch]")) return; // playing with the title keeps the scene
    const zone = (y < 0.5 ? 0 : 3) + Math.min(2, Math.floor(x * 3));
    if (zone !== active) select(zone);
  };

  // Start fetching the default loop once the page has painted.
  useEffect(() => {
    const t = setTimeout(() => setSeen((s) => new Set(s).add(DEFAULT)), 600);
    const w = setTimeout(() => setWarm(true), 1500);
    return () => { clearTimeout(t); clearTimeout(w); };
  }, []);

  // Only the visible loop plays.
  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (i === active && !paused) v.play().catch(() => {});
      else v.pause();
    });
  }, [active, paused, seen]);

  // Touch screens have no hover: cycle through the scenes instead (pausable).
  useEffect(() => {
    if (!touch || paused) return;
    const t = setInterval(() => {
      setActive((a) => {
        const next = a >= DEFAULT - 1 ? 0 : a + 1;
        setSeen((s) => (s.has(next) ? s : new Set(s).add(next)));
        return next;
      });
    }, 6000);
    return () => clearInterval(t);
  }, [touch, paused]);

  const scene = all[active];

  return (
    <section
      id="intro"
      aria-labelledby="intro-title"
      onPointerMove={onMove}
      onPointerEnter={(e) => e.pointerType === "mouse" && setPointerIn(true)}
      onPointerLeave={() => { setPointerIn(false); px.set(0); py.set(0); if (!touch) setActive(DEFAULT); }}
      className="relative isolate h-svh min-h-[36rem] overflow-hidden bg-stage text-fg"
    >
      <h1 id="intro-title" className="sr-only">
        Vantage Vision Halo: AI-powered spatial awareness for blind and low-vision people
      </h1>

      {/* Background loops: decorative, the text carries the meaning. */}
      <m.div aria-hidden="true" style={{ x: bgX, y: bgY }} className={`absolute -inset-8 ${still}`}>
        {all.map((s, i) => (
          <div key={s.video} className={`absolute inset-0 transition-opacity duration-700 ease-out ${i === active ? "opacity-100" : "opacity-0"}`}>
            {(i === DEFAULT || warm || seen.has(i)) && <Image
              src={s.poster}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              {...(i === DEFAULT ? { preload: true, fetchPriority: "high" as const } : { fetchPriority: "low" as const })}
            />}
            {seen.has(i) && !reduce && (
              <video
                ref={(el) => { videos.current[i] = el; }}
                muted
                loop
                playsInline
                preload="auto"
                tabIndex={-1}
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src={`/media/intro/${s.video}.webm`} type="video/webm" />
                <source src={`/media/intro/${s.video}.mp4`} type="video/mp4" />
              </video>
            )}
          </div>
        ))}
      </m.div>

      {/* Scrims keep every text pair above WCAG AA over any frame (checked in docs/scripts). */}
      <div aria-hidden="true" className="absolute inset-0 bg-stage/60 lg:bg-stage/45" />
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_center,rgb(5_5_5/0.6),transparent)]" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-stage/95 via-stage/70 to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-stage/95 via-stage/70 to-transparent" />
      <div aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-28 bg-linear-to-r from-stage/85 to-transparent lg:block" />
      <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-28 bg-linear-to-l from-stage/85 to-transparent lg:block" />

      {/* Central title */}
      <div className="absolute inset-0 grid place-items-center px-5">
        <m.div style={{ x: tX, y: tY }} className={`text-center lg:max-w-[calc(100vw-13rem)] ${still}`}>
          <p className={`mb-4 text-sm font-medium tracking-[0.2em] text-amber uppercase ${shadow}`}>Vantage Vision Halo</p>
          <m.p
            key={active}
            aria-hidden="true"
            initial={touched ? { opacity: 0, y: 14, filter: "blur(6px)" } : false}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={`font-display text-[clamp(3rem,min(9.5vw,16vh),11rem)] leading-[0.88] font-bold tracking-[-0.04em] text-balance uppercase ${shadow} ${still}`}
          >
            <GlitchText disabled={reduce}>
              {scene.title[0]}{" "}
              <span className="font-serif text-[1.08em] font-normal tracking-normal normal-case italic">{scene.title[1]}</span>{" "}
              {scene.title[2]}
            </GlitchText>
          </m.p>
          {/* Small screens: the active scene's metadata sits under the title. */}
          <p aria-hidden="true" className={`mx-auto mt-6 max-w-xs text-sm tracking-[0.08em] uppercase lg:hidden ${shadow}`}>
            {scene.name || "Six ways the Halo helps"}
          </p>
        </m.div>
      </div>

      {/* HUD — large screens: six anchored scene controls */}
      <ul className="hidden lg:block">
        {scenes.map((s, i) => (
          <li key={s.video} className={`absolute z-10 ${anchor[i].pos}`}>
            <button
              type="button"
              aria-pressed={i === active}
              onFocus={() => select(i)}
              onClick={() => select(i)}
              className={`flex items-center gap-4 rounded-lg px-2 py-1.5 font-display text-xl tracking-[0.04em] whitespace-nowrap uppercase transition-colors ${shadow} ${i === active ? "text-fg" : "text-muted hover:text-fg"} ${anchor[i].rev ? "flex-row-reverse" : ""}`}
            >
              <Diamond n={i + 1} on={i === active} />
              {s.name}
            </button>
          </li>
        ))}
      </ul>

      {/* Side rails */}
      <a href="#meet" className={`absolute top-1/2 left-5 z-10 hidden -translate-y-1/2 rotate-180 py-3 text-sm tracking-[0.3em] uppercase [writing-mode:vertical-rl] hover:text-amber lg:block ${shadow}`}>
        Explore
      </a>
      <a href="#contact" className={`absolute top-1/2 right-5 z-10 hidden -translate-y-1/2 py-3 text-sm tracking-[0.3em] uppercase [writing-mode:vertical-rl] hover:text-amber lg:block ${shadow}`}>
        Contact
      </a>

      {/* Small screens: scene picker + pause */}
      <div className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-4 px-5 lg:hidden">
        <ul className="flex gap-3">
          {scenes.map((s, i) => (
            <li key={s.video}>
              <button
                type="button"
                aria-pressed={i === active}
                aria-label={`${String(i + 1).padStart(2, "0")} ${s.name}`}
                onClick={() => { select(i); setUserPaused(true); }}
                className="grid size-11 place-items-center text-fg"
              >
                <Diamond n={i + 1} on={i === active} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => setUserPaused(!paused)}
        aria-label={paused ? "Play background video" : "Pause background video"}
        className="absolute top-4 right-4 z-10 grid size-11 place-items-center rounded-full border border-line-strong bg-bg/70 text-fg backdrop-blur-sm transition-colors hover:bg-surface lg:top-auto lg:right-auto lg:bottom-8 lg:left-4"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="currentColor">
          {paused ? <path d="M4 2.5v11l9-5.5z" /> : <path d="M4 2.5h3v11H4zm5 0h3v11H9z" />}
        </svg>
      </button>

      {/* Cursor dot: follows the pointer on top of the system cursor (never replaces it). */}
      <m.div
        aria-hidden="true"
        style={{ x: dotX, y: dotY }}
        className={`pointer-events-none absolute top-0 left-0 z-20 -mt-4 -ml-4 hidden size-8 place-items-center rounded-full border border-fg/70 transition-opacity duration-300 lg:grid ${pointerIn ? "opacity-100" : "opacity-0"}`}
      >
        <span className="size-1.5 rounded-full bg-amber" />
      </m.div>
    </section>
  );
}
