/**
 * @file layout.tsx
 * @description Next.js 15 App Router root layout.
 * 
 * Typography & Aesthetic Setup:
 * 1. Variable Sans-Serif: Injects Google 'Inter' for prose and structural labels.
 * 2. Monospace: Injects Google 'JetBrains Mono' for all telemetry, numbers, code, and badges.
 * 3. Base Dark Canvas: Enforces `bg-[#0a0a0a]` with neutral-200 text and electric blue selection.
 */

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Google Fonts variable configuration
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// Search Engine & Metadata Optimization
export const metadata: Metadata = {
  title: "SkillGap // Autonomous Career Architecture Engine",
  description:
    "High-density, computable career architecture. Map your resume against Directed Acyclic Graphs of technical proficiencies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-[#0a0a0a] text-neutral-200 antialiased selection:bg-blue-500 selection:text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
