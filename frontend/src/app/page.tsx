import Link from "next/link";
import { ArrowRight, Terminal, Cpu, Network, ShieldCheck, Activity } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] flex flex-col justify-between overflow-hidden">
      {/* Subtle architectural background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Bar */}
      <header className="relative z-10 w-full border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          <span className="font-mono text-sm font-bold tracking-widest text-white uppercase">
            SKILLGAP<span className="text-blue-500">.IO</span>
          </span>
          <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 border border-white/10 text-neutral-400">
            ENGINE V1.0
          </span>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="font-mono text-xs text-neutral-400 hover:text-white transition-colors duration-150"
          >
            SYS.STATUS // OK
          </Link>
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 text-xs font-mono border border-blue-500/40 bg-blue-950/20 text-blue-400 hover:bg-blue-900/30 hover:border-blue-500 transition-[background-color,border-color] duration-150 flex items-center gap-1.5"
          >
            ENTER COCKPIT <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-white/10 bg-white/[0.02] mb-8 animate-fade-in-up">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-mono text-xs text-neutral-400 tracking-wider">
            DIRECTED ACYCLIC GRAPH RECOMMENDATION MATRIX
          </span>
        </div>

        {/* Kinetic Hero Typography */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white uppercase select-none leading-none animate-fade-in-up stagger-1">
          SKILL<span className="text-neutral-600">GAP</span>
        </h1>

        <p className="mt-6 text-base md:text-lg text-neutral-400 max-w-2xl font-sans font-light tracking-tight leading-relaxed animate-fade-in-up stagger-2">
          Career architecture computed as a deterministic data structure. Ingest your resume, evaluate against strict DAG skill trees, and execute linear progression paths.
        </p>

        {/* CTA Matrix */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up stagger-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-mono font-medium tracking-wide uppercase bg-blue-600 hover:bg-blue-500 text-white transition-[transform,background-color] duration-150 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            Launch Cockpit <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard/profile"
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-mono tracking-wide uppercase border border-white/10 hover:border-white/30 bg-[#0d0d0d] hover:bg-[#151515] text-neutral-300 hover:text-white transition-colors duration-150 flex items-center justify-center gap-2"
          >
            <Terminal className="w-4 h-4 text-neutral-500" /> Ingest Resume (PDF)
          </Link>
        </div>

        {/* Technical Capabilities Grid */}
        <div className="mt-20 w-full grid grid-cols-1 md:grid-cols-3 border border-white/10 bg-black/40 text-left animate-fade-in-up stagger-4">
          <div className="p-6 border-b md:border-b-0 md:border-r border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Network className="w-4 h-4 text-blue-400" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                DAG Topological Sort
              </h3>
            </div>
            <p className="text-xs text-neutral-400 font-sans leading-normal">
              Resolves upstream skill prerequisites. Zero roadmap hallucinations through strict dependency gating.
            </p>
          </div>

          <div className="p-6 border-b md:border-b-0 md:border-r border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                Deterministic Priority
              </h3>
            </div>
            <p className="text-xs text-neutral-400 font-sans leading-normal">
              Calculates market demand, leverage ratio, and skill delta using Pydantic validated computational pipelines.
            </p>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                High-Density Cockpit
              </h3>
            </div>
            <p className="text-xs text-neutral-400 font-sans leading-normal">
              Zero fluff. Data-dense technical interfaces designed for precision engineering career trajectories.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-neutral-500 font-mono text-xs gap-2">
        <span>ARCHITECTED WITH NEXT.JS 15 • TAILWIND V4 • FASTAPI</span>
        <span>LATENCY: 12ms // BUFFER: ALLOCATED</span>
      </footer>
    </div>
  );
}
