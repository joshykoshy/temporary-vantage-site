"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import logo from "@/public/media/logo-mark.png";

const links = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#hardware", label: "Hardware" },
  { href: "#partners", label: "Partners" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [overIntro, setOverIntro] = useState(true);

  // Stay out of the way while the full-screen intro is on screen; focus brings it back.
  useEffect(() => {
    const intro = document.getElementById("intro");
    if (!intro) return;
    const io = new IntersectionObserver(([e]) => setOverIntro(e.intersectionRatio > 0.35), { threshold: [0, 0.35, 1] });
    io.observe(intro);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-md transition-transform duration-300 motion-reduce:transition-none ${
        overIntro && !open ? "-translate-y-full focus-within:translate-y-0" : ""
      }`}
    >
      <nav aria-label="Main" className="mx-auto flex h-18 max-w-7xl items-center gap-3 px-5 sm:gap-6 sm:px-8">
        <a href="#intro" className="mr-auto flex items-center gap-3 rounded-md py-2">
          <Image src={logo} alt="" width={42} height={20} loading="eager" />
          <span className="font-display text-lg tracking-tight">Vantage</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-[0.9375rem] text-muted transition-colors hover:text-fg">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contact"
          className="rounded-full bg-amber px-4 py-2.5 text-[0.9375rem] sm:px-5 font-medium text-bg transition-opacity hover:opacity-90"
        >
          Get in touch
        </a>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
          className="-mr-2 grid size-11 place-items-center rounded-full text-fg md:hidden"
        >
          <span className="sr-only">Menu</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6">
            {open ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 7h14M3 13h14" />}
          </svg>
        </button>
      </nav>

      <ul id="mobile-menu" hidden={!open} className="border-t border-line px-5 pb-4 md:hidden">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} onClick={() => setOpen(false)} className="block border-b border-line py-4 text-lg">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </header>
  );
}
