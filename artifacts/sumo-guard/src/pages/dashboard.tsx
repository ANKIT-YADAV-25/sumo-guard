import React from "react";
import { useGetDashboard } from "@workspace/api-client-react";
import { PremiumCard } from "@/components/shared";
import { 
  Activity, Moon, ShieldAlert, ChevronRight, Droplets, Flame, Brain
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: dashboard, isLoading, error } = useGetDashboard();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <ShieldAlert className="w-20 h-20 text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
        <h2 className="text-2xl font-black text-white mb-2">Could not load dashboard</h2>
      </div>
    );
  }

  const today = new Date();
  const daysOfWeek = ['M','T','W','T','F','S','S'];
  const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;

  return (
    <div className="space-y-8 pb-4">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">{format(today, "EEEE d MMM")}</h2>
          <p className="text-sm font-bold text-orange-400/80 uppercase tracking-widest mt-1">Good Morning</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/20 border border-orange-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
            <Flame size={14} className="text-orange-500" />
            <span className="text-xs font-bold text-orange-400">7 Day Streak</span>
          </div>
          <div className="w-12 h-12 rounded-full glass overflow-hidden border-2 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
            <img src={`${import.meta.env.BASE_URL}images/avatar-placeholder.png`} alt="Profile" className="w-full h-full object-cover"/>
          </div>
        </div>
      </div>

      {/* Days of Week */}
      <div className="flex justify-between items-center glass rounded-2xl p-2 border border-white/10">
        {daysOfWeek.map((day, i) => {
          const isActive = i === currentDayIndex;
          return (
            <div 
              key={i} 
              className={`flex flex-col items-center justify-center w-11 h-14 rounded-xl text-sm font-black transition-all ${
                isActive 
                  ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)] scale-110 -translate-y-1' 
                  : 'text-white/40 hover:bg-white/5'
              }`}
            >
              {day}
              {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5 shadow-[0_0_5px_white]" />}
            </div>
          )
        })}
      </div>

      {/* Main Circular Health Score */}
      <div className="flex flex-col items-center justify-center py-6 animate-float relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-[50px] -z-10" />
        
        <div className="relative w-64 h-64 flex items-center justify-center animate-pulse-glow">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]">
            {/* Background ring */}
            <path
              className="text-white/5"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            {/* Foreground ring with gradient */}
            <defs>
              <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
            </defs>
            <path
              stroke="url(#score-gradient)"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              strokeWidth="3.5"
              strokeDasharray={`${dashboard.healthScore}, 100`}
              strokeLinecap="round"
              className="drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-2">
            <span className="text-6xl font-display font-black gradient-text drop-shadow-md">
              {dashboard.healthScore}
            </span>
            <span className="text-sm font-bold text-white/50 tracking-widest uppercase mt-1">Health Score</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <PremiumCard className="p-4 border-l-4 border-l-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.15)] flex flex-col gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
            <Moon size={16} />
          </div>
          <div>
            <p className="text-xs text-white/50 font-bold uppercase">Sleep</p>
            <p className="text-xl font-black text-white">{dashboard.avgSleepHours.toFixed(1)} <span className="text-sm text-teal-400">hrs</span></p>
          </div>
        </PremiumCard>
        
        <PremiumCard className="p-4 border-l-4 border-l-green-400 shadow-[0_0_15px_rgba(74,222,128,0.15)] flex flex-col gap-2">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
            <Activity size={16} />
          </div>
          <div>
            <p className="text-xs text-white/50 font-bold uppercase">Activity</p>
            <p className="text-xl font-black text-white">45 <span className="text-sm text-green-400">min</span></p>
          </div>
        </PremiumCard>
      </div>

      {/* Sleep Trend Chart */}
      <PremiumCard className="p-5 border border-teal-500/20 shadow-[0_8px_30px_rgba(45,212,191,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-[40px] -z-10" />
        
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black flex items-center gap-2 text-white">
            <Moon size={20} className="text-teal-400" /> Sleep Analysis
          </h3>
        </div>
        <div className="h-[160px] w-full -ml-4">
          {dashboard.sleepTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.sleepTrend}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(45,212,191,0.3)', borderRadius: '12px', color: '#fff', boxShadow: '0 0 20px rgba(45,212,191,0.2)' }}
                  itemStyle={{ color: '#2dd4bf', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#2dd4bf" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorHours)" 
                  activeDot={{r: 6, fill: "#0f172a", stroke: "#2dd4bf", strokeWidth: 3, filter: "drop-shadow(0 0 5px #2dd4bf)"}} 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-white/40 text-sm font-medium">
              No sleep data available yet.
            </div>
          )}
        </div>
      </PremiumCard>

      {/* Top Risks snippet */}
      <PremiumCard className="p-5 border border-orange-500/20 shadow-[0_8px_30px_rgba(249,115,22,0.1)] relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-[40px] -z-10" />
        
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black flex items-center gap-2 text-white">
            <Brain size={20} className="text-orange-400" /> Health Risks
          </h3>
          <Link href="/predictions" className="text-orange-400 text-sm font-bold flex items-center bg-orange-500/10 px-3 py-1 rounded-full hover:bg-orange-500/20 transition-colors">
            View <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        {dashboard.topRisks.length > 0 ? (
          <div className="space-y-4">
            {dashboard.topRisks.slice(0,2).map((risk, i) => {
              const colors = {
                critical: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]',
                high: 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]',
                moderate: 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]'
              };
              const riskColor = colors[risk.riskLevel as keyof typeof colors] || 'bg-teal-500';
              
              return (
                <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${riskColor}`} />
                    <p className="font-bold text-white/90">{risk.diseaseName}</p>
                  </div>
                  <span className="text-xs font-black tracking-wider uppercase text-white/50">{risk.riskLevel}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-white/40 text-center py-4 font-medium">Log data to see predictions.</p>
        )}
      </PremiumCard>
    </div>
  );
}
