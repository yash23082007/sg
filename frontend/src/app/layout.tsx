import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
