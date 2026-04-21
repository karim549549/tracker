import type { Metadata } from "next";
import {
  Geist_Mono,
  Space_Grotesk,
  Rajdhani,
  Orbitron,
  Josefin_Sans,
  IBM_Plex_Sans,
  Exo_2,
  Oxanium,
  Syne,
} from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const josefinSans = Josefin_Sans({
  variable: "--font-josefin-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const exo2 = Exo_2({
  variable: "--font-exo-2",
  subsets: ["latin"],
});

const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Personal Tracker",
  description: "Personal Kanban task tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVars = [
    geistMono.variable,
    spaceGrotesk.variable,
    rajdhani.variable,
    orbitron.variable,
    josefinSans.variable,
    ibmPlexSans.variable,
    exo2.variable,
    oxanium.variable,
    syne.variable,
  ].join(" ");

  return (
    <html lang="en" className={`${fontVars} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster richColors theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
