import React, { useState } from "react";
import { useGetDashboard, useGetPredictions, useGetSleepLogs, useGetHabitLogs } from "@/lib/api";
import { PageHeader } from "@/components/shared";
import { 
  Shield, Activity, TrendingUp, AlertTriangle, 
  ChevronRight, Brain, Lightbulb, CheckCircle2,
  Clock, Moon, Zap, Droplets, ArrowRight,
  TrendingDown, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { Link } from "wouter";

const RISK_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  moderate: "#f59e0b",
  low: "#22c55e",
};

const RISK_BG: Record<string, string> = {
  critical: "rgba(239,68,68,0.1)",
  high: "rgba(249,115,22,0.1)",
  moderate: "rgba(245,158,11,0.08)",
  low: "rgba(34,197,94,0.08)",
};

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 p-2.5 text-xs bg-slate-900/90 backdrop-blur-md">
        <p className="text-white/50 font-bold mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-bold">
            {p.name}: {p.value}{p.unit || ""}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function RiskAnalysis() {
  const { data: predictions, isLoading: predLoading } = useGetPredictions();
  const { data: sleeps, isLoading: sleepLoading } = useGetSleepLogs();
  const { data: habits, isLoading: habitLoading } = useGetHabitLogs();

  const isLoading = predLoading || sleepLoading || habitLoading;
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const score = predictions?.overallHealthScore ?? 0;
  const diseases = predictions?.diseases ?? [];
  const scoreColor = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const scoreLabel = score >= 75 ? "Excellent" : score >= 50 ? "Moderate" : "High Risk";

  // Prepare trend data (last 7 logs)
  const trendData = habits?.slice(0, 7).reverse().map(h => ({
    date: format(new Date(h.date), "MMM d"),
    exercise: h.exerciseMinutes,
    stress: h.stressLevel * 10, // Scale for comparison
  })) || [];

  // Combine recent logs for activity log
  const recentActivities = [
    ...(sleeps?.slice(0, 5).map(s => ({ ...s, type: 'sleep', icon: <Moon size={14} className="text-indigo-400" />, color: 'indigo' })) || []),
    ...(habits?.slice(0, 5).map(h => ({ ...h, type: 'habit', icon: <Activity size={14} className="text-emerald-400" />, color: 'emerald' })) || [])
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  const forecastData = [
    { label: "Now", score: score },
    { label: "3m", score: Math.min(100, Math.round(score * 1.05)) },
    { label: "6m", score: Math.min(100, Math.round(score * 1.10)) },
    { label: "9m", score: Math.min(100, Math.round(score * 1.15)) },
    { label: "12m", score: Math.min(100, Math.round(score * 1.20)) },
  ];

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Risk Analysis" description="Deep dive into your health fortress" />

      {/* Main Risk Score Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 border relative overflow-hidden"
        style={{ 
          background: "linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(10,15,30,0.95) 100%)",
          borderColor: `${scoreColor}30`,
          boxShadow: `0 0 40px ${scoreColor}10`
        }}
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Shield size={120} strokeWidth={1} style={{ color: scoreColor }} />
        </div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="relative w-32 h-32 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <circle
                cx="64" cy="64" r="56" fill="none"
                stroke={scoreColor} strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 351.8} 351.8`}
                style={{ filter: `drop-shadow(0 0 12px ${scoreColor}60)`, transition: "stroke-dasharray 1.5s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white leading-none">{score}</span>
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Score</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={16} style={{ color: scoreColor }} />
              <span className="text-xs font-black uppercase tracking-widest text-white/50">Overall Safety</span>
            </div>
            <h3 className="text-2xl font-black text-white leading-tight mb-2">{scoreLabel}</h3>
            <p className="text-xs text-white/40 leading-relaxed max-w-xs">
              {predictions?.summary || "Log more data to get a detailed health summary and risk analysis."}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Critical Alerts */}
      {diseases.filter(d => d.riskScore > 40).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-black text-white/40 uppercase tracking-wider px-1 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            Critical Alerts
          </h4>
          <div className="space-y-2.5">
            {diseases.filter(d => d.riskScore > 40).map((d, i) => (
              <div key={i} className="rounded-2xl border p-4 flex items-center justify-between"
                style={{ background: RISK_BG[d.riskLevel], borderColor: `${RISK_COLORS[d.riskLevel]}30` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${RISK_COLORS[d.riskLevel]}20` }}>
                    <Activity size={18} style={{ color: RISK_COLORS[d.riskLevel] }} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{d.diseaseName}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: RISK_COLORS[d.riskLevel] }}>
                      {d.riskLevel} Risk • {d.riskScore}%
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-white/20" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Trends Chart */}
      <div className="rounded-3xl p-5 border border-white/5 bg-slate-900/40">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xs font-black text-white/40 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-400" />
            Health Trends
          </h4>
          <div className="flex gap-3">
            <span className="flex items-center gap-1 text-[10px] font-bold text-white/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Exercise
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-white/30">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Stress
            </span>
          </div>
        </div>
        <div className="h-[180px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorEx" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9 }} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="exercise" name="Exercise" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEx)" />
              <Area type="monotone" dataKey="stress" name="Stress Level" stroke="#f59e0b" strokeWidth={2} fillOpacity={0} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-white/40 uppercase tracking-wider px-1 flex items-center gap-2">
          <Clock size={14} className="text-indigo-400" />
          Recent Activity Logs
        </h4>
        <div className="rounded-3xl border border-white/5 bg-slate-900/40 divide-y divide-white/5 overflow-hidden">
          {recentActivities.map((act: any, i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${act.color}-500/10`}>
                  {act.icon}
                </div>
                <div>
                  <p className="text-sm font-black text-white">
                    {act.type === 'sleep' ? `${act.durationHours}h Sleep Session` : `${act.exerciseMinutes}m Exercise`}
                  </p>
                  <p className="text-[10px] text-white/30 font-medium">{format(new Date(act.date), "EEEE, MMM d")}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-white/60">
                  {act.type === 'sleep' ? act.quality : `${act.waterGlasses}g Water`}
                </p>
                <p className="text-[9px] text-white/20 font-bold uppercase tracking-tighter">Verified</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Prediction Section */}
      <div className="pt-2">
        <Link href="/ai-prediction">
          <button 
            className="w-full py-5 rounded-3xl font-black text-slate-900 flex items-center justify-center transition-all duration-300 active:scale-[0.98]"
            style={{ 
              background: "#f97316",
              boxShadow: "0 4px 15px rgba(249,115,22,0.2)"
            }}
          >
            AI Prediction
          </button>
        </Link>
      </div>
    </div>
  );
}
