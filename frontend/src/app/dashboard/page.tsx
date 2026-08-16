/**
 * @file page.tsx
 * @description The Cockpit — Central telemetry hub and skill gap evaluation dashboard.
 * 
 * Aesthetic & Functional Elements:
 * 1. KPI Telemetry Row: Oversized 54% readiness score, Mastered node count, Critical gap count, and Average score.
 * 2. High-Density Core Skill Gap Matrix: Monospace data table with category badges, custom progress bars,
 *    gap deltas, and computed priority scores [P].
 * 3. Color Logic: Dopamine utility accents (Green for mastered, Rose for critical bottlenecks).
 */

"use client";

import { useEffect, useState } from "react";
import { fetchDashboard } from "@/lib/api";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import type { DashboardData } from "@/types";
import {
  TrendingUp,
  AlertOctagon,
  CheckCircle,
  BarChart3,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ingest telemetry payload from API on mount
  useEffect(() => {
    fetchDashboard().then((res) => {
      setData(res);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64 font-mono text-xs text-neutral-500 animate-pulse">
        COMPUTING DIRECTED ACYCLIC GRAPH MATRICES...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in-up">
      {/* Header Telemetry */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase font-sans">
            THE COCKPIT
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            EVALUATION FOR TARGET SPEC: <strong className="text-white">FULL STACK AI ENGINEER</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/roadmap"
            className="px-4 py-2 border border-blue-500/40 bg-blue-950/20 text-blue-400 hover:bg-blue-900/30 text-xs font-mono uppercase tracking-wider transition-colors duration-150 flex items-center gap-1.5"
          >
            VIEW EXECUTION ROADMAP <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Readiness Core Card */}
        <div className="p-6 border border-white/10 bg-[#0d0d0d] flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-neutral-400">
              OVERALL READINESS
            </span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-4">
            <div className="text-5xl font-mono font-black text-white tracking-tighter">
              {data.overall_readiness}%
            </div>
            <p className="font-mono text-[10px] text-neutral-500 mt-1">
              Topological threshold: 85% required
            </p>
          </div>
          <ProgressBar value={data.overall_readiness} size="md" />
        </div>

        {/* Mastered Node Count */}
        <div className="p-6 border border-white/10 bg-[#0d0d0d] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-neutral-400">
              MASTERED NODES
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-4">
            <div className="text-4xl font-mono font-bold text-emerald-400 tracking-tight">
              {data.mastered_count}
              <span className="text-lg text-neutral-600 font-normal"> / {data.total_skills}</span>
            </div>
            <p className="font-mono text-[10px] text-neutral-500 mt-1">
              Proficiency &ge; 80% with verified AST proof
            </p>
          </div>
          <div className="text-[10px] font-mono text-emerald-500 uppercase">
            STABLE PREREQUISITES
          </div>
        </div>

        {/* Critical Gap Count */}
        <div className="p-6 border border-white/10 bg-[#0d0d0d] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-neutral-400">
              CRITICAL GAPS
            </span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-4">
            <div className="text-4xl font-mono font-bold text-rose-400 tracking-tight">
              {data.critical_count}
            </div>
            <p className="font-mono text-[10px] text-neutral-500 mt-1">
              Blocks downstream architecture deployment
            </p>
          </div>
          <div className="text-[10px] font-mono text-rose-500 uppercase">
            ACTION REQUIRED
          </div>
        </div>

        {/* Average Proficiency */}
        <div className="p-6 border border-white/10 bg-[#0d0d0d] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-neutral-400">
              AVG PROFICIENCY
            </span>
            <BarChart3 className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="my-4">
            <div className="text-4xl font-mono font-bold text-white tracking-tight">
              {data.average_proficiency}%
            </div>
            <p className="font-mono text-[10px] text-neutral-500 mt-1">
              Aggregate normalized score across all axes
            </p>
          </div>
          <ProgressBar value={data.average_proficiency} size="md" status="proficient" />
        </div>
      </div>

      {/* High-Density Core Skill Gaps Table */}
      <div className="border border-white/10 bg-[#0d0d0d]">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              CORE SKILL GAP MATRIX ({data.skill_gaps.length} EVALUATED NODES)
            </h2>
          </div>
          <span className="font-mono text-[10px] text-neutral-500">
            SORTED BY COMPUTED PRIORITY SCORE [P]
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-mono uppercase text-neutral-500 bg-white/[0.01]">
                <th className="py-3 px-4">SKILL NODE</th>
                <th className="py-3 px-4">CATEGORY</th>
                <th className="py-3 px-4 w-56">CURRENT VS TARGET</th>
                <th className="py-3 px-4 text-right">GAP DELTA</th>
                <th className="py-3 px-4 text-right">PRIORITY [P]</th>
                <th className="py-3 px-4 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {data.skill_gaps.map((item) => (
                <tr
                  key={item.skill_id}
                  className="hover:bg-white/[0.02] transition-colors duration-100"
                >
                  {/* Skill Name */}
                  <td className="py-3.5 px-4 font-bold text-white">
                    {item.skill_name}
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <Badge variant="neutral" size="sm">
                      {item.category}
                    </Badge>
                  </td>

                  {/* Progress & Target */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-neutral-400">
                        <span>{item.current_proficiency}%</span>
                        <span className="text-neutral-500">REQ: {item.required_proficiency}%</span>
                      </div>
                      <ProgressBar
                        value={item.current_proficiency}
                        size="sm"
                        status={item.status}
                      />
                    </div>
                  </td>

                  {/* Gap Delta */}
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`font-semibold ${
                        item.gap > 0
                          ? item.gap > 30
                            ? "text-rose-400"
                            : "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {item.gap > 0 ? `-${item.gap}%` : `+${Math.abs(item.gap)}%`}
                    </span>
                  </td>

                  {/* Priority Score */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-bold text-neutral-200">
                      {item.priority_score.toFixed(2)}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <Badge
                      variant={
                        item.status === "mastered"
                          ? "mastered"
                          : item.status === "critical"
                          ? "critical"
                          : item.status === "developing"
                          ? "warning"
                          : "info"
                      }
                      size="sm"
                    >
                      {item.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
