"use client";

import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TrendingUp, BarChart2, Zap, ArrowUpRight } from "lucide-react";

interface MarketItem {
  skill: string;
  category: string;
  demandIndex: number; // 0-100
  quarterlyGrowth: string;
  avgComp: string;
  urgency: "high" | "critical" | "steady";
}

const MARKET_DATA: MarketItem[] = [
  { skill: "LangChain / RAG Architecture", category: "AI/ML", demandIndex: 96, quarterlyGrowth: "+42%", avgComp: "$195k", urgency: "critical" },
  { skill: "Kubernetes & Cloud Native", category: "DevOps", demandIndex: 91, quarterlyGrowth: "+18%", avgComp: "$180k", urgency: "critical" },
  { skill: "Vector Databases (Pinecone/Chroma)", category: "AI/ML", demandIndex: 89, quarterlyGrowth: "+65%", avgComp: "$190k", urgency: "critical" },
  { skill: "FastAPI Asynchronous Microservices", category: "Backend", demandIndex: 84, quarterlyGrowth: "+24%", avgComp: "$175k", urgency: "high" },
  { skill: "Next.js App Router (SSR)", category: "Frontend", demandIndex: 82, quarterlyGrowth: "+22%", avgComp: "$170k", urgency: "high" },
  { skill: "PostgreSQL & Distributed Sharding", category: "Data", demandIndex: 78, quarterlyGrowth: "+12%", avgComp: "$165k", urgency: "steady" },
];

export default function MarketAnalysisPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-fade-in-up">
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase font-sans">
            MARKET VELOCITY &amp; DEMAND
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            REAL-TIME TECHNICAL ARTIFACT VALUATION MATRIX &bull; GLOBAL METRICS
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="p-2 border border-white/10 bg-[#0d0d0d] text-emerald-400 font-bold">
            SAMPLE SIZE: 14,280 JOBS
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 border border-white/10 bg-[#0d0d0d]">
          <span className="font-mono text-xs text-neutral-400 uppercase">HIGHEST LEVERAGE SKILL</span>
          <div className="text-xl font-bold text-white mt-2">LLM &amp; Vector Embeddings</div>
          <p className="font-mono text-xs text-emerald-400 mt-1">+65% YoY Demand Ingestion</p>
        </div>
        <div className="p-6 border border-white/10 bg-[#0d0d0d]">
          <span className="font-mono text-xs text-neutral-400 uppercase">MEDIAN SALARY ANOMALY</span>
          <div className="text-xl font-bold text-white mt-2">$195,000 / yr</div>
          <p className="font-mono text-xs text-neutral-400 mt-1">Top quartile full stack AI</p>
        </div>
        <div className="p-6 border border-white/10 bg-[#0d0d0d]">
          <span className="font-mono text-xs text-neutral-400 uppercase">DAG COMPLETION MULTIPLIER</span>
          <div className="text-xl font-bold text-blue-400 mt-2">3.4x Interview Rate</div>
          <p className="font-mono text-xs text-neutral-400 mt-1">With 85%+ readiness score</p>
        </div>
      </div>

      <div className="border border-white/10 bg-[#0d0d0d]">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              TECHNICAL COMMODITY VALUATION TABLE
            </h2>
          </div>
          <span className="font-mono text-[10px] text-neutral-500">LIVE FEED</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-mono uppercase text-neutral-500 bg-white/[0.01]">
                <th className="py-3 px-4">TECHNICAL SKILL</th>
                <th className="py-3 px-4">DOMAIN</th>
                <th className="py-3 px-4 w-48">MARKET DEMAND INDEX</th>
                <th className="py-3 px-4 text-right">VELOCITY</th>
                <th className="py-3 px-4 text-right">MEDIAN COMP</th>
                <th className="py-3 px-4 text-center">LEVERAGE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {MARKET_DATA.map((item) => (
                <tr key={item.skill} className="hover:bg-white/[0.02] transition-colors duration-100">
                  <td className="py-3.5 px-4 font-bold text-white">{item.skill}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant="neutral" size="sm">{item.category}</Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <ProgressBar value={item.demandIndex} size="sm" status="mastered" />
                  </td>
                  <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">{item.quarterlyGrowth}</td>
                  <td className="py-3.5 px-4 text-right text-neutral-200">{item.avgComp}</td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge variant={item.urgency === "critical" ? "critical" : "warning"} size="sm">
                      {item.urgency}
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
