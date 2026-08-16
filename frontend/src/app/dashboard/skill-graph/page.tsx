"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { GitGraph, Network, Sparkles, ArrowRight, CheckCircle2, Lock } from "lucide-react";

interface NodeItem {
  id: string;
  name: string;
  category: string;
  level: number;
  status: "mastered" | "current" | "locked";
  unlockedBy?: string[];
  unlocks: string[];
}

const DAG_NODES: NodeItem[] = [
  { id: "python", name: "Python Core", category: "Language", level: 90, status: "mastered", unlocks: ["fastapi", "ml_foundations"] },
  { id: "typescript", name: "TypeScript", category: "Language", level: 85, status: "mastered", unlocks: ["nextjs"] },
  { id: "fastapi", name: "FastAPI", category: "Framework", level: 65, status: "mastered", unlockedBy: ["python"], unlocks: ["docker", "microservices"] },
  { id: "nextjs", name: "Next.js App Router", category: "Framework", level: 75, status: "mastered", unlockedBy: ["typescript"], unlocks: ["fullstack_systems"] },
  { id: "postgres", name: "PostgreSQL & SQLAlchemy", category: "Database", level: 55, status: "current", unlockedBy: ["python"], unlocks: ["distributed_data"] },
  { id: "docker", name: "Docker Containerization", category: "DevOps", level: 30, status: "locked", unlockedBy: ["fastapi"], unlocks: ["k8s", "cicd"] },
  { id: "k8s", name: "Kubernetes Orchestration", category: "DevOps", level: 10, status: "locked", unlockedBy: ["docker"], unlocks: ["cloud_native"] },
  { id: "langchain", name: "LangChain / LLMs", category: "AI / ML", level: 20, status: "locked", unlockedBy: ["python"], unlocks: ["autonomous_agents"] },
  { id: "vectordb", name: "Vector Databases (RAG)", category: "AI / ML", level: 15, status: "locked", unlockedBy: ["langchain"], unlocks: ["hybrid_retrieval"] },
];

export default function SkillGraphPage() {
  const [selectedNode, setSelectedNode] = useState<NodeItem>(DAG_NODES[0]);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual DAG Node Grid */}
        <div className="lg:col-span-2 border border-white/10 bg-[#0d0d0d] p-6">
          <div className="flex items-center gap-2 mb-6">
            <Network className="w-4 h-4 text-blue-400" />
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              COMPUTED TOPOLOGY MATRIX
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {DAG_NODES.map((node) => {
              const isSelected = selectedNode.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 border cursor-pointer transition-all duration-150 relative ${
                    isSelected
                      ? "border-blue-500 bg-blue-950/20 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                      : "border-white/5 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-neutral-500 uppercase">{node.category}</span>
                    {node.status === "mastered" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : node.status === "current" ? (
                      <span className="w-2 h-2 bg-blue-500 animate-ping rounded-full" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-neutral-600" />
                    )}
                  </div>
                  <h3 className="font-sans font-bold text-sm text-white mb-2">{node.name}</h3>
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-neutral-500">READINESS</span>
                    <span className={node.level >= 80 ? "text-emerald-400 font-bold" : "text-neutral-300"}>
                      {node.level}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Node Inspector Detail Panel */}
        <div className="border border-white/10 bg-[#0d0d0d] p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <GitGraph className="w-4 h-4 text-emerald-400" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              NODE INSPECTOR
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <span className="font-mono text-[10px] text-neutral-500 uppercase block">SELECTED NODE</span>
              <h2 className="text-xl font-black text-white font-sans">{selectedNode.name}</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 border border-white/5 bg-white/[0.01]">
                <span className="text-neutral-500 block text-[10px]">CATEGORY</span>
                <span className="text-white font-medium">{selectedNode.category}</span>
              </div>
              <div className="p-3 border border-white/5 bg-white/[0.01]">
                <span className="text-neutral-500 block text-[10px]">CURRENT LEVEL</span>
                <span className="text-emerald-400 font-bold">{selectedNode.level}%</span>
              </div>
            </div>

            {selectedNode.unlockedBy && (
              <div className="space-y-1.5">
                <span className="font-mono text-[10px] text-neutral-500 uppercase block">PREREQUISITE UPSTREAM</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.unlockedBy.map((item) => (
                    <Badge key={item} variant="neutral" size="sm">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <span className="font-mono text-[10px] text-neutral-500 uppercase block">UNLOCKS DOWNSTREAM</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.unlocks.map((item) => (
                  <Badge key={item} variant="info" size="sm">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
