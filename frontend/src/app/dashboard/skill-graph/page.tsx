/**
 * @file page.tsx
 * @description Skill Graph & Visual DAG Topology page (`/dashboard/skill-graph`).
 */

"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { SkillGraph, SkillNode } from "@/components/features/SkillGraph";
import { fetchSkillGraph } from "@/lib/api";
import { Activity, Network, ShieldCheck } from "lucide-react";

export default function SkillGraphPage() {
  const [nodes, setNodes] = useState<SkillNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [telemetrySource, setTelemetrySource] = useState<string>("live_dag_engine");
  const [edgeCount, setEdgeCount] = useState<number>(0);

  useEffect(() => {
    async function loadGraph() {
      try {
        setIsLoading(true);
        const data = await fetchSkillGraph();
        if (data && data.nodes) {
          const mappedNodes: SkillNode[] = data.nodes.map((n) => ({
            id: n.id,
            name: n.name,
            category: n.category.charAt(0).toUpperCase() + n.category.slice(1),
            level: n.level,
            status: n.status,
            unlockedBy: n.unlocked_by,
            unlocked_by: n.unlocked_by,
            unlocks: n.unlocks,
            topological_depth: n.topological_depth,
          }));
          setNodes(mappedNodes);
          setTelemetrySource(data.telemetry_source || "live_dag_engine");
          setEdgeCount(data.total_edges || (data.edges ? data.edges.length : 0));
        }
      } catch (err) {
        console.error("Failed to fetch live DAG graph:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadGraph();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-fade-in-up">
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black tracking-tight text-white uppercase font-sans">
              SKILL GRAPH // DAG TOPOLOGY
            </h1>
            <Badge
              variant={telemetrySource === "live_dag_engine" ? "mastered" : "warning"}
              size="sm"
            >
              {telemetrySource === "live_dag_engine" ? "LIVE ENGINE" : "FALLBACK"}
            </Badge>
          </div>
          <p className="text-xs font-mono text-neutral-400">
            DIRECTED ACYCLIC GRAPH PREREQUISITE NETWORK MAP ({nodes.length} NODES // {edgeCount} DIRECTED EDGES)
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
          <Badge variant="mastered" size="sm">MASTERED (≥80%)</Badge>
          <Badge variant="info" size="sm">CURRENT FOCUS</Badge>
          <Badge variant="neutral" size="sm">LOCKED (UNMET PREREQS)</Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 border border-white/10 bg-[#0d0d0d] flex items-center justify-center gap-3 text-neutral-400 font-mono text-sm">
          <Activity className="w-5 h-5 text-blue-400 animate-spin" />
          <span>COMPUTING LIVE TOPOLOGY & PREREQUISITE GATES...</span>
        </div>
      ) : (
        /* Reusable SkillGraph Feature Component with Live Engine Data */
        <SkillGraph nodes={nodes.length > 0 ? nodes : undefined} />
      )}
    </div>
  );
}
