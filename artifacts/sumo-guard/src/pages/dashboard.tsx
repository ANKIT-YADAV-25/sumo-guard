import React, { useState } from "react";
import { useGetDashboard, useGetPredictions } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { format, subDays, addDays, parseISO } from "date-fns";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Moon, Zap, Droplets, Brain, ChevronLeft, ChevronRight,
  LogOut, TrendingUp, Heart, AlertTriangle, CheckCircle2,
  ChevronDown, ChevronUp, Lightbulb, Target, Shield, Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const QUALITY_COLORS: Record<string, string> = {
  excellent: "#22c55e",
  good: "#14b8a6",
  fair: "#f59e0b",
  poor: "#ef4444",
};

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

function getWeekDays(centerDate: Date) {
  const day = centerDate.getDay();
  const monday = subDays(centerDate, (day + 6) % 7);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

function DiseaseCard({ disease, index }: { disease: any; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const color = RISK_COLORS[disease.riskLevel] || "#22c55e";
  const bg = RISK_BG[disease.riskLevel] || "rgba(34,197,94,0.08)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: `${color}30`, background: bg }}
    >
      {/* Card header */}
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Risk ring */}
        <div className="relative w-14 h-14 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
            <circle
              cx="28" cy="28" r="24" fill="none"
              stroke={color} strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${(disease.riskScore / 100) * 150.8} 150.8`}
              style={{ filter: `drop-shadow(0 0 5px ${color}80)` }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black" style={{ color }}>{disease.riskScore}%</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-white leading-tight">{disease.diseaseName.split("(")[0].trim()}</p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full capitalize"
              style={{ background: `${color}20`, color }}
            >
              {disease.riskLevel}
            </span>
            <span className="text-[10px] text-white/35 font-medium">{disease.predictedTimeframe}</span>
          </div>
          {/* Mini bar */}
          <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${disease.riskScore}%` }}
              transition={{ duration: 0.8, delay: index * 0.06 + 0.2, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${color}60, ${color})` }}
            />
          </div>
        </div>

        <div className="shrink-0 text-white/30">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
              {/* Contributing factors */}
              {disease.contributingFactors?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertTriangle size={12} style={{ color }} />
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-wider">Risk Factors</span>
                  </div>
                  <div className="space-y-1.5">
                    {disease.contributingFactors.map((f: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: color }} />
                        <p className="text-xs text-white/50 font-medium leading-relaxed">{f}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Solutions */}
              {disease.recommendations?.length > 0 && (
                <div className="rounded-xl p-3 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Lightbulb size={12} className="text-amber-400" />
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">How to Lower Your Risk</span>
                  </div>
                  <div className="space-y-2">
                    {disease.recommendations.map((r: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={12} className="text-green-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-white/60 font-medium leading-relaxed">{r}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const weekDays = getWeekDays(parseISO(selectedDate + "T12:00:00"));

  const { data, isLoading } = useGetDashboard({ date: selectedDate });
  const { data: predictions, isLoading: predLoading } = useGetPredictions();

  const todaySleep = data?.selectedDateSleep ?? null;
  const todayHabit = data?.selectedDateHabit ?? null;
  const sleepTrend = data?.sleepTrend ?? [];
  const diseases = predictions?.diseases ?? [];

  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Night Owl" : hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  function shiftWeek(dir: number) {
    const d = parseISO(selectedDate + "T12:00:00");
    setSelectedDate(format(addDays(d, dir * 7), "yyyy-MM-dd"));
  }

  const healthScore = predictions?.overallHealthScore ?? data?.healthScore ?? 0;
  const scoreColor = healthScore >= 70 ? "#22c55e" : healthScore >= 50 ? "#f59e0b" : "#ef4444";
  const scoreLabel = healthScore >= 70 ? "Good Shape" : healthScore >= 50 ? "Moderate Risk" : "High Risk";

  // Radar data for top 5 diseases
  const radarData = diseases.slice(0, 5).map(d => ({
    subject: d.diseaseName.split(" ")[0].replace("(", ""),
    score: d.riskScore,
  }));

  return (
    <div className="space-y-4 pb-2">
      {/* Header */}
      <div
        className="rounded-3xl p-5 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(10,15,30,0.95) 100%)",
          border: "1px solid rgba(245,158,11,0.15)",
          boxShadow: "0 0 40px rgba(245,158,11,0.06)",
        }}
      >
        {/* BG glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${scoreColor}20, transparent)`, filter: "blur(30px)" }} />

        <div className="flex items-start justify-between relative z-10 mb-4">
          <div>
            <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{greeting}</p>
            <h2 className="text-2xl font-black text-white leading-tight mt-0.5">{user?.name || "Guardian"}</h2>
          </div>
          <button onClick={logout} className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <LogOut size={15} className="text-white/40" />
          </button>
        </div>

        {/* Health score — ring + label + radar side by side */}
        <div className="flex items-center gap-4">
          {/* Large ring */}
          <div className="relative w-28 h-28 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 112 112">
              <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle
                cx="56" cy="56" r="48" fill="none"
                stroke={scoreColor} strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(healthScore / 100) * 301.6} 301.6`}
                style={{ filter: `drop-shadow(0 0 8px ${scoreColor}80)`, transition: "stroke-dasharray 1s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white leading-none">{healthScore}</span>
              <span className="text-[10px] text-white/40 font-bold">/100</span>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-base font-black leading-tight" style={{ color: scoreColor }}>{scoreLabel}</p>
            <p className="text-xs text-white/35 font-medium mt-1 leading-relaxed">
              {predictions?.summary?.slice(0, 80)}
              {(predictions?.summary?.length ?? 0) > 80 ? "…" : ""}
            </p>
            {/* Quick pills */}
            <div className="flex gap-2 mt-3">
              {[
                { label: `${data?.avgSleepHours ?? 0}h sleep`, color: "#6366f1" },
                { label: `${data?.avgExerciseMinutes ?? 0}m exercise`, color: "#22c55e" },
              ].map((p) => (
                <span key={p.label} className="text-[10px] font-black px-2.5 py-1 rounded-full border"
                  style={{ background: `${p.color}12`, borderColor: `${p.color}30`, color: p.color }}>
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Radar preview */}
        {radarData.length > 0 && (
          <div className="mt-4 h-[130px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9, fontWeight: "bold" }}
                />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="score" stroke={scoreColor} fill={scoreColor} fillOpacity={0.15} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Week day picker */}
      <div className="rounded-2xl border border-white/8 p-3" style={{ background: "rgba(15,23,42,0.6)" }}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => shiftWeek(-1)} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40">
            <ChevronLeft size={15} />
          </button>
          <p className="text-xs font-black text-white/40 uppercase tracking-wider">
            {format(weekDays[0], "MMM d")} – {format(weekDays[6], "MMM d")}
          </p>
          <button onClick={() => shiftWeek(1)} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40">
            <ChevronRight size={15} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((d, i) => {
            const dStr = format(d, "yyyy-MM-dd");
            const isSelected = dStr === selectedDate;
            const isToday = dStr === format(new Date(), "yyyy-MM-dd");
            const isFuture = d > new Date();
            return (
              <button key={i} onClick={() => !isFuture && setSelectedDate(dStr)} disabled={isFuture}
                className="flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-200 active:scale-95"
                style={isSelected
                  ? { background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 0 15px rgba(245,158,11,0.35)" }
                  : { background: "rgba(255,255,255,0.03)" }}>
                <span className="text-[9px] font-bold uppercase"
                  style={{ color: isSelected ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.3)" }}>
                  {DAY_LETTERS[d.getDay()]}
                </span>
                <span className="text-sm font-black"
                  style={{ color: isSelected ? "#0f172a" : isFuture ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.85)" }}>
                  {d.getDate()}
                </span>
                {isToday && !isSelected && <div className="w-1 h-1 rounded-full bg-amber-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily data */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
        </div>
      ) : todaySleep || todayHabit ? (
        <div className="rounded-2xl border border-white/8 p-4 space-y-3"
          style={{ background: "rgba(15,23,42,0.6)" }}>
          <p className="text-xs font-black text-white/40 uppercase tracking-wider">
            {selectedDate === format(new Date(), "yyyy-MM-dd") ? "Today" : format(parseISO(selectedDate + "T12:00:00"), "EEE, MMM d")}
          </p>

          {todaySleep && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-indigo-500/15"
              style={{ background: "rgba(99,102,241,0.07)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.2)" }}>
                <Moon size={18} className="text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-white">{todaySleep.durationHours}h sleep</p>
                <p className="text-xs text-white/35 font-medium">
                  {format(new Date(todaySleep.bedtime), "HH:mm")} → {format(new Date(todaySleep.wakeTime), "HH:mm")}
                </p>
              </div>
              <span className="text-xs font-black px-2 py-1 rounded-full capitalize"
                style={{ background: `${QUALITY_COLORS[todaySleep.quality]}20`, color: QUALITY_COLORS[todaySleep.quality] }}>
                {todaySleep.quality}
              </span>
            </div>
          )}

          {todayHabit && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: <Zap size={14} />, label: "Exercise", value: `${todayHabit.exerciseMinutes}m`, color: "#22c55e" },
                { icon: <Droplets size={14} />, label: "Water", value: `${todayHabit.waterGlasses}g`, color: "#14b8a6" },
                { icon: <Brain size={14} />, label: "Stress", value: `${todayHabit.stressLevel}/10`, color: "#f59e0b" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-3 border border-white/5 text-center"
                  style={{ background: `${s.color}08` }}>
                  <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
                  <p className="text-sm font-black text-white">{s.value}</p>
                  <p className="text-[9px] text-white/35 font-bold uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 p-5 flex flex-col items-center text-center"
          style={{ background: "rgba(15,23,42,0.3)" }}>
          <Moon className="w-8 h-8 text-white/15 mb-2" />
          <p className="text-white/40 font-bold text-sm">No data for this day</p>
          <div className="flex gap-2 mt-3">
            <Link href="/sleep">
              <button className="px-3 py-1.5 rounded-xl text-xs font-black text-slate-900"
                style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}>Log Sleep</button>
            </Link>
            <Link href="/habits">
              <button className="px-3 py-1.5 rounded-xl text-xs font-bold text-white/50 border border-white/10">Log Habits</button>
            </Link>
          </div>
        </div>
      )}

      {/* FULL Disease Analysis */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(245,158,11,0.15)" }}>
              <Target size={14} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-black text-white">Full Risk Analysis</p>
              <p className="text-[10px] text-white/30 font-medium">Tap a card to see causes + solutions</p>
            </div>
          </div>
          <Link href="/predictions">
            <span className="text-[10px] font-black text-amber-400 border border-amber-500/20 px-2 py-1 rounded-lg"
              style={{ background: "rgba(245,158,11,0.06)" }}>Charts →</span>
          </Link>
        </div>

        {predLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
          </div>
        ) : diseases.length > 0 ? (
          <div className="space-y-2.5">
            {diseases.map((d, i) => (
              <DiseaseCard key={i} disease={d} index={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/8 p-5 text-center" style={{ background: "rgba(15,23,42,0.5)" }}>
            <Activity className="w-8 h-8 text-white/15 mx-auto mb-2" />
            <p className="text-white/40 text-sm font-bold">Log sleep & habits to generate predictions</p>
          </div>
        )}
      </div>
    </div>
  );
}
