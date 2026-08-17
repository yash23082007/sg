/**
 * @file SkillGraph.tsx
 * @description Interactive visual Directed Acyclic Graph (DAG) tech-tree component.
 */

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Network, CheckCircle2, Lock, GitGraph } from "lucide-react";

export interface SkillNode {
  id: string;
  name: string;
  category: string;
  level: number;
  status: "mastered" | "current" | "locked";
  unlockedBy?: string[];
  unlocked_by?: string[];
  unlocks: string[];
  topological_depth?: number;
}

interface SkillGraphProps {
  nodes?: SkillNode[];
  onSelectNode?: (node: SkillNode) => void;
}

const DEFAULT_NODES: SkillNode[] = [
  { id: "python", name: "Python", category: "Language", level: 88, status: "mastered", unlocks: ["FastAPI", "SQLAlchemy & ORM", "Machine Learning Foundations"] },
  { id: "typescript", name: "TypeScript", category: "Language", level: 82, status: "mastered", unlocks: ["React", "Next.js"] },
  { id: "linux", name: "Linux & Bash", category: "Tooling", level: 85, status: "mastered", unlocks: ["Docker"] },
  { id: "git", name: "Git Architecture", category: "Tooling", level: 80, status: "mastered", unlocks: ["CI/CD Pipelines"] },
  { id: "sql", name: "SQL & Relational Theory", category: "Database", level: 75, status: "current", unlocks: ["PostgreSQL Internals", "SQLAlchemy & ORM"] },
  { id: "fastapi", name: "FastAPI", category: "Framework", level: 65, status: "current", unlockedBy: ["Python"], unlocks: ["Docker", "REST API Design", "Microservices Architecture"] },
  { id: "react", name: "React", category: "Framework", level: 85, status: "mastered", unlockedBy: ["TypeScript"], unlocks: ["Next.js"] },
  { id: "docker", name: "Docker", category: "DevOps", level: 30, status: "current", unlockedBy: ["Linux & Bash", "FastAPI"], unlocks: ["Kubernetes", "CI/CD Pipelines", "Microservices Architecture"] },
  { id: "kubernetes", name: "Kubernetes", category: "DevOps", level: 10, status: "locked", unlockedBy: ["Docker"], unlocks: [] },
  { id: "cicd", name: "CI/CD Pipelines", category: "DevOps", level: 50, status: "current", unlockedBy: ["Docker", "Git Architecture"], unlocks: [] },
  { id: "nextjs", name: "Next.js", category: "Framework", level: 72, status: "current", unlockedBy: ["React", "TypeScript", "Tailwind CSS"], unlocks: [] },
  { id: "ml_foundations", name: "Machine Learning Foundations", category: "AI / ML", level: 35, status: "current", unlockedBy: ["Python"], unlocks: ["LangChain & Agentic AI"] },
  { id: "prompt_eng", name: "Prompt Engineering & Evals", category: "AI / ML", level: 40, status: "current", unlocks: ["LangChain & Agentic AI"] },
  { id: "langchain", name: "LangChain & Agentic AI", category: "AI / ML", level: 20, status: "locked", unlockedBy: ["Machine Learning Foundations", "Prompt Engineering & Evals"], unlocks: ["Vector Databases & RAG"] },
  { id: "vectordb", name: "Vector Databases & RAG", category: "AI / ML", level: 15, status: "locked", unlockedBy: ["LangChain & Agentic AI"], unlocks: [] },
  { id: "microservices", name: "Microservices Architecture", category: "Architecture", level: 30, status: "locked", unlockedBy: ["FastAPI", "Docker"], unlocks: ["System Design", "Event-Driven Architecture"] },
  { id: "system_design", name: "System Design", category: "Architecture", level: 45, status: "locked", unlockedBy: ["Microservices Architecture", "Redis & In-Memory Caching"], unlocks: [] },
];

export function SkillGraph({ nodes = DEFAULT_NODES, onSelectNode }: SkillGraphProps) {
  const activeNodes = nodes && nodes.length > 0 ? nodes : DEFAULT_NODES;
  const [selectedId, setSelectedId] = useState<string>(activeNodes[0]?.id || "python");

  const selectedNode = activeNodes.find((n) => n.id === selectedId) || activeNodes[0];

  const handleSelect = (node: SkillNode) => {
    setSelectedId(node.id);
    if (onSelectNode) onSelectNode(node);
  };

  const prereqList = selectedNode?.unlocked_by || selectedNode?.unlockedBy || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Node Matrix Grid */}
      <div className="lg:col-span-2 border border-white/10 bg-[#0d0d0d] p-6">
        <div className="flex items-center gap-2 mb-6">
          <Network className="w-4 h-4 text-blue-400" />
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
            COMPUTED TOPOLOGY MATRIX
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {nodes.map((node) => {
            const isSelected = selectedNode.id === node.id;
            return (
              <div
                key={node.id}
                onClick={() => handleSelect(node)}
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

      {/* Node Inspector Panel */}
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

          {prereqList.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-mono text-[10px] text-neutral-500 uppercase block">PREREQUISITE UPSTREAM</span>
              <div className="flex flex-wrap gap-1.5">
                {prereqList.map((item) => (
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
  );
}
