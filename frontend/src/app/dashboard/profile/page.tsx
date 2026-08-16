/**
 * @file page.tsx
 * @description Resume Ingestion & AST Tokenization interface (`/dashboard/profile`).
 */

"use client";

import { useState } from "react";
import { UploadResume } from "@/components/features/UploadResume";
import type { ResumeUploadResponse } from "@/types";
import { UserCheck, Cpu, Sparkles } from "lucide-react";

export default function ProfilePage() {
  const [extractedData, setExtractedData] = useState<ResumeUploadResponse | null>(null);

  const initialKnownSkills = [
    { name: "Python", category: "language", level: 88 },
    { name: "TypeScript", category: "language", level: 82 },
    { name: "FastAPI", category: "framework", level: 65 },
    { name: "Next.js", category: "framework", level: 72 },
    { name: "PostgreSQL", category: "database", level: 55 },
    { name: "GraphQL", category: "framework", level: 78 },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-fade-in-up">
      {/* Page Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-2xl font-black tracking-tight text-white uppercase font-sans">
          RESUME INGESTION &amp; TOKENIZATION
        </h1>
        <p className="text-xs font-mono text-neutral-400 mt-1">
          PARSE UNSTRUCTURED PDF / DOCX / TXT CORPUS &rarr; NORMALIZE INTO DAG SKILL NODES
        </p>
      </div>

      {/* Binary Upload Feature Component */}
      <UploadResume onSuccess={(res) => setExtractedData(res)} />

      {/* Target Spec & Normalization Protocol Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Target Configuration */}
        <div className="p-6 border border-white/10 bg-[#0d0d0d] space-y-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              ACTIVE CANDIDATE SPEC
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">IDENTIFIER</span>
              <span className="text-white font-medium">staff.engineer@skillgap.dev</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">TARGET ARCHITECTURE</span>
              <span className="text-blue-400 font-medium">Full Stack AI Engineer (L6 / Staff)</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">EXTRACTION STRATEGY</span>
              <span className="text-neutral-300">Deterministic AST + 90+ Alias Lexicon</span>
            </div>
          </div>
        </div>

        {/* Normalization Strategy */}
        <div className="p-6 border border-white/10 bg-[#0d0d0d] space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              DAG TOKEN NORMALIZATION
            </h3>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            Uploaded documents are parsed for technical tokens. Aliases like <code className="text-blue-300 font-mono">ReactJS</code>, <code className="text-blue-300 font-mono">React.js</code>, and <code className="text-blue-300 font-mono">React</code> are mapped deterministically to the unique database node <code className="text-emerald-400 font-mono">react</code>.
          </p>

          <div className="p-3 border border-white/5 bg-white/[0.01] font-mono text-[11px] text-neutral-400 space-y-1">
            <div>&bull; ZERO HALLUCINATION POLICY: ON</div>
            <div>&bull; PREREQUISITE TOPOLOGY CHECK: ENABLED</div>
          </div>
        </div>
      </div>

      {/* Currently Verified Skills Node Matrix */}
      <div className="border border-white/10 bg-[#0d0d0d] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              ACTIVE VERIFIED PROFICIENCY MATRIX
            </h3>
          </div>
          <span className="font-mono text-[10px] text-neutral-500">6 VERIFIED NODES</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
          {initialKnownSkills.map((s) => (
            <div
              key={s.name}
              className="p-3 border border-white/5 bg-white/[0.01] flex items-center justify-between hover:border-white/20 transition-colors"
            >
              <div>
                <span className="font-bold text-white block">{s.name}</span>
                <span className="text-[10px] text-neutral-500 uppercase">{s.category}</span>
              </div>
              <span className="text-emerald-400 font-bold text-sm">{s.level}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
