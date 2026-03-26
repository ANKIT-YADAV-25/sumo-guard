import React, { useState } from "react";
import { useGetStatistics, useGetPredictions } from "@workspace/api-client-react";
import { format } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line,
} from "recharts";
import {
  Zap, Droplets, Brain, TrendingUp, TrendingDown,
  Bluetooth, BluetoothOff, Wifi, ChevronRight, AlertTriangle,
  CheckCircle2, Target, Activity, Heart,
} from "lucide-react";
import { motion } from "framer-motion";

const RISK_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  moderate: "#f59e0b",
  low: "#22c55e",
};

const PERIODS = [
  { key: "day", label: "7D" },
  { key: "week", label: "4W" },
  { key: "month", label: "1M" },
  { key: "year", label: "1Y" },
];

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-white/10 p-2.5 text-xs"
        style={{ background: "rgba(10,15,30,0.95)", backdropFilter: "blur(10px)" }}>
        <p className="text-white/50 font-bold mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color || p.stroke || "#fff" }} className="font-bold">
            {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}{p.unit || ""}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// Simulate future projections based on current risk score
function projectFuture(currentScore: number) {
  const noChange = Math.min(95, currentScore + currentScore * 0.15);
  const withChanges = Math.max(5, currentScore - currentScore * 0.3);
  const worst = Math.min(98, currentScore + currentScore * 0.35);
  return { noChange: Math.round(noChange), withChanges: Math.round(withChanges), worst: Math.round(worst) };
}

export default function Statistics() {
  const [period, setPeriod] = useState("month");
  const [btScanning, setBtScanning] = useState(false);
  const [btConnected, setBtConnected] = useState(false);
  const [btDevice, setBtDevice] = useState<string | null>(null);
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: stats, isLoading: statsLoading } = useGetStatistics({ period, date: today });
  const { data: predictions, isLoading: predLoading } = useGetPredictions();

  const habitData = stats?.habitData ?? [];
  const avgs = stats?.averages;
  const diseases = predictions?.diseases ?? [];
  const healthScore = predictions?.overallHealthScore ?? 0;

  // Build future disease projection chart data
  const projectionData = diseases.slice(0, 5).map((d) => {
    const proj = projectFuture(d.riskScore);
    return {
      name: d.diseaseName.split(" ")[0].replace("(", "").slice(0, 8),
      current: d.riskScore,
      noChange: proj.noChange,
      improve: proj.withChanges,
      worst: proj.worst,
      color: RISK_COLORS[d.riskLevel] || "#22c55e",
    };
  });

  // Timeline projection for health score
  const timelineData = [
    { label: "Now", score: healthScore },
    { label: "3M", score: Math.round(healthScore * 0.97) },
    { label: "6M (improve)", score: Math.round(healthScore * 1.08) },
    { label: "1Y (improve)", score: Math.round(healthScore * 1.18) },
    { label: "6M (no change)", score: Math.round(healthScore * 0.91) },
    { label: "1Y (no change)", score: Math.round(healthScore * 0.82) },
  ].filter(d => d.score >= 0 && d.score <= 100);

  const improveLine = [
    { label: "Now", score: healthScore },
    { label: "3M", score: Math.round(healthScore * 0.97) },
    { label: "6M", score: Math.round(healthScore * 1.08) },
    { label: "1Y", score: Math.min(95, Math.round(healthScore * 1.18)) },
  ];
  const declineLine = [
    { label: "Now", score: healthScore },
    { label: "3M", score: Math.round(healthScore * 0.94) },
    { label: "6M", score: Math.round(healthScore * 0.87) },
    { label: "1Y", score: Math.round(healthScore * 0.78) },
  ];

  const tickInterval = habitData.length > 14 ? Math.ceil(habitData.length / 7) - 1 : 0;

  function handleBluetooth() {
    if (btConnected) {
      setBtConnected(false);
      setBtDevice(null);
      return;
    }
    setBtScanning(true);
    setTimeout(() => {
      setBtScanning(false);
      setBtConnected(true);
      setBtDevice("Sumo Health Band v1");
    }, 2500);
  }

  return (
    <div className="space-y-4 pb-2">
      <div>
        <h2 className="text-2xl font-black text-white">Statistics</h2>
        <p className="text-xs text-white/40 font-medium mt-0.5">Health insights & future projections</p>
      </div>

      {/* Period tabs */}
      <div className="flex gap-1 p-1 rounded-2xl border border-white/5" style={{ background: "rgba(15,23,42,0.6)" }}>
        {PERIODS.map((p) => (
          <button key={p.key} onClick={() => setPeriod(p.key)}
            className="flex-1 py-2 text-xs font-black rounded-xl transition-all duration-200"
            style={period === p.key
              ? { background: "linear-gradient(135deg, #f59e0b, #f97316)", color: "#0f172a", boxShadow: "0 0 12px rgba(245,158,11,0.4)" }
              : { color: "rgba(255,255,255,0.35)" }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Stat summary cards */}
      {avgs && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <Zap size={14} />, label: "Avg Exercise", value: `${avgs.avgExerciseMinutes}m`, color: "#22c55e" },
            { icon: <Droplets size={14} />, label: "Water", value: `${avgs.avgWaterGlasses}g`, color: "#14b8a6" },
            { icon: <Brain size={14} />, label: "Stress", value: `${avgs.avgStressLevel}/10`, color: "#f59e0b" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border p-3 text-center"
              style={{ background: `${s.color}08`, borderColor: `${s.color}20` }}>
              <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
              <p className="text-base font-black text-white leading-none">{s.value}</p>
              <p className="text-[9px] text-white/35 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── FUTURE DISEASE RISK ── */}
      <div className="rounded-2xl border border-white/8 p-4" style={{ background: "rgba(15,23,42,0.7)" }}>
        <div className="flex items-center gap-2 mb-1">
          <Target size={14} className="text-amber-400" />
          <p className="text-sm font-black text-white">Future Disease Risk</p>
        </div>
        <p className="text-xs text-white/30 font-medium mb-4">Projected if habits improve vs stay same</p>

        {predLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
          </div>
        ) : projectionData.length > 0 ? (
          <>
            <div className="h-[200px] -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectionData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false}
                    tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9, fontWeight: "bold" }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false}
                    tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="current" name="Current" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={12} unit="%" />
                  <Bar dataKey="improve" name="If Improve" fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={12} unit="%" />
                  <Bar dataKey="noChange" name="No Change" fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={12} unit="%" />
                  <Bar dataKey="worst" name="Worst Case" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={12} unit="%" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { color: "#6366f1", label: "Current" },
                { color: "#22c55e", label: "If Improve" },
                { color: "#f59e0b", label: "No Change" },
                { color: "#ef4444", label: "Worst" },
              ].map((l) => (
                <span key={l.label} className="flex items-center gap-1 text-[9px] font-black text-white/40">
                  <span className="w-2 h-2 rounded-sm" style={{ background: l.color }} />{l.label}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-white/30 text-xs font-bold">Log data to generate predictions</div>
        )}
      </div>

      {/* Health Score Projection Timeline */}
      <div className="rounded-2xl border border-white/8 p-4" style={{ background: "rgba(15,23,42,0.7)" }}>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={14} className="text-green-400" />
          <p className="text-sm font-black text-white">Health Score Forecast</p>
        </div>
        <p className="text-xs text-white/30 font-medium mb-4">Projected over 12 months — green if improved, red if unchanged</p>
        <div className="h-[150px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false}
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: "bold" }} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false}
                tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                data={improveLine} type="monotone" dataKey="score" name="With Improvements"
                stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: "#22c55e", stroke: "#0f172a", strokeWidth: 2 }}
                strokeDasharray="0" unit="/100"
              />
              <Line
                data={declineLine} type="monotone" dataKey="score" name="No Changes"
                stroke="#ef4444" strokeWidth={2} strokeDasharray="5 3"
                dot={{ r: 3, fill: "#ef4444", stroke: "#0f172a", strokeWidth: 1.5 }} unit="/100"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Disease Risk Radar */}
      {diseases.length > 0 && (
        <div className="rounded-2xl border border-white/8 p-4" style={{ background: "rgba(15,23,42,0.7)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} className="text-purple-400" />
            <p className="text-sm font-black text-white">Risk Overview Radar</p>
          </div>
          <div className="h-[180px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={diseases.slice(0, 6).map(d => ({
                subject: d.diseaseName.split(" ")[0].replace("(", ""),
                risk: d.riskScore,
              }))}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9, fontWeight: "bold" }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="risk" stroke="#a855f7" fill="#a855f7" fillOpacity={0.18} strokeWidth={2}
                  name="Risk Score" />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Disease risk list with projected 1Y values */}
      <div className="rounded-2xl border border-white/8 p-4" style={{ background: "rgba(15,23,42,0.7)" }}>
        <p className="text-xs font-black text-white/50 uppercase tracking-wider mb-3">1-Year Projections</p>
        <div className="space-y-3">
          {diseases.map((d, i) => {
            const proj = projectFuture(d.riskScore);
            const delta = proj.withChanges - d.riskScore;
            const color = RISK_COLORS[d.riskLevel] || "#22c55e";
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-bold text-white/60">{d.diseaseName.split("(")[0].trim()}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black" style={{ color }}>{d.riskScore}%</span>
                      <span className="text-[10px] font-bold text-green-400 flex items-center gap-0.5">
                        <TrendingDown size={9} />{Math.abs(delta)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden relative" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="h-full rounded-full" style={{ width: `${d.riskScore}%`, background: `${color}60` }} />
                    <div className="absolute inset-y-0 left-0 rounded-full h-full transition-all"
                      style={{ width: `${proj.withChanges}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }} />
                  </div>
                  <p className="text-[9px] text-white/25 font-bold mt-1">
                    Can improve to {proj.withChanges}% with lifestyle changes
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Habit chart */}
      {habitData.length > 0 && (
        <div className="rounded-2xl border border-white/8 p-4" style={{ background: "rgba(15,23,42,0.7)" }}>
          <p className="text-sm font-black text-white mb-1">Exercise vs Stress</p>
          <p className="text-xs text-white/30 font-medium mb-4">Daily comparison</p>
          <div className="h-[150px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="exGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="stressGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} interval={tickInterval}
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: "bold" }} />
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="exerciseMinutes" name="Exercise" fill="url(#exGrad2)" radius={[3, 3, 0, 0]} maxBarSize={14} unit="min" />
                <Bar dataKey="stressLevel" name="Stress" fill="url(#stressGrad2)" radius={[3, 3, 0, 0]} maxBarSize={14} unit="/10" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── BLUETOOTH DEVICE CONNECTION ── */}
      <div className="rounded-2xl border overflow-hidden"
        style={{
          borderColor: btConnected ? "rgba(34,197,94,0.3)" : "rgba(59,130,246,0.2)",
          background: btConnected ? "rgba(34,197,94,0.06)" : "rgba(59,130,246,0.05)",
        }}>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: btConnected ? "rgba(34,197,94,0.2)" : "rgba(59,130,246,0.15)" }}>
              {btConnected
                ? <Bluetooth size={20} className="text-green-400" style={{ filter: "drop-shadow(0 0 6px rgba(34,197,94,0.6))" }} />
                : <BluetoothOff size={20} className="text-blue-400" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-white">Health Device</p>
              <p className="text-xs font-medium" style={{ color: btConnected ? "#22c55e" : "rgba(255,255,255,0.35)" }}>
                {btConnected ? `Connected: ${btDevice}` : "No device connected"}
              </p>
            </div>
            {btConnected && (
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] font-black text-green-400">LIVE</span>
              </div>
            )}
          </div>

          {btConnected ? (
            <div className="space-y-2">
              {/* Simulated real-time readings */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Heart Rate", value: "72 bpm", color: "#ef4444" },
                  { label: "SpO₂", value: "98%", color: "#14b8a6" },
                  { label: "Steps", value: "4,231", color: "#22c55e" },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl p-2.5 border border-white/5 text-center"
                    style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-xs font-black" style={{ color: m.color }}>{m.value}</p>
                    <p className="text-[9px] text-white/35 font-bold mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>
              <button onClick={handleBluetooth}
                className="w-full py-2.5 rounded-xl text-xs font-black text-red-400 border border-red-500/20"
                style={{ background: "rgba(239,68,68,0.06)" }}>
                Disconnect
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-white/30 font-medium leading-relaxed">
                Connect a Bluetooth health band, smartwatch, or pulse oximeter to get real-time heart rate, SpO₂ and step data automatically logged.
              </p>
              <div className="flex gap-2">
                {[
                  { icon: <Heart size={10} />, label: "Heart Rate" },
                  { icon: <Activity size={10} />, label: "Steps" },
                  { icon: <Wifi size={10} />, label: "SpO₂" },
                ].map((f) => (
                  <span key={f.label} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black text-blue-300 border border-blue-500/20"
                    style={{ background: "rgba(59,130,246,0.1)" }}>
                    {f.icon}{f.label}
                  </span>
                ))}
              </div>
              <button onClick={handleBluetooth} disabled={btScanning}
                className="w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{
                  background: btScanning ? "rgba(59,130,246,0.15)" : "linear-gradient(135deg, #3b82f6, #6366f1)",
                  color: btScanning ? "#60a5fa" : "white",
                  boxShadow: btScanning ? "none" : "0 0 20px rgba(59,130,246,0.3)",
                }}>
                {btScanning ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                    Scanning for devices…
                  </>
                ) : (
                  <>
                    <Bluetooth size={16} />
                    Connect Device
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
