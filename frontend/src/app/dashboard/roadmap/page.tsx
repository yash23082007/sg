"use client";

import { useEffect, useState } from "react";
import { fetchRoadmap } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import type { RoadmapStep } from "@/types";
import {
  CheckCircle2,
  CircleDot,
  Lock,
  GitCommit,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function RoadmapPage() {
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRoadmap().then((res) => {
      setSteps(res);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 font-mono text-xs text-neutral-500 animate-pulse">
        CALCULATING TOPOLOGICAL SORT ORDER OF PREREQUISITES...
      </div>
    );
  }

  const completedCount = steps.filter((s) => s.status === "completed").length;
  const totalHours = steps.reduce((acc, curr) => acc + curr.estimated_hours, 0);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16 animate-fade-in-up">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase font-sans">
            EXECUTION ROADMAP
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            STRICT PREREQUISITE-RESOLVED DAG TIMELINE &bull; {completedCount} OF {steps.length} STAGES CLEARED
          </p>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="p-2 border border-white/10 bg-[#0d0d0d]">
            <span className="text-neutral-500 block text-[10px]">TOTAL EFFORT</span>
            <span className="text-white font-bold">{totalHours} HOURS</span>
          </div>
        </div>
      </div>

      {/* Vertical DAG Timeline */}
      <div className="relative pl-6 md:pl-10 space-y-8">
        {/* Continuous 1px Vertical Timeline Bar */}
        <div className="absolute left-[11px] md:left-[19px] top-4 bottom-4 w-[1px] bg-white/10" />

        {steps.map((step, idx) => {
          const isCompleted = step.status === "completed";
          const isCurrent = step.status === "current";
          const isLocked = step.status === "locked";

          return (
            <div
              key={step.id}
              className={`relative flex items-start gap-4 md:gap-6 group animate-fade-in-up`}
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* Timeline Node Indicator */}
              <div className="relative z-10 shrink-0 mt-1">
                {isCompleted ? (
                  <div className="w-6 h-6 border border-emerald-500 bg-emerald-950 text-emerald-400 flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                ) : isCurrent ? (
                  <div className="relative w-6 h-6 border border-blue-500 bg-blue-950 text-blue-400 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.6)]">
                    <CircleDot className="w-3.5 h-3.5 animate-pulse" />
                    <span className="absolute inset-0 border border-blue-400 animate-pulse-ring" />
                  </div>
                ) : (
                  <div className="w-6 h-6 border border-white/10 bg-[#0d0d0d] text-neutral-600 flex items-center justify-center">
                    <Lock className="w-3 h-3" />
                  </div>
                )}
              </div>

              {/* Step Card Content */}
              <div
                className={`flex-1 p-5 border transition-all duration-150 ${
                  isCurrent
                    ? "border-blue-500/50 bg-[#0e131f]"
                    : isCompleted
                    ? "border-white/10 bg-[#0d0d0d]/80 opacity-80"
                    : "border-white/5 bg-[#0a0a0a] opacity-60 hover:opacity-100 hover:border-white/10"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-neutral-500">
                      #{step.order.toString().padStart(2, "0")}
                    </span>
                    <h3 className="font-sans text-base font-bold text-white tracking-tight">
                      {step.skill_name}
                    </h3>
                    <Badge variant="neutral" size="sm">
                      {step.category}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="flex items-center gap-1 text-neutral-400">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      {step.estimated_hours}h
                    </span>
                    <Badge
                      variant={
                        isCompleted ? "mastered" : isCurrent ? "info" : "neutral"
                      }
                      size="sm"
                    >
                      {step.status}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 font-sans leading-relaxed mb-4">
                  {step.description}
                </p>

                {/* Prerequisites DAG Tags */}
                {step.prerequisites.length > 0 && (
                  <div className="flex items-center gap-2 pt-3 border-t border-white/5 font-mono text-[10px]">
                    <span className="text-neutral-500 flex items-center gap-1">
                      <GitCommit className="w-3 h-3" /> PREREQUISITES:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {step.prerequisites.map((req) => (
                        <span
                          key={req}
                          className="px-1.5 py-0.5 border border-white/10 bg-white/[0.02] text-neutral-300"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
