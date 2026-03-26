import React, { useState } from "react";
import { useGetStatistics } from "@workspace/api-client-react";
import { format } from "date-fns";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ReferenceLine,
} from "recharts";
import { Moon, Zap, Droplets, Brain, Cigarette, Wine, TrendingUp, TrendingDown } from "lucide-react";

const PERIODS = [
  { key: "day", label: "7 Days" },
  { key: "week", label: "4 Weeks" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

const QUALITY_COLORS: Record<string, string> = {
  excellent: "#22c55e",
  good: "#14b8a6",
  fair: "#f59e0b",
  poor: "#ef4444",
  none: "#334155",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-white/10 p-3 text-xs"
        style={{ background: "rgba(10,15,30,0.95)", backdropFilter: "blur(10px)" }}>
        <p className="text-white/50 font-bold mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color || p.stroke }} className="font-bold">
            {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}{p.unit || ""}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function StatCard({ icon, label, value, unit, color, glow, trend }: any) {
  return (
    <div className="rounded-2xl border p-4 flex flex-col gap-1"
      style={{ background: `${color}08`, borderColor: `${color}25`, boxShadow: `0 0 20px ${glow}` }}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <div style={{ color }}>{icon}</div>
        </div>
        <span className="text-xs text-white/40 font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-end gap-1 mt-1">
        <span className="text-2xl font-black text-white leading-none">{typeof value === "number" ? value.toFixed(1) : value}</span>
        <span className="text-xs text-white/40 font-bold mb-0.5">{unit}</span>
        {trend !== undefined && (
          <span className={`text-xs font-bold ml-auto ${trend >= 0 ? "text-green-400" : "text-red-400"}`}>
            {trend >= 0 ? <TrendingUp size={12} className="inline" /> : <TrendingDown size={12} className="inline" />}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Statistics() {
  const [period, setPeriod] = useState("month");
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: stats, isLoading } = useGetStatistics({ period, date: today });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"
          style={{ boxShadow: "0 0 20px rgba(245,158,11,0.3)" }} />
      </div>
    );
  }

  const sleepData = stats?.sleepData ?? [];
  const habitData = stats?.habitData ?? [];
  const avgs = stats?.averages;
  const monthly = stats?.monthlyReview ?? [];

  // Quality distribution pie
  const qualityDist = avgs?.sleepQualityDistribution ?? { poor: 0, fair: 0, good: 0, excellent: 0 };
  const pieData = Object.entries(qualityDist).filter(([, v]) => v > 0).map(([k, v]) => ({ name: k, value: v, color: QUALITY_COLORS[k] }));

  // Only show every Nth label for readability
  const tickInterval = sleepData.length > 14 ? Math.ceil(sleepData.length / 7) - 1 : 0;

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h2 className="text-2xl font-black text-white">Statistics</h2>
        <p className="text-xs text-white/40 font-medium mt-0.5">Your health data overview</p>
      </div>

      {/* Period tabs */}
      <div className="flex gap-1.5 bg-slate-900/50 rounded-2xl p-1 border border-white/5">
        {PERIODS.map(p => (
          <button key={p.key} onClick={() => setPeriod(p.key)}
            className="flex-1 py-2 text-xs font-black rounded-xl transition-all duration-200"
            style={period === p.key
              ? { background: "linear-gradient(135deg, #f59e0b, #f97316)", color: "#0f172a", boxShadow: "0 0 12px rgba(245,158,11,0.4)" }
              : { color: "rgba(255,255,255,0.35)" }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Stat cards grid */}
      {avgs && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<Moon size={16} />} label="Avg Sleep" value={avgs.avgSleepHours} unit="hrs" color="#6366f1" glow="rgba(99,102,241,0.08)" />
          <StatCard icon={<Zap size={16} />} label="Exercise" value={avgs.avgExerciseMinutes} unit="min" color="#22c55e" glow="rgba(34,197,94,0.08)" />
          <StatCard icon={<Droplets size={16} />} label="Water" value={avgs.avgWaterGlasses} unit="glasses" color="#14b8a6" glow="rgba(20,184,166,0.08)" />
          <StatCard icon={<Brain size={16} />} label="Stress" value={avgs.avgStressLevel} unit="/ 10" color="#f59e0b" glow="rgba(245,158,11,0.08)" />
          {avgs.avgSmoking > 0 && <StatCard icon={<Cigarette size={16} />} label="Smoking" value={avgs.avgSmoking} unit="cigs/day" color="#ef4444" glow="rgba(239,68,68,0.08)" />}
          {avgs.avgAlcohol > 0 && <StatCard icon={<Wine size={16} />} label="Alcohol" value={avgs.avgAlcohol} unit="drinks/day" color="#a855f7" glow="rgba(168,85,247,0.08)" />}
        </div>
      )}

      {/* Sleep Hours Area Chart */}
      <div className="rounded-2xl border border-white/8 p-4" style={{ background: "rgba(15,23,42,0.7)" }}>
        <p className="text-sm font-black text-white mb-1">Sleep Duration</p>
        <p className="text-xs text-white/30 font-medium mb-4">Hours per night — goal: 7–9h</p>
        <div className="h-[180px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sleepData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} interval={tickInterval}
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: "bold" }} />
              <YAxis domain={[0, 12]} axisLine={false} tickLine={false}
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: "bold" }} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={7} stroke="rgba(34,197,94,0.3)" strokeDasharray="4 4" label={{ value: "7h", fill: "rgba(34,197,94,0.5)", fontSize: 9 }} />
              <ReferenceLine y={9} stroke="rgba(34,197,94,0.3)" strokeDasharray="4 4" label={{ value: "9h", fill: "rgba(34,197,94,0.5)", fontSize: 9 }} />
              <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2.5} fill="url(#sleepGrad)"
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  const color = QUALITY_COLORS[payload.quality] || "#334155";
                  return payload.hours > 0
                    ? <circle key={cx} cx={cx} cy={cy} r={4} fill={color} stroke="#0f172a" strokeWidth={2} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
                    : <g key={cx} />;
                }}
                name="Sleep" unit="h" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* Quality legend */}
        <div className="flex gap-3 mt-3 flex-wrap">
          {Object.entries(QUALITY_COLORS).filter(([k]) => k !== "none").map(([k, c]) => (
            <span key={k} className="flex items-center gap-1 text-[10px] text-white/40 font-bold capitalize">
              <span className="w-2 h-2 rounded-full" style={{ background: c, boxShadow: `0 0 4px ${c}` }} />{k}
            </span>
          ))}
        </div>
      </div>

      {/* Bedtime / Wake pattern */}
      {sleepData.some(d => d.bedtime !== "--:--") && (
        <div className="rounded-2xl border border-white/8 p-4" style={{ background: "rgba(15,23,42,0.7)" }}>
          <p className="text-sm font-black text-white mb-1">Sleep Pattern</p>
          <p className="text-xs text-white/30 font-medium mb-4">Bedtime consistency</p>
          <div className="h-[160px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sleepData.filter(d => d.bedtime !== "--:--")} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} interval={tickInterval}
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: "bold" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: "bold" }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="bedtime" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: "#f59e0b" }} name="Bedtime" />
                <Line type="monotone" dataKey="wakeTime" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3, fill: "#14b8a6" }} name="Wake" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Exercise + Stress bar chart */}
      <div className="rounded-2xl border border-white/8 p-4" style={{ background: "rgba(15,23,42,0.7)" }}>
        <p className="text-sm font-black text-white mb-1">Exercise & Stress</p>
        <p className="text-xs text-white/30 font-medium mb-4">Daily comparison</p>
        <div className="h-[180px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={habitData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="exGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} interval={tickInterval}
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: "bold" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: "bold" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="exerciseMinutes" name="Exercise" fill="url(#exGrad)" radius={[4, 4, 0, 0]} maxBarSize={16} unit="min" />
              <Bar dataKey="stressLevel" name="Stress" fill="url(#stressGrad)" radius={[4, 4, 0, 0]} maxBarSize={16} unit="/10" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sleep quality pie */}
      {pieData.length > 0 && (
        <div className="rounded-2xl border border-white/8 p-4" style={{ background: "rgba(15,23,42,0.7)" }}>
          <p className="text-sm font-black text-white mb-1">Sleep Quality</p>
          <p className="text-xs text-white/30 font-medium mb-4">Distribution for this period</p>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  paddingAngle={3} strokeWidth={0}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} style={{ filter: `drop-shadow(0 0 6px ${entry.color}60)` }} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number, n: string) => [`${v} nights`, n]} contentStyle={{ background: "rgba(10,15,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 12 }} />
                <Legend iconSize={8} iconType="circle" formatter={(v: string) => <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "bold", textTransform: "capitalize" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Monthly Review */}
      {monthly.length > 0 && (
        <div className="rounded-2xl border border-white/8 p-4" style={{ background: "rgba(15,23,42,0.7)" }}>
          <p className="text-sm font-black text-white mb-1">Monthly Review</p>
          <p className="text-xs text-white/30 font-medium mb-4">Week-by-week breakdown</p>
          <div className="space-y-3">
            {monthly.map((w, i) => (
              <div key={i} className="rounded-xl border border-white/5 p-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-xs font-black text-white/60 uppercase tracking-wider mb-2">{w.week}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[10px] text-white/30 font-bold">Sleep</p>
                    <p className="text-sm font-black" style={{ color: w.avgSleep >= 7 ? "#22c55e" : w.avgSleep >= 6 ? "#f59e0b" : "#ef4444" }}>
                      {w.avgSleep}h
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 font-bold">Stress</p>
                    <p className="text-sm font-black" style={{ color: w.avgStress <= 4 ? "#22c55e" : w.avgStress <= 6 ? "#f59e0b" : "#ef4444" }}>
                      {w.avgStress}/10
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 font-bold">Exercise</p>
                    <p className="text-sm font-black" style={{ color: w.avgExercise >= 30 ? "#22c55e" : "#f59e0b" }}>
                      {w.avgExercise}m
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sleepData.length === 0 && habitData.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <Moon className="w-12 h-12 text-white/15 mb-4" />
          <p className="text-white/40 font-bold">No data for this period</p>
          <p className="text-white/20 text-sm mt-1">Start logging sleep and habits to see statistics</p>
        </div>
      )}
    </div>
  );
}
