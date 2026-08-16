/**
 * @file page.tsx
 * @description Candidate authentication & sign-in page (`/login`).
 * 
 * Aesthetic Manifesto:
 * - Monochromatic dark canvas with sharp 1px border cards.
 * - Monospace credentials input and electric blue accent controls.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Terminal } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("staff.engineer@skillgap.dev");
  const [password, setPassword] = useState("skillgap123");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Authenticate and route directly to Cockpit
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-between items-center p-6 text-neutral-200 font-sans">
      {/* Top Header */}
      <header className="w-full max-w-5xl flex items-center justify-between py-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          <span className="font-mono text-sm font-bold tracking-widest text-white uppercase">
            SKILLGAP<span className="text-blue-500">.IO</span>
          </span>
        </Link>
        <span className="font-mono text-[10px] text-neutral-500 uppercase">AUTHENTICATION GATE</span>
      </header>

      {/* Auth Card */}
      <main className="w-full max-w-md border border-white/10 bg-[#0d0d0d] p-8 space-y-6 animate-fade-in-up">
        <div className="space-y-1 text-center">
          <div className="inline-flex items-center justify-center p-2.5 border border-white/10 bg-white/[0.02] text-blue-400 mb-2">
            <Terminal className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-white font-sans">
            AUTHENTICATE SESSION
          </h1>
          <p className="text-xs font-mono text-neutral-400">
            ENTER CREDENTIALS TO ACCESS YOUR CAREER COCKPIT
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-neutral-400 tracking-wider">CANDIDATE EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase text-neutral-400 tracking-wider">PASSWORD TOKEN</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider transition-[background-color,transform] duration-150 active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          >
            {isLoading ? "AUTHENTICATING..." : "ENTER COCKPIT"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-neutral-500">
          <span>NO CANDIDATE SPEC YET?</span>
          <Link href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
            INITIALIZE RECORD &rarr;
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="font-mono text-[10px] text-neutral-600">
        ENCRYPTED VIA PBKDF2-HMAC-SHA256 • ZERO THIRD-PARTY TRACKING
      </footer>
    </div>
  );
}
