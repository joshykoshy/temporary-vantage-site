import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/motion";

// Body font is not preloaded: text paints immediately in the metric-matched fallback, leaving
// early bandwidth for the hero image and display font.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], preload: false });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], weight: ["500", "700"] });
const instrumentSerif = Instrument_Serif({ variable: "--font-instrument-serif", subsets: ["latin"], weight: "400", style: "italic" });

const description =
  "Vantage Vision Halo is a head-worn AI wearable that gives blind and low-vision people real-time awareness of the space around them.";

export const metadata: Metadata = {
  metadataBase: new URL("https://vantagevision.ai"),
  title: "Vantage Vision Halo — Navigate with instinct",
  description,
  openGraph: {
    title: "Vantage Vision Halo — Navigate with instinct",
    description,
    url: "/",
    siteName: "Vantage",
    locale: "en_US",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#121110", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${instrumentSerif.variable} antialiased`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
