"use client";

import Image, { type StaticImageData } from "next/image";
import { m, useAnimationFrame, useInView, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useMedia } from "./use-media";

import cm5 from "@/public/media/part-cm5.png";
import nanoBase from "@/public/media/part-nano-base.png";
import aiCamera from "@/public/media/part-ai-camera.png";
import openMove from "@/public/media/part-openmove.png";
import lidar from "@/public/media/part-lidar.png";
import tof from "@/public/media/part-tof.png";
import logo from "@/public/media/logo-mark.png";

type Part = { img: StaticImageData; role: string; name: string };

const parts: Part[] = [
  { img: cm5, role: "Compute", name: "Raspberry Pi Compute Module 5" },
  { img: aiCamera, role: "Vision", name: "Raspberry Pi AI Camera (IMX500)" },
  { img: lidar, role: "Depth", name: "TF Mini LiDAR" },
  { img: openMove, role: "Audio", name: "SHOKZ OpenMove bone-conduction headset" },
  { img: tof, role: "Proximity", name: "Time-of-flight sensor" },
  { img: nanoBase, role: "Carrier board", name: "Waveshare Nano Base Board for CM5" },
];
const STEP = 360 / parts.length;
const DEG_PER_MS = 360 / 45_000; // one revolution every 45 s

/**
 * The V01 build as a 3D ring (after Framer's "3D Carousel"): cards sit around a Y-axis ring that
 * turns continuously, tilts toward the pointer, and stops while a card is hovered — that card
 * steps forward and brightens. Stops off screen, under reduced motion, or via the pause button.
 */
export function Showcase3D() {
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { margin: "100px" });
  const wide = useMedia("(min-width: 1024px)");
  const reduce = useMedia("(prefers-reduced-motion: reduce)");
  const [hovered, setHovered] = useState<number | null>(null);
  const [userPaused, setUserPaused] = useState(false);
  const spinning = inView && hovered === null && !userPaused && !reduce;
  const spinningRef = useRef(spinning);
  useEffect(() => { spinningRef.current = spinning; }, [spinning]);

  const spin = useMotionValue(-20);
  useAnimationFrame((_, delta) => {
    if (spinningRef.current) spin.set(spin.get() - delta * DEG_PER_MS);
  });

  // Pointer parallax: the whole ring leans toward the cursor.
  const px = useMotionValue(0), py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 70, damping: 18 }), sy = useSpring(py, { stiffness: 70, damping: 18 });
  const rotateY = useTransform([spin, sx], ([s, x]: number[]) => s + x * 16);
  const rotateX = useTransform(sy, (y) => -8 - y * 8);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
    py.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };

  const radius = wide ? 430 : 250;

  return (
    <div
      ref={box}
      onPointerMove={onMove}
      onPointerLeave={() => { px.set(0); py.set(0); setHovered(null); }}
      className="relative h-[32rem] overflow-hidden rounded-[28px] border border-line bg-stage lg:h-[44rem]"
      style={{ perspective: wide ? 1200 : 900 }}
    >
      {/* Warm floor light the ring floats over */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(ellipse_55%_60%_at_50%_100%,rgb(240_168_48/0.16),transparent)]" />
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_50%_45%,rgb(236_232_225/0.05),transparent)]" />

      <m.ul
        aria-label="Components in the V01 build"
        data-hovered={hovered ?? ""}
        // Pushed back by its radius so the front card sits at natural size, not magnified.
        style={{ z: -radius, rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="absolute top-[46%] left-1/2 size-0"
      >
        {parts.map((p, i) => (
          <Card key={p.name} part={p} index={i} radius={radius} spin={spin} hovered={hovered} onHover={setHovered} />
        ))}
      </m.ul>

      <p className="absolute bottom-5 left-6 text-sm tracking-[0.16em] text-muted uppercase">The V01 build</p>
      <button
        type="button"
        onClick={() => setUserPaused(!userPaused)}
        aria-label={userPaused ? "Resume rotation" : "Pause rotation"}
        className="absolute right-4 bottom-4 grid size-11 place-items-center rounded-full border border-line-strong bg-bg/70 text-fg transition-colors hover:bg-surface"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="currentColor">
          {userPaused || reduce ? <path d="M4 2.5v11l9-5.5z" /> : <path d="M4 2.5h3v11H4zm5 0h3v11H9z" />}
        </svg>
      </button>
    </div>
  );
}

function Card({ part, index, radius, spin, hovered, onHover }: {
  part: Part; index: number; radius: number; spin: MotionValue<number>;
  hovered: number | null; onHover: (i: number | null) => void;
}) {
  const angle = index * STEP;
  // How squarely the card faces the viewer (1 = front, -1 = back) drives light and glare.
  const facing = useTransform(spin, (s) => Math.cos(((angle + s) * Math.PI) / 180));
  const opacity = useTransform(facing, (f) => 0.28 + 0.72 * Math.max(0, (f + 0.35) / 1.35));
  const glareX = useTransform(spin, (s) => `${50 + Math.sin(((angle + s) * Math.PI) / 180) * 70}%`);
  const isHovered = hovered === index;
  const dimmed = hovered !== null && !isHovered;

  return (
    <li
      className="absolute"
      style={{ transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px)`, transformStyle: "preserve-3d" }}
    >
      <m.div
        onPointerEnter={(e) => e.pointerType === "mouse" && onHover(index)}
        onPointerLeave={() => onHover(null)}
        animate={{ z: isHovered ? 50 : 0, scale: isHovered ? 1.05 : 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative h-80 w-52 lg:h-[26rem] lg:w-72"
      >
        {/* Front face. Opacity/filter live on the faces, not the card, so the card keeps its 3D. */}
        <m.div
          style={{ opacity: isHovered ? 1 : opacity }}
          animate={{ filter: dimmed ? "brightness(0.55)" : "brightness(1)" }}
          className={`absolute inset-0 flex flex-col overflow-hidden rounded-[22px] border bg-linear-to-b from-fg/[0.09] to-fg/[0.02] shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)] [backface-visibility:hidden] ${isHovered ? "border-amber/60" : "border-fg/15"}`}
        >
          {/* Warm glow behind the part + moving glare across the glass */}
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgb(240_168_48/0.22),transparent_62%)]" />
          <m.div
            aria-hidden="true"
            style={{ backgroundPositionX: glareX }}
            className="absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgb(255_255_255/0.10)_45%,transparent_60%)] bg-[length:250%_100%]"
          />
          <div className="relative flex-1">
            <Image src={part.img} alt="" fill sizes="(min-width: 1024px) 288px, 208px" className="object-contain p-7 drop-shadow-[0_18px_28px_rgb(0_0_0/0.55)]" />
          </div>
          <div className="relative border-t border-fg/10 px-5 py-4">
            <p className="text-xs font-medium tracking-[0.16em] text-amber uppercase">{part.role}</p>
            <p className="mt-1 font-display text-base leading-snug text-fg lg:text-lg">{part.name}</p>
          </div>
        </m.div>
        {/* Back face: plain glass with the mark, so the far side of the ring never shows mirrored text. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center rounded-[22px] border border-fg/10 bg-linear-to-b from-fg/[0.06] to-fg/[0.01] [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          <Image src={logo} alt="" width={64} height={31} className="opacity-25" />
        </div>
      </m.div>
    </li>
  );
}
