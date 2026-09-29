"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { Parallax } from "./motion";

type Props = {
  /** Base name in /public/media; expects `${name}.webm` and `${name}.mp4`. */
  name: string;
  poster: StaticImageData;
  alt: string;
  sizes: string;
  label: string;
  /** LCP image: fetch eagerly at high priority. */
  priority?: boolean;
  parallax?: boolean;
  className?: string;
};

// Muted decorative loop over a next/image poster. The poster carries the alt text, so the
// video is aria-hidden. Plays only while on screen, never autoplays under reduced motion,
// and always has a pause control (WCAG 2.2.2).
export function LoopVideo({ name, poster, alt, sizes, label, priority, parallax, className = "" }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [paused, setPaused] = useState(true);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const video = ref.current!;
    userPaused.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !userPaused.current) video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.25 });
    io.observe(video);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const video = ref.current!;
    userPaused.current = !video.paused;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  const media = (
    <>
      <Image src={poster} alt={alt} sizes={sizes} preload={priority} fetchPriority={priority ? "high" : undefined} placeholder="blur" fill className="object-cover" />
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => setShown(true)}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${shown ? "opacity-100" : "opacity-0"}`}
      >
        <source src={`/media/${name}.webm`} type="video/webm" />
        <source src={`/media/${name}.mp4`} type="video/mp4" />
      </video>
    </>
  );

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {parallax ? <Parallax className="absolute inset-0">{media}</Parallax> : media}
      <button
        type="button"
        onClick={toggle}
        aria-label={`${paused ? "Play" : "Pause"} ${label}`}
        className="absolute right-3 bottom-3 grid size-11 place-items-center rounded-full border border-line-strong bg-bg/85 text-fg backdrop-blur-sm transition-colors hover:bg-surface"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="currentColor">
          {paused ? <path d="M4 2.5v11l9-5.5z" /> : <path d="M4 2.5h3v11H4zm5 0h3v11H9z" />}
        </svg>
      </button>
    </div>
  );
}
