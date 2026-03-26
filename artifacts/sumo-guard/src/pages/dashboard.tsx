import React, { useState } from "react";
import { useGetDashboard } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { format, subDays, addDays, parseISO } from "date-fns";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Moon, Zap, Droplets, Brain, ChevronLeft, ChevronRight, Shield, LogOut, TrendingUp } from "lucide-react";

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

function StatBar({ label, value, max, color, unit, icon }: {
  label: string; value: number; max: number; color: string; unit: string; icon: React.ReactNode;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-white/50 font-bold">{label}</span>
          <span className="text-xs font-black text-white">{value}<span className="text-white/30 font-bold ml-0.5">{unit}</span></span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}60, ${color})`, boxShadow: `0 0 6px ${color}60` }} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const weekDays = getWeekDays(parseISO(selectedDate + "T12:00:00"));

  const { data, isLoading } = useGetDashboard({ date: selectedDate });

  const todaySleep = data?.selectedDateSleep ?? null;
  const todayHabit = data?.selectedDateHabit ?? null;
  const sleepTrend = data?.sleepTrend ?? [];
  const topRisks = data?.topRisks ?? [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  function shiftWeek(dir: number) {
    const d = parseISO(selectedDate + "T12:00:00");
    setSelectedDate(format(addDays(d, dir * 7), "yyyy-MM-dd"));
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-start justify-between pt-1">
        <div>
          <p className="text-xs text-white/40 font-bold uppercase tracking-wider">{greeting}</p>
          <h2 className="text-xl font-black text-white mt-0.5">{user?.name || "Health Guard"}</h2>
          <p className="text-xs text-white/30 mt-0.5">{format(parseISO(selectedDate + "T12:00:00"), "EEEE, d MMMM")}</p>
        </div>
        <button onClick={logout} className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          <LogOut size={15} className="text-white/40" />
        </button>
      </div>

      {/* Week day picker */}
      <div className="rounded-2xl border border-white/8 p-3" style={{ background: "rgba(15,23,42,0.6)" }}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => shiftWeek(-1)} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white/70 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <p className="text-xs font-black text-white/50 uppercase tracking-wider">
            {format(weekDays[0], "MMM d")} – {format(weekDays[6], "MMM d")}
          </p>
          <button onClick={() => shiftWeek(1)} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white/70 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((d, i) => {
            const dStr = format(d, "yyyy-MM-dd");
            const isSelected = dStr === selectedDate;
            const isToday = dStr === format(new Date(), "yyyy-MM-dd");
            const isFuture = d > new Date();
            return (
              <button key={i} onClick={() => !isFuture && setSelectedDate(dStr)}
                disabled={isFuture}
                className="flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-200 active:scale-95"
                style={isSelected
                  ? { background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 0 15px rgba(245,158,11,0.4)" }
                  : { background: "rgba(255,255,255,0.03)" }}>
                <span className="text-[9px] font-bold uppercase" style={{ color: isSelected ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.3)" }}>
                  {DAY_LETTERS[d.getDay()]}
                </span>
                <span className="text-sm font-black" style={{ color: isSelected ? "#0f172a" : isFuture ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.8)" }}>
                  {d.getDate()}
                </span>
                {isToday && !isSelected && (
                  <div className="w-1 h-1 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-10 h-10 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          {/* Today's data */}
          {todaySleep || todayHabit ? (
            <div className="rounded-2xl border border-white/8 p-4 space-y-4" style={{ background: "rgba(15,23,42,0.7)" }}>
              <p className="text-xs font-black text-white/50 uppercase tracking-wider">
                {selectedDate === format(new Date(), "yyyy-MM-dd") ? "Today's Log" : `Log — ${format(parseISO(selectedDate + "T12:00:00"), "MMM d")}`}
              </p>

              {todaySleep && (
                <div className="rounded-xl border border-indigo-500/20 p-3" style={{ background: "rgba(99,102,241,0.07)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Moon size={14} className="text-indigo-400" />
                    <span className="text-xs font-black text-indigo-300 uppercase tracking-wider">Sleep</span>
                    <span className="ml-auto text-xs font-black px-2 py-0.5 rounded-full capitalize"
                      style={{ background: `${QUALITY_COLORS[todaySleep.quality]}20`, color: QUALITY_COLORS[todaySleep.quality] }}>
                      {todaySleep.quality}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[10px] text-white/30 font-bold">Duration</p>
                      <p className="text-lg font-black text-white">{todaySleep.durationHours}h</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30 font-bold">Bedtime</p>
                      <p className="text-lg font-black text-white">{format(new Date(todaySleep.bedtime), "HH:mm")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30 font-bold">Wake</p>
                      <p className="text-lg font-black text-white">{format(new Date(todaySleep.wakeTime), "HH:mm")}</p>
                    </div>
                  </div>
                </div>
              )}

              {todayHabit && (
                <div className="space-y-3">
                  <StatBar label="Exercise" value={todayHabit.exerciseMinutes} max={90} color="#22c55e" unit="min" icon={<Zap size={14} />} />
                  <StatBar label="Water" value={todayHabit.waterGlasses} max={10} color="#14b8a6" unit="glasses" icon={<Droplets size={14} />} />
                  <StatBar label="Stress" value={todayHabit.stressLevel} max={10} color="#f59e0b" unit="/10" icon={<Brain size={14} />} />
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 flex flex-col items-center text-center"
              style={{ background: "rgba(15,23,42,0.3)" }}>
              <Moon className="w-10 h-10 text-white/15 mb-3" />
              <p className="text-white/40 font-bold text-sm">No data for this day</p>
              <p className="text-white/20 text-xs mt-1">Log your sleep and habits to see details</p>
              <div className="flex gap-2 mt-4">
                <Link href="/sleep">
                  <button className="px-4 py-2 rounded-xl text-xs font-black text-slate-900"
                    style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}>Log Sleep</button>
                </Link>
                <Link href="/habits">
                  <button className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 border border-white/10">Log Habits</button>
                </Link>
              </div>
            </div>
          )}

          {/* Sleep trend */}
          {sleepTrend.length > 0 && (
            <div className="rounded-2xl border border-white/8 p-4" style={{ background: "rgba(15,23,42,0.7)" }}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={14} className="text-indigo-400" />
                <p className="text-sm font-black text-white">Sleep Trend</p>
                <span className="text-xs text-white/30 font-bold">— last 14 nights</span>
              </div>
              <div className="h-[130px] -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sleepTrend} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dashSleepGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} interval={3}
                      tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: "bold" }}
                      tickFormatter={(v: string) => format(parseISO(v), "d")} />
                    <YAxis domain={[0, 12]} axisLine={false} tickLine={false}
                      tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: "bold" }} />
                    <Tooltip contentStyle={{ background: "rgba(10,15,30,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#fff", fontSize: 11 }}
                      formatter={(v: number) => [`${v}h`, "Sleep"]} labelFormatter={(l: string) => format(parseISO(l), "MMM d")} />
                    <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2.5} fill="url(#dashSleepGrad)"
                      dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        const c = QUALITY_COLORS[payload.quality] || "#334155";
                        return payload.hours > 0
                          ? <circle key={cx} cx={cx} cy={cy} r={3.5} fill={c} stroke="#0f172a" strokeWidth={1.5} />
                          : <g key={cx} />;
                      }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top risks */}
          {topRisks.length > 0 && (
            <div className="rounded-2xl border border-white/8 p-4" style={{ background: "rgba(15,23,42,0.7)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-amber-400" />
                  <p className="text-sm font-black text-white">Top Risks</p>
                </div>
                <Link href="/predictions">
                  <span className="text-xs text-amber-400 font-bold hover:text-amber-300">Full Analysis →</span>
                </Link>
              </div>
              <div className="space-y-2.5">
                {topRisks.map((risk, i) => {
                  const colors = { critical: "#ef4444", high: "#f97316", moderate: "#f59e0b", low: "#22c55e" };
                  const c = colors[risk.riskLevel as keyof typeof colors] || "#22c55e";
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-white/60 font-bold">{risk.diseaseName.split("(")[0].trim()}</span>
                          <span className="text-xs font-black" style={{ color: c }}>{risk.riskScore}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <div className="h-full rounded-full" style={{ width: `${risk.riskScore}%`, background: `linear-gradient(90deg, ${c}50, ${c})` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Health score bar */}
          {data && (
            <div className="rounded-2xl border border-white/8 p-4 flex items-center gap-4"
              style={{ background: "rgba(15,23,42,0.7)" }}>
              <div className="flex-1">
                <p className="text-xs text-white/40 font-bold uppercase tracking-wider mb-2">Overall Health Score</p>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
                    style={{
                      width: `${data.healthScore}%`,
                      background: data.healthScore >= 70 ? "linear-gradient(90deg, #22c55e60, #22c55e)" : data.healthScore >= 50 ? "linear-gradient(90deg, #f59e0b60, #f59e0b)" : "linear-gradient(90deg, #ef444460, #ef4444)",
                    }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-black text-white">{data.healthScore}</p>
                <p className="text-[10px] text-white/30 font-bold">/ 100</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
