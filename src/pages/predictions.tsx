import React, { useState } from "react";
import { useGetPredictions } from "@/lib/api";
import { PremiumCard, PageHeader } from "@/components/shared";
import { AlertTriangle, Brain, Shield, ChevronDown, ChevronUp, Clock, Lightbulb } from "lucide-react";
import { Link } from "wouter";


const RISK_STYLES = {
  critical: { color: "#ef4444", glow: "rgba(239,68,68,0.4)", bg: "bg-red-500/10", border: "border-red-500/40", badge: "bg-red-500/20 text-red-400 border-red-500/30" },
  high:     { color: "#f97316", glow: "rgba(249,115,22,0.4)", bg: "bg-orange-500/10", border: "border-orange-500/40", badge: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  moderate: { color: "#f59e0b", glow: "rgba(245,158,11,0.4)", bg: "bg-amber-500/10", border: "border-amber-500/40", badge: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  low:      { color: "#22c55e", glow: "rgba(34,197,94,0.4)",  bg: "bg-green-500/10",  border: "border-green-500/40",  badge: "bg-green-500/20 text-green-400 border-green-500/30" },
};



function DiseaseCard({ disease, idx }: { disease: any; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const style = RISK_STYLES[disease.riskLevel as keyof typeof RISK_STYLES] || RISK_STYLES.low;

  return (
    <div
      className={`rounded-xl border ${style.border} ${style.bg} p-4 transition-all duration-300 cursor-pointer`}
      style={{ boxShadow: `0 0 15px ${style.glow}15` }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex justify-between items-center">
        <h4 className="font-black text-white text-sm">{disease.diseaseName}</h4>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${style.badge}`}>
            {disease.riskLevel} risk
          </span>
          {expanded ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4 cursor-default" onClick={e => e.stopPropagation()}>
          {/* First Column: Tips */}
          <div>
            <p className="text-[10px] flex items-center gap-1.5 font-black uppercase tracking-widest text-amber-400 mb-2">
              <Lightbulb size={12} /> Improvement Tips
            </p>
            <div className="space-y-1.5">
              {disease.recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex items-start gap-2 text-[10px] text-white/60 leading-relaxed italic">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50 mt-1 shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Second Column: Factors */}
          <div>
            <p className="text-[10px] flex items-center gap-1.5 font-black uppercase tracking-widest text-[#f97316] mb-2">
              <AlertTriangle size={12} /> Show Factors
            </p>
            <div className="space-y-1.5">
              {disease.contributingFactors.map((f: string, index: number) => (
                <div key={index} className="flex items-start gap-2 text-[10px] text-white/60 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: style.color }} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Predictions() {
  const { data: predictions, isLoading, error } = useGetPredictions();
  const [view, setView] = useState<"factor" | "tip" | null>(null);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"
          style={{ boxShadow: "0 0 20px rgba(245,158,11,0.4)" }} />
      </div>
    );
  }

  if (error || !predictions) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6">
        <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-black text-white">Analysis Failed</h2>
        <p className="text-white/40 text-sm mt-2">Please try again later</p>
      </div>
    );
  }

  if (predictions.dataInsufficient) {
    return (
      <div className="space-y-6 px-1">
        <PageHeader title="AI Predictions" description="Predictive health analysis" />
        <div className="flex flex-col items-center text-center p-10 rounded-2xl border border-dashed border-white/10 bg-slate-900/40 mt-6">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-6 border border-amber-500/30"
            style={{ background: "radial-gradient(circle, rgba(245,158,11,0.15), transparent)", boxShadow: "0 0 30px rgba(245,158,11,0.15)" }}
          >
            <Brain className="w-12 h-12 text-amber-400" />
          </div>
          <h3 className="text-2xl font-black text-white mb-3">More Data Required</h3>
          <p className="text-white/40 text-sm mb-8 max-w-xs leading-relaxed">
            Log at least 3 days of sleep and habits to unlock AI-powered disease predictions.
          </p>
          <Link href="/sleep">
            <button className="px-8 py-3 rounded-xl font-black text-slate-900 bg-gradient-to-r from-amber-400 to-orange-500"
              style={{ boxShadow: "0 0 20px rgba(245,158,11,0.4)" }}>
              Start Logging Data
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const diseases = predictions.diseases;
  const score = predictions.overallHealthScore;
  const scoreColor = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const scoreGlow = score >= 75 ? "rgba(34,197,94,0.4)" : score >= 50 ? "rgba(245,158,11,0.4)" : "rgba(239,68,68,0.4)";

  return (
    <div className="space-y-6 pb-6">
      <PageHeader title="AI Predictions" description="Disease risk analysis" />

      {/* Overall Health Score */}
      <div
        className="rounded-2xl p-5 border flex items-center gap-5"
        style={{
          background: `radial-gradient(circle at 20% 50%, ${scoreGlow}15, transparent 60%), rgba(15,23,42,0.8)`,
          borderColor: `${scoreColor}40`,
          boxShadow: `0 0 30px ${scoreGlow}20`,
        }}
      >
        <div className="relative shrink-0">
          <svg width="90" height="90" viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle
              cx="45" cy="45" r="38"
              fill="none"
              stroke={scoreColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 38}`}
              strokeDashoffset={`${2 * Math.PI * 38 * (1 - score / 100)}`}
              transform="rotate(-90 45 45)"
              style={{ filter: `drop-shadow(0 0 6px ${scoreColor})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-black text-2xl text-white leading-none">{score}</span>
            <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider">/ 100</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={14} style={{ color: scoreColor }} />
            <span className="text-xs font-black uppercase tracking-widest text-white/50">Health Score</span>
          </div>
          <h3 className="text-lg font-black text-white leading-tight mb-2">
            {score >= 75 ? "Excellent Health" : score >= 50 ? "Moderate Risk" : "High Risk Detected"}
          </h3>
          <p className="text-xs text-white/40 leading-relaxed">{predictions.summary}</p>
        </div>
      </div>

      {/* Toggle View */}
      <div className="flex gap-1 p-1 rounded-2xl border border-white/5" style={{ background: "rgba(15,23,42,0.6)" }}>
        <button
          onClick={() => setView(view === "factor" ? null : "factor")}
          className="flex-1 py-3 text-xs font-black rounded-xl transition-all duration-200 uppercase tracking-widest"
          style={view === "factor" ? { background: "linear-gradient(135deg, #f59e0b, #f97316)", color: "#0f172a", boxShadow: "0 0 12px rgba(245,158,11,0.4)" } : { color: "rgba(255,255,255,0.35)" }}
        >
          Show Factor
        </button>
        <button
          onClick={() => setView(view === "tip" ? null : "tip")}
          className="flex-1 py-3 text-xs font-black rounded-xl transition-all duration-200 uppercase tracking-widest"
          style={view === "tip" ? { background: "linear-gradient(135deg, #f59e0b, #f97316)", color: "#0f172a", boxShadow: "0 0 12px rgba(245,158,11,0.4)" } : { color: "rgba(255,255,255,0.35)" }}
        >
          Tip
        </button>
      </div>

      {/* View Content */}
      {view && (
        <div className="rounded-2xl border border-white/10 p-5 bg-slate-900/40">
          <p className="text-[10px] flex items-center gap-1.5 font-black uppercase tracking-widest text-white/50 mb-5 pb-3 border-b border-white/10">
            {view === "factor" ? <AlertTriangle size={14} className="text-amber-400" /> : <Lightbulb size={14} className="text-teal-400" />}
            {view === "factor" ? "Contributing Factors Overview" : "Improvement Tips Overview"}
          </p>
          <div className="space-y-6">
            {diseases.map((disease, idx) => {
              const style = RISK_STYLES[disease.riskLevel as keyof typeof RISK_STYLES] || RISK_STYLES.low;
              
              // Only show diseases that have at least one factor or tip to display based on the selection
              const hasItems = view === "factor" ? disease.contributingFactors.length > 0 : disease.recommendations.length > 0;
              if (!hasItems) return null;

              return (
                <div key={idx}>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-black text-white">{disease.diseaseName}</h4>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${style.badge}`}>
                      {disease.riskLevel}
                    </span>
                  </div>
                  <div className="space-y-1.5 pl-2">
                    {view === "factor" ? 
                      disease.contributingFactors.map((f: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-white/60">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: style.color }} />
                          <span>{f}</span>
                        </div>
                      ))
                    :
                      disease.recommendations.map((r: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-white/60">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Breakdown */}
      <div>
        <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
          <Brain size={16} className="text-amber-400" />
          Detailed Breakdown
        </h3>
        <div className="space-y-3">
          {diseases.map((disease, idx) => (
            <DiseaseCard key={idx} disease={disease} idx={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}
