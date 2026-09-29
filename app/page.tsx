import Image from "next/image";
import type { ReactNode } from "react";
import { LoopVideo } from "@/components/loop-video";
import { Reveal } from "@/components/motion";
import { Intro } from "@/components/intro";
import { Nav } from "@/components/nav";
import { Showcase3D } from "@/components/showcase-3d";

import haloPoster from "@/public/media/halo-poster.jpg";
import clipObstacles from "@/public/media/clip-obstacles.jpg";
import clipReading from "@/public/media/clip-reading.jpg";
import clipDepth from "@/public/media/clip-depth.jpg";
import clipNavigation from "@/public/media/clip-navigation.jpg";
import alNoor from "@/public/media/al-noor-2.jpg";
import changemakers from "@/public/media/changemakers.jpg";
import mbrif from "@/public/media/mbrif.jpg";
import redBull from "@/public/media/red-bull-basement.jpg";
import accessibilityExpo from "@/public/media/accessibility-expo.jpg";
import logo from "@/public/media/logo-mark.png";

const EMAIL = "devbhodia17@gmail.com";

// Frame colours are each clip's own sampled edge colour (docs/scripts/build-assets.js).
const steps = [
  {
    clip: "clip-obstacles", poster: clipObstacles, frame: "#92785e",
    title: "Detects what’s around you",
    body: "Tracks cars, people and traffic lights in real time, including head-height obstacles a cane can’t reach.",
    alt: "Illustration: a woman wearing the Halo walks along a pavement; orange rings show it sensing a construction barrier ahead.",
  },
  {
    clip: "clip-reading", poster: clipReading, frame: "#835e4d",
    title: "Reads the world aloud",
    body: "Street signs, menus and documents are turned into clear speech.",
    alt: "Illustration: a woman wearing the Halo passes a restaurant; the sign reading “NARA” is outlined as it is recognised.",
  },
  {
    clip: "clip-depth", poster: clipDepth, frame: "#a98567",
    title: "Senses depth",
    body: "LiDAR depth mapping picks out stairs, drop-offs and low-hanging obstacles before you reach them.",
    alt: "Illustration: a woman wearing the Halo approaches a staircase, shown as a colour depth map labelled “Stairs ahead”.",
  },
  {
    clip: "clip-navigation", poster: clipNavigation, frame: "#b39a85",
    title: "Guides you there",
    body: "Plans a route around obstacles and guides you turn by turn with haptic cues.",
    alt: "Illustration: a woman wearing the Halo stands in a courtyard of outlined benches, with a clear path to an open door.",
  },
];

const hardware = [
  { name: "Compute", body: "Raspberry Pi Compute Module 5 on a Waveshare Nano base board, in the rear pack." },
  { name: "Camera", body: "Raspberry Pi AI Camera (Sony IMX500) for object detection and text recognition." },
  { name: "LiDAR", body: "TF Mini LiDAR for depth: stairs, drop-offs and obstacles ahead." },
  { name: "Time-of-flight sensors", body: "Front and side coverage for what’s close." },
  { name: "Bone-conduction audio", body: "SHOKZ OpenMove headset: speech that leaves your ears open." },
  { name: "Haptic motors", body: "Left and right cues for direction." },
];

const credits = [
  { img: redBull, org: "Red Bull Basement", note: "UAE national winners — we represented the UAE at the World Finals in San Francisco.",
    alt: "Two Vantage team members holding the Red Bull Basement UAE Winner trophy on stage.", pos: "object-center" },
  { img: changemakers, org: "Expo City Dubai Foundation", note: "Incubated in the Changemakers Academy.",
    alt: "The Changemakers Academy cohort on stage at Expo City Dubai.", pos: "object-center" },
  { img: mbrif, org: "MBRIF Innovation Pitch", note: "Grant prize winner.",
    alt: "The Vantage team on stage receiving their award at the MBRIF Innovation Pitch.", pos: "object-top" },
  { img: accessibilityExpo, org: "Accessibility Expo 2025", note: "Presented at World Trade Centre Dubai.",
    alt: "Vantage team members at a stand at Accessibility Expo 2025.", pos: "object-top" },
];

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-5 text-sm font-medium tracking-[0.16em] text-amber uppercase">{children}</p>;
}

function SectionHead({ id, eyebrow, title, lead }: { id: string; eyebrow: string; title: string; lead?: string }) {
  return (
    <Reveal className="max-w-3xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className="font-display text-4xl leading-[1.05] tracking-[-0.02em] text-balance sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {lead && <p className="mt-6 max-w-2xl text-lg text-pretty text-muted sm:text-xl">{lead}</p>}
    </Reveal>
  );
}

const wrap = "mx-auto max-w-7xl px-5 sm:px-8";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="fixed top-3 left-3 z-[60] -translate-y-24 rounded-full bg-amber px-5 py-3 font-medium text-bg focus:translate-y-0"
      >
        Skip to content
      </a>
      <Nav />

      <main id="main" tabIndex={-1} className="outline-none">
        <Intro />

        {/* Meet the Halo */}
        <section id="meet" aria-labelledby="meet-title" className={`${wrap} pt-28 pb-24 sm:pt-36`}>
          <Reveal>
            <Eyebrow>Vantage Vision Halo</Eyebrow>
            <h2 id="meet-title" className="font-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] tracking-[-0.035em] text-balance">
              Meet the Halo.
            </h2>
            <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <p className="max-w-xl text-xl text-pretty text-muted sm:text-2xl">
                AI-powered spatial awareness for blind and low‑vision people.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#contact" className="rounded-full bg-amber px-6 py-3.5 sm:px-7 font-medium text-bg transition-opacity hover:opacity-90">
                  Get in touch
                </a>
                <a href="#how-it-works" className="rounded-full border border-line-strong px-6 py-3.5 sm:px-7 font-medium transition-colors hover:bg-surface">
                  How it works
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal className="mt-14 sm:mt-20">
            <LoopVideo
              name="halo-loop"
              poster={haloPoster}
              alt="The Vantage Vision Halo worn on a head: a slim band with sensors across the front and pads resting over the ears."
              label="product animation"
              sizes="(min-width: 1280px) 1216px, 100vw"
              parallax
              className="aspect-[4/3] rounded-[28px] border border-line bg-stage sm:aspect-[16/9]"
            />
          </Reveal>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-title" id="how-it-works" className={`${wrap} py-24 sm:py-32`}>
          <SectionHead
            id="how-title"
            eyebrow="How it works"
            title="A white cane maps the ground. Vantage maps what’s above it."
            lead="Head-height obstacles, drop-offs, signs and routes, translated into sound and touch."
          />
          <ol className="mt-16 space-y-20 sm:mt-24 sm:space-y-28">
            {steps.map((s, i) => (
              <li key={s.clip}>
                <Reveal className="grid items-center gap-8 md:grid-cols-12 md:gap-12">
                  <div className={`md:col-span-7 ${i % 2 ? "md:order-2" : ""}`}>
                    <div className="rounded-[26px] p-2 sm:p-2.5" style={{ backgroundColor: s.frame }}>
                      <LoopVideo
                        name={s.clip}
                        poster={s.poster}
                        alt={s.alt}
                        label={`animation: ${s.title.toLowerCase()}`}
                        sizes="(min-width: 768px) 58vw, 100vw"
                        className="aspect-[16/9] rounded-[18px]"
                      />
                    </div>
                  </div>
                  <div className={`md:col-span-5 ${i % 2 ? "md:order-1" : ""}`}>
                    <p className="font-display text-sm text-amber tabular-nums" aria-hidden="true">0{i + 1}</p>
                    <h3 className="mt-3 font-display text-3xl tracking-[-0.015em] sm:text-4xl">{s.title}</h3>
                    <p className="mt-4 max-w-md text-lg text-muted">{s.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        {/* Hardware */}
        <section aria-labelledby="hardware-title" id="hardware" className={`${wrap} py-24 sm:py-32`}>
          <SectionHead
            id="hardware-title"
            eyebrow="Hardware"
            title="Split-pack design."
            lead="Sensors sit on the halo. Compute sits in a separate pack at the back of the head, so the band stays light and balanced."
          />
          <Reveal className="mt-14 sm:mt-20">
            <Showcase3D />
          </Reveal>
          <Reveal className="mt-6 rounded-[28px] border border-line bg-surface p-7 sm:p-10">
            <h3 className="font-display text-2xl">What’s on board</h3>
            <dl className="mt-4 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
              {hardware.map((h) => (
                <div key={h.name} className="border-t border-line py-5">
                  <dt className="font-medium">{h.name}</dt>
                  <dd className="mt-1 text-muted">{h.body}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </section>

        {/* Partners */}
        <section aria-labelledby="partners-title" id="partners" className="border-t border-line py-24 sm:py-32">
          <div className={wrap}>
            <SectionHead id="partners-title" eyebrow="Partners" title="Built with the people it’s for." />
            <Reveal className="mt-14 grid overflow-hidden rounded-[28px] border border-line bg-surface sm:mt-20 lg:grid-cols-2">
              <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[28rem]">
                <Image
                  src={alNoor}
                  alt="A Vantage team member fits a Halo prototype on a student during a trial at Al Noor Centre."
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  placeholder="blur"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-center p-7 sm:p-12">
                <p className="text-sm font-medium tracking-[0.16em] text-amber uppercase">Co-creation partner</p>
                <h3 className="mt-4 font-display text-3xl tracking-[-0.015em]">Al Noor Centre for Research, Innovation &amp; Development</h3>
                <p className="mt-5 text-lg text-muted">
                  Under a signed memorandum of collaboration, specialist mobility therapists vet the ergonomics and haptics, and students test the Halo in ongoing trials.
                </p>
              </div>
            </Reveal>

            <ul className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {credits.map((c, i) => (
                <li key={c.org}>
                  <Reveal delay={i * 0.08} className="h-full rounded-[24px] border border-line bg-surface p-2.5">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[16px]">
                      <Image src={c.img} alt={c.alt} sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw" placeholder="blur" fill className={`object-cover ${c.pos}`} />
                    </div>
                    <div className="px-4 pt-5 pb-4">
                      <h3 className="font-display text-xl">{c.org}</h3>
                      <p className="mt-1 text-muted">{c.note}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section aria-labelledby="contact-title" id="contact" className={`${wrap} pb-24 sm:pb-32`}>
          <Reveal className="rounded-[32px] border border-line bg-surface px-7 py-14 sm:px-14 sm:py-20">
            <Eyebrow>Get in touch</Eyebrow>
            <h2 id="contact-title" className="max-w-3xl font-display text-4xl leading-[1.05] tracking-[-0.02em] text-balance sm:text-6xl">
              Bring Vantage to more people.
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-muted sm:text-xl">
              We’re looking for partners, researchers and investors to take the Halo further.
            </p>
            <a
              href={`mailto:${EMAIL}?subject=Vantage%20Vision%20Halo`}
              className="mt-10 inline-block rounded-full bg-amber px-8 py-4 text-lg font-medium text-bg transition-opacity hover:opacity-90"
            >
              Email the team
            </a>

            <address className="mt-14 grid gap-8 border-t border-line pt-10 not-italic sm:grid-cols-3">
              <div>
                <p className="font-medium">Dev Bhodia</p>
                <p className="text-muted">Founder</p>
                <a href="tel:+971557857806" className="mt-2 inline-block underline decoration-line-strong underline-offset-4 hover:decoration-amber">
                  +971 55 785 7806
                </a>
              </div>
              <div>
                <p className="font-medium">Joshua Koshy</p>
                <p className="text-muted">Co-founder</p>
                <a href="tel:+971509970129" className="mt-2 inline-block underline decoration-line-strong underline-offset-4 hover:decoration-amber">
                  +971 50 997 0129
                </a>
              </div>
              <div>
                <p className="font-medium">Location</p>
                <p className="text-muted">University of Wollongong Dubai, Knowledge Park, Dubai, UAE</p>
              </div>
            </address>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className={`${wrap} flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between`}>
          <p className="flex items-center gap-3">
            <Image src={logo} alt="" width={34} height={16} />
            <span className="font-display">Vantage</span>
          </p>
          <p className="text-muted">
            © 2026 Vantage · Dubai, UAE ·{" "}
            <a href={`mailto:${EMAIL}`} className="underline decoration-line-strong underline-offset-4 hover:text-fg hover:decoration-amber">
              {EMAIL}
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
