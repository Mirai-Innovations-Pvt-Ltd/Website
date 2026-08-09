import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

/* Same three families the prototype loaded from Google Fonts,
   self-hosted at build time via next/font (no runtime request,
   no layout shift). Each is exposed as a CSS variable consumed
   by the design tokens in globals.css. */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mirai Innovations — Interactive kiosks for physical retail",
  description:
    "Mirai builds interactive kiosks that help customers decide in-store — see a garment on yourself before you buy it.",
};

export const viewport: Viewport = {
  themeColor: "#FAFAF9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /* No data-theme attribute on first load: light is the default
     regardless of system preference (per the prototype), and the
     dark override is applied by the toggle button only. */
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetBrainsMono.variable}`}
    >
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
