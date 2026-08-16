/**
 * @file page.tsx
 * @description Skill Graph & Visual DAG Topology page (`/dashboard/skill-graph`).
 */

"use client";

import { Badge } from "@/components/ui/Badge";
import { SkillGraph } from "@/components/features/SkillGraph";

export default function SkillGraphPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-fade-in-up">
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase font-sans">
            SKILL GRAPH // DAG TOPOLOGY
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            DIRECTED ACYCLIC GRAPH PREREQUISITE NETWORK MAP
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
          <Badge variant="mastered" size="sm">MASTERED</Badge>
          <Badge variant="info" size="sm">CURRENT FOCUS</Badge>
          <Badge variant="neutral" size="sm">LOCKED NODE</Badge>
        </div>
      </div>

      {/* Reusable SkillGraph Feature Component */}
      <SkillGraph />
    </div>
  );
}
