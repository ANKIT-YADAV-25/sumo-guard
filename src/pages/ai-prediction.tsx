import React, { useState, useEffect } from "react";
import { useGetPredictions } from "@/lib/api";
import { PageHeader } from "@/components/shared";
import {
  Brain, TrendingUp, TrendingDown, Shield,
  Lightbulb, CheckCircle2, ChevronLeft,
  Sparkles, Loader2, AlertCircle, ChevronDown, ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

const RISK_STYLES = {
  critical: { color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/40", badge: "bg-red-500/20 text-red-400 border-red-500/30" },
  high: { color: "#f97316", bg: "bg-orange-500/10", border: "border-orange-500/40", badge: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  moderate: { color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/40", badge: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  low: { color: "#22c55e", bg: "bg-[#064e3b]/40", border: "border-[#10b981]/40", badge: "bg-[#064e3b] text-[#4ade80] border-[#10b981]/40" },
};

function DiseaseCard({ disease, idx, defaultExpandedView }: { disease: any; idx: number; defaultExpandedView: "factor" | "tip" | null }) {
  const style = RISK_STYLES[disease.riskLevel as keyof typeof RISK_STYLES] || RISK_STYLES.low;

  return (
    <div className={`rounded-xl border ${style.border} overflow-hidden mb-2 transition-all duration-300`}>
      <div className={`p-4 ${style.bg}`}>
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-white text-sm">{disease.diseaseName}</h4>
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${style.badge}`}>
            {disease.riskLevel}
          </span>
        </div>
      </div>

      {defaultExpandedView && (
        <div className="p-4 border-t border-white/5">
          <div className="grid grid-cols-1 gap-4">
            {defaultExpandedView === "tip" && (
              <div>
                <p className="text-[10px] flex items-center gap-1.5 font-black uppercase tracking-widest text-teal-400 mb-2">
                  <Lightbulb size={12} /> Improvement Tips
                </p>
                <div className="space-y-1.5 pl-1">
                  {disease.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-[10px] text-white/50 leading-relaxed italic">
                      <div className="w-1 h-1 rounded-full bg-teal-400/50 mt-1.5 shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {defaultExpandedView === "factor" && (
              <div>
                <p className="text-[10px] flex items-center gap-1.5 font-black uppercase tracking-widest text-amber-400 mb-2">
                  <Shield size={12} /> Contributing Factors
                </p>
                <div className="space-y-1.5 pl-1">
                  {disease.contributingFactors.slice(0, 3).map((f: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-[10px] text-white/50 leading-relaxed">
                      <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: style.color }} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AIPrediction() {
  const { data: predictions, isLoading: apiLoading } = useGetPredictions();
  const [view, setView] = useState<"factor" | "tip" | null>(null);

  if (apiLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0f1a]">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const score = predictions?.overallHealthScore ?? 0;
  const scoreColor = "#22c55e";
  const diseases = predictions?.diseases ?? [];

  return (
    <div className="space-y-6 pb-24 bg-[#0a0f1a] min-h-screen px-4">
      {/* Simplified Header */}
      <div className="pt-4 flex items-center gap-3">
        <Link href="/risk-analysis">
          <ChevronLeft size={24} className="text-white/60" />
        </Link>
        <h1 className="text-2xl font-black text-white tracking-tight">AI Prediction</h1>
      </div>

      {/* Simplified Health Score Card */}
      <div className="rounded-2xl p-5 border border-white/5 flex items-center gap-6 bg-slate-900/40">
        <div className="relative shrink-0 w-20 h-20">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="35" fill="none"
              stroke={scoreColor} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 35}`}
              strokeDashoffset={`${2 * Math.PI * 35 * (1 - score / 100)}`}
              transform="rotate(-90 40 40)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-black text-xl text-white leading-none">{score}</span>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-black text-white leading-tight mb-1">Overall Health Score</h3>
          <p className="text-xs text-white/30 leading-relaxed">
            Your current status is based on habit logging and sleep consistency.
          </p>
        </div>
      </div>

      {/* Toggle Bar */}
      <div className="flex p-1 rounded-xl border border-white/5 bg-[#0f172a]">
        <button
          onClick={() => setView(view === "factor" ? null : "factor")}
          className="flex-1 py-2.5 text-[11px] font-black rounded-xl transition-all uppercase tracking-widest"
          style={view === "factor"
            ? {
              background: "linear-gradient(135deg, #f59e0b, #f97316)",
              color: "#0f172a",
              boxShadow: "0 0 15px rgba(245,158,11,0.3)"
            }
            : { color: "rgba(255,255,255,0.2)" }
          }
        >
          SHOW FACTOR
        </button>
        <button
          onClick={() => setView(view === "tip" ? null : "tip")}
          className="flex-1 py-2.5 text-[11px] font-black rounded-xl transition-all uppercase tracking-widest"
          style={view === "tip"
            ? {
              background: "linear-gradient(135deg, #f59e0b, #f97316)",
              color: "#0f172a",
              boxShadow: "0 0 15px rgba(245,158,11,0.3)"
            }
            : { color: "rgba(255,255,255,0.2)" }
          }
        >
          TIP
        </button>
      </div>

      {/* Disease List */}
      <div className="space-y-6">
        {predictions?.dataInsufficient ? (
          <div className="rounded-3xl py-12 border border-dashed border-white/10 bg-slate-900/20 flex items-center justify-center mt-4">
            <p className="text-white/40 font-bold text-sm tracking-tight">Insufficient data for AI predictions</p>
          </div>
        ) : view === null ? (
          <>
            <div className="flex items-center gap-2 px-1 mb-3">
              <Brain size={14} className="text-amber-400" />
              <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">Detailed Breakdown</h3>
            </div>
            <div className="space-y-1">
              {diseases.slice(0, 7).map((disease, idx) => (
                <DiseaseCard key={idx} disease={disease} idx={idx} defaultExpandedView={null} />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-[#0a0f1a] p-5">
            <div className="border-b border-white/5 pb-4 mb-5">
              <div className="flex items-center gap-2">
                {view === "tip" ? <Lightbulb size={14} className="text-teal-400" /> : <Shield size={14} className="text-amber-400" />}
                <h3 className={`text-xs font-black uppercase tracking-widest ${view === "tip" ? "text-teal-400" : "text-amber-400"}`}>
                  {view === "tip" ? "Improvement Tips Overview" : "Contributing Factors Overview"}
                </h3>
              </div>
            </div>

            <div className="space-y-8">
              {diseases.slice(0, 7).map((disease, idx) => {
                const style = RISK_STYLES[disease.riskLevel as keyof typeof RISK_STYLES] || RISK_STYLES.low;
                return (
                  <div key={idx}>
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="font-bold text-white text-[15px]">{disease.diseaseName}</h4>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${style.badge}`}>
                        {disease.riskLevel}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {view === "tip" ? (
                        disease.recommendations.map((rec: string, i: number) => (
                          <div key={i} className="flex items-start gap-2.5 text-sm text-[#cbd5e1]">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" />
                            <span className="leading-relaxed">{rec}</span>
                          </div>
                        ))
                      ) : (
                        disease.contributingFactors.map((f: string, i: number) => (
                          <div key={i} className="flex items-start gap-2.5 text-sm text-[#cbd5e1]">
                            <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: style.color }} />
                            <span className="leading-relaxed">{f}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
