import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useGetStatistics, useGetPredictions } from "@/lib/api";
import { format, startOfYear, eachMonthOfInterval, endOfYear, parseISO, isSameMonth } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line,
} from "recharts";
import {
  Zap, Droplets, Brain, TrendingUp, TrendingDown,
  Wifi, ChevronRight, AlertTriangle,
  CheckCircle2, Target, Activity, Heart, ChevronDown, ChevronUp, Lightbulb,
  Loader2, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PremiumCard, PageHeader } from "@/components/shared";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const PERIODS = [
  { key: "day", label: "Day" },
  { key: "month", label: "Month" },
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
  const worst = Math.min(98, currentScore + currentScore * 0.35);
  return { worst: Math.round(worst) };
}

function DiseaseCard({ disease, index }: { disease: any; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const color = RISK_COLORS[disease.riskLevel] || "#22c55e";
  const bg = RISK_BG[disease.riskLevel] || "rgba(34,197,94,0.08)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: `${color}30`, background: bg }}
    >
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
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
          <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${disease.riskScore}%` }}
              transition={{ duration: 0.8, delay: index * 0.05 + 0.2, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${color}60, ${color})` }}
            />
          </div>
        </div>

        <div className="shrink-0 text-white/30">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

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

export default function Statistics() {
  const [period, setPeriod] = useState("day");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formattedDate = format(selectedDate, "yyyy-MM-dd");

  const { data: stats, isLoading: statsLoading } = useGetStatistics({ period, date: formattedDate });
  const { data: predictions, isLoading: predLoading } = useGetPredictions();

  const habitData = stats?.habitData ?? [];
  const avgs = stats?.averages;
  const diseases = predictions?.diseases ?? [];
  const healthScore = predictions?.overallHealthScore ?? 0;

  const hasData = (stats?.habitLogsCount ?? 0) > 0 || !predictions?.dataInsufficient;

  // Build future disease projection chart data
  const projectionData = diseases.slice(0, 5).map((d) => {
    const proj = projectFuture(d.riskScore);
    return {
      name: d.diseaseName.split(" ")[0].replace("(", "").slice(0, 8),
      current: d.riskScore,
      worst: proj.worst,
      color: RISK_COLORS[d.riskLevel] || "#22c55e",
    };
  });

  const forecastData = [
    { label: "This Month", improve: healthScore, decline: healthScore },
    { label: "3 Months", improve: Math.min(100, Math.round(healthScore * 1.06)), decline: Math.round(healthScore * 0.94) },
    { label: "6 Months", improve: Math.min(100, Math.round(healthScore * 1.12)), decline: Math.round(healthScore * 0.88) },
    { label: "9 Months", improve: Math.min(100, Math.round(healthScore * 1.18)), decline: Math.round(healthScore * 0.82) },
    { label: "12 Months", improve: Math.min(100, Math.round(healthScore * 1.24)), decline: Math.round(healthScore * 0.76) },
  ].filter(d => (d.improve >= 0 && d.improve <= 100) || (d.decline >= 0 && d.decline <= 100));

  const tickInterval = habitData.length > 14 ? Math.ceil(habitData.length / 7) - 1 : 0;

  return (
    <div className="space-y-4 pb-2">
      <div>
        <h2 className="text-2xl font-black text-white">Statistics</h2>
        <p className="text-xs text-white/40 font-medium mt-0.5">Health insights & future projections</p>
      </div>


      {/* Period tabs */}
      <div className="flex flex-col gap-3 mb-8">
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

        {/* Month Selector */}
        <AnimatePresence>
          {period === "month" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 p-3 rounded-2xl border border-white/5 bg-white/5">
                <Calendar size={14} className="text-amber-400 shrink-0" />
                <Select
                  value={format(selectedDate, "yyyy-MM")}
                  onValueChange={(val) => setSelectedDate(parseISO(`${val}-01T12:00:00`))}
                >
                  <SelectTrigger className="flex-1 bg-transparent border-none text-white font-black text-xs h-auto p-0 focus:ring-0">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    {eachMonthOfInterval({
                      start: startOfYear(new Date()),
                      end: new Date()
                    }).reverse().map((month) => (
                      <SelectItem
                        key={format(month, "yyyy-MM")}
                        value={format(month, "yyyy-MM")}
                        className="text-white/70 focus:text-white focus:bg-white/10"
                      >
                        {format(month, "MMMM yyyy")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
      {hasData && (
        <div className="rounded-2xl border border-white/8 p-4" style={{ background: "rgba(15,23,42,0.7)" }}>
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} className="text-amber-400" />
            <p className="text-sm font-black text-white">Future Disease Risk</p>
          </div>
          <p className="text-xs text-white/30 font-medium mb-4">Current vs Worst Case risk probability</p>

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
                    <Bar dataKey="current" name="Current" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={15} unit="%" />
                    <Bar dataKey="worst" name="Worst Case" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={15} unit="%" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-2">
                {[
                  { color: "#6366f1", label: "Current Level" },
                  { color: "#ef4444", label: "Worst Case (Unhealthy Habits)" },
                ].map((l) => (
                  <span key={l.label} className="flex items-center gap-1.5 text-[10px] font-black text-white/40">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />{l.label}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-white/30 text-xs font-bold">Log data to generate predictions</div>
          )}
        </div>
      )}

      {/* Health Score Projection Timeline */}
      {hasData && (
        <div className="rounded-2xl border border-white/8 p-4" style={{ background: "rgba(15,23,42,0.7)" }}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-green-400" />
            <p className="text-sm font-black text-white">Health Score Forecast</p>
          </div>
          <p className="text-xs text-white/30 font-medium mb-4">Projected over 12 months — green if improved, red if unchanged</p>
          <div className="h-[150px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} 
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: "bold" }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone" dataKey="improve" name="With Improvements"
                  stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: "#22c55e", stroke: "#0f172a", strokeWidth: 2 }}
                  unit="/100"
                />
                <Line
                  type="monotone" dataKey="decline" name="No Changes"
                  stroke="#ef4444" strokeWidth={2} strokeDasharray="5 3"
                  dot={{ r: 3, fill: "#ef4444", stroke: "#0f172a", strokeWidth: 1.5 }} unit="/100"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}



      {/* Disease Analysis List */}
      {hasData && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1 px-1">
            <Activity size={14} className="text-purple-400" />
            <p className="text-sm font-black text-white">Full Disease Risk Analysis</p>
          </div>
          {diseases.length > 0 ? (
            <div className="space-y-3">
              {diseases.map((d, i) => (
                <DiseaseCard key={i} disease={d} index={i} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center" style={{ background: "rgba(15,23,42,0.3)" }}>
              <p className="text-white/40 font-bold text-sm">No predictions available yet</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
