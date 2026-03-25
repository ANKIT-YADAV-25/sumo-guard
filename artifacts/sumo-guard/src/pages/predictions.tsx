import React, { useState } from "react";
import { useGetPredictions } from "@workspace/api-client-react";
import { PremiumCard, PageHeader } from "@/components/shared";
import { AlertTriangle, Brain, Shield, ChevronDown, ChevronUp, Clock, Lightbulb } from "lucide-react";
import { Link } from "wouter";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
  RadialBarChart, RadialBar, Legend,
} from "recharts";

const RISK_STYLES = {
  critical: { color: "#ef4444", glow: "rgba(239,68,68,0.4)", bg: "bg-red-500/10", border: "border-red-500/40", badge: "bg-red-500/20 text-red-400 border-red-500/30" },
  high:     { color: "#f97316", glow: "rgba(249,115,22,0.4)", bg: "bg-orange-500/10", border: "border-orange-500/40", badge: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  moderate: { color: "#f59e0b", glow: "rgba(245,158,11,0.4)", bg: "bg-amber-500/10", border: "border-amber-500/40", badge: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  low:      { color: "#22c55e", glow: "rgba(34,197,94,0.4)",  bg: "bg-green-500/10",  border: "border-green-500/40",  badge: "bg-green-500/20 text-green-400 border-green-500/30" },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur border border-white/10 rounded-xl p-3 shadow-xl text-sm">
        <p className="text-white/60 mb-1 font-bold">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-black">
            {p.value}% risk
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const RadarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur border border-amber-500/20 rounded-xl p-3 shadow-xl text-sm">
        <p className="text-white font-black">{payload[0]?.payload?.disease}</p>
        <p className="text-amber-400 font-bold">{payload[0]?.value}% risk</p>
      </div>
    );
  }
  return null;
};

function DiseaseCard({ disease, idx }: { disease: any; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const style = RISK_STYLES[disease.riskLevel as keyof typeof RISK_STYLES] || RISK_STYLES.low;

  return (
    <div
      className={`rounded-2xl border ${style.border} ${style.bg} p-5 transition-all duration-300`}
      style={{ boxShadow: `0 0 20px ${style.glow}20` }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-3">
          <h4 className="font-black text-white text-base leading-tight mb-2">{disease.diseaseName}</h4>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${style.badge}`}>
              {disease.riskLevel} risk
            </span>
            <span className="flex items-center gap-1 text-[10px] text-white/40 font-bold uppercase tracking-wider">
              <Clock size={10} /> {disease.predictedTimeframe}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="font-black text-4xl leading-none" style={{ color: style.color }}>
            {disease.riskScore}
          </span>
          <span className="text-white/40 text-sm font-bold">%</span>
        </div>
      </div>

      {/* Mini radial progress */}
      <div className="w-full bg-slate-800/60 rounded-full h-2.5 mb-4 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${disease.riskScore}%`,
            background: `linear-gradient(90deg, ${style.color}80, ${style.color})`,
            boxShadow: `0 0 10px ${style.glow}`,
          }}
        />
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors font-bold uppercase tracking-wider w-full"
      >
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {expanded ? "Hide" : "Show"} factors & tips
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-white/5 pt-4">
          <div>
            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-2">Contributing Factors</p>
            <div className="space-y-1.5">
              {disease.contributingFactors.map((f: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs text-white/60">
                  <div className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: style.color }} />
                  {f}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-2 flex items-center gap-1">
              <Lightbulb size={10} /> Recommendations
            </p>
            <div className="space-y-1.5">
              {disease.recommendations.map((r: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs text-white/60">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1 shrink-0" />
                  {r}
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
  const [activeChart, setActiveChart] = useState<"radar" | "bar" | "radial">("bar");

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

  // Data for radar chart
  const radarData = diseases.map(d => ({
    disease: d.diseaseName.split(" ")[0],
    risk: d.riskScore,
    fullName: d.diseaseName,
  }));

  // Data for ranked bar chart
  const barData = [...diseases]
    .sort((a, b) => b.riskScore - a.riskScore)
    .map(d => ({
      name: d.diseaseName.split("(")[0].split("/")[0].trim().split(" ").slice(0, 2).join(" "),
      risk: d.riskScore,
      riskLevel: d.riskLevel,
      color: RISK_STYLES[d.riskLevel as keyof typeof RISK_STYLES]?.color || "#22c55e",
    }));

  // Data for radial bar chart
  const radialData = diseases.map((d, i) => ({
    name: d.diseaseName.split(" ")[0],
    value: d.riskScore,
    fill: RISK_STYLES[d.riskLevel as keyof typeof RISK_STYLES]?.color || "#22c55e",
  }));

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

      {/* Chart Toggle */}
      <div className="flex gap-2 bg-slate-900/60 rounded-xl p-1 border border-white/5">
        {(["bar", "radar", "radial"] as const).map(type => (
          <button
            key={type}
            onClick={() => setActiveChart(type)}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-300 ${
              activeChart === type
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 shadow-lg"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {type === "bar" ? "Ranked" : type === "radar" ? "Radar" : "Radial"}
          </button>
        ))}
      </div>

      {/* RANKED BAR CHART */}
      {activeChart === "bar" && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5"
          style={{ boxShadow: "0 0 30px rgba(245,158,11,0.05)" }}>
          <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-5">Risk Score Ranking</p>
          <div style={{ height: barData.length * 52 + 20 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 50, left: 0, bottom: 0 }}>
                <defs>
                  {barData.map((d, i) => (
                    <linearGradient key={i} id={`grad-${i}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={d.color} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={d.color} stopOpacity={1} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: "bold" }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={90}
                  tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "bold" }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="risk" radius={[0, 8, 8, 0]} maxBarSize={28}>
                  <LabelList dataKey="risk" position="right"
                    formatter={(v: number) => `${v}%`}
                    style={{ fill: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 900 }} />
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={`url(#grad-${i})`}
                      style={{ filter: `drop-shadow(0 0 6px ${entry.color}60)` }} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* RADAR CHART */}
      {activeChart === "radar" && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5"
          style={{ boxShadow: "0 0 30px rgba(99,102,241,0.05)" }}>
          <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">Risk Overview</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <defs>
                  <linearGradient id="radarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="disease"
                  tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: "bold" }} />
                <PolarRadiusAxis domain={[0, 100]} axisLine={false} tick={false} />
                <Tooltip content={<RadarTooltip />} />
                <Radar name="Risk" dataKey="risk" stroke="#f59e0b" strokeWidth={2}
                  fill="url(#radarGrad)"
                  style={{ filter: "drop-shadow(0 0 8px rgba(245,158,11,0.5))" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* RADIAL BAR CHART */}
      {activeChart === "radial" && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5"
          style={{ boxShadow: "0 0 30px rgba(20,184,166,0.05)" }}>
          <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">Risk by Disease</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="15%" outerRadius="90%"
                data={radialData}
                startAngle={90} endAngle={-270}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={6}
                  background={{ fill: "rgba(255,255,255,0.03)" }}
                  label={{ position: "insideStart", fill: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: "bold",
                    formatter: (v: number) => `${v}%` }}
                />
                <Legend
                  iconSize={8}
                  iconType="circle"
                  formatter={(value, entry: any) => (
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: "bold" }}>
                      {entry.payload.name}
                    </span>
                  )}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Individual Disease Cards */}
      <div>
        <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
          <Brain size={16} className="text-amber-400" />
          Detailed Breakdown
          <span className="text-xs text-white/30 font-bold">(tap to expand)</span>
        </h3>
        <div className="space-y-4">
          {diseases.map((disease, idx) => (
            <DiseaseCard key={idx} disease={disease} idx={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}
