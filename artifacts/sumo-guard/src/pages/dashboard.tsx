import React from "react";
import { useGetDashboard } from "@workspace/api-client-react";
import { PremiumCard, PageHeader } from "@/components/shared";
import { 
  Heart, Activity, Droplets, Brain, Clock, ShieldAlert, ArrowRight 
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart 
} from "recharts";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: dashboard, isLoading, error } = useGetDashboard();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-primary font-medium">Analyzing your health profile...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Could not load dashboard</h2>
        <p className="text-muted-foreground">Please try again later or check your connection.</p>
      </div>
    );
  }

  const needsMoreData = dashboard.totalSleepLogs < 3 || dashboard.totalHabitLogs < 3;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Your Health Dashboard" 
        description="Daily insights and predictive health analysis at a glance."
      />

      {needsMoreData && (
        <PremiumCard className="bg-gradient-to-r from-secondary/10 to-primary/10 border-primary/20 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Brain className="text-primary" /> Let's get to know you
              </h3>
              <p className="text-muted-foreground mt-2">
                Log a few more days of sleep and habits to unlock highly accurate disease risk predictions.
              </p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <Link href="/sleep" className="flex-1 md:flex-none">
                <button className="w-full px-6 py-3 rounded-xl bg-white text-primary font-bold shadow-sm hover:shadow-md transition-all">
                  Log Sleep
                </button>
              </Link>
              <Link href="/habits" className="flex-1 md:flex-none">
                <button className="w-full px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all">
                  Log Habits
                </button>
              </Link>
            </div>
          </div>
        </PremiumCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Main Card */}
        <PremiumCard className="lg:col-span-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0 pointer-events-none" />
          <h3 className="text-lg font-bold text-muted-foreground z-10 mb-4">Overall Health Score</h3>
          
          <div className="relative w-48 h-48 flex items-center justify-center z-10">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <path
                className="text-muted/50"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="100, 100"
              />
              <path
                className={dashboard.healthScore > 75 ? "text-primary" : dashboard.healthScore > 50 ? "text-secondary" : "text-destructive"}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${dashboard.healthScore}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-display font-extrabold text-foreground tracking-tighter">
                {dashboard.healthScore}
              </span>
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mt-1">/ 100</span>
            </div>
          </div>
        </PremiumCard>

        {/* Quick Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <PremiumCard className="p-4 flex flex-col justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1">
              <Clock size={20} />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Avg Sleep</p>
            <p className="text-2xl font-bold font-display">{dashboard.avgSleepHours.toFixed(1)}h</p>
          </PremiumCard>

          <PremiumCard className="p-4 flex flex-col justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
              <Activity size={20} />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Avg Exercise</p>
            <p className="text-2xl font-bold font-display">{dashboard.avgExerciseMinutes.toFixed(0)}m</p>
          </PremiumCard>

          <PremiumCard className="p-4 flex flex-col justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center mb-1">
              <Droplets size={20} />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Water/Day</p>
            <p className="text-2xl font-bold font-display">{dashboard.avgWaterGlasses.toFixed(1)}</p>
          </PremiumCard>

          <PremiumCard className="p-4 flex flex-col justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-1">
              <Brain size={20} />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Avg Stress</p>
            <p className="text-2xl font-bold font-display">{dashboard.avgStressLevel.toFixed(1)}<span className="text-base text-muted-foreground">/10</span></p>
          </PremiumCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Sleep Trend */}
        <PremiumCard className="flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Sleep Trend (Last 7 Days)</h3>
            <Link href="/sleep" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex-1 min-h-[250px]">
            {dashboard.sleepTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboard.sleepTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No sleep data available yet.
              </div>
            )}
          </div>
        </PremiumCard>

        {/* Top Risks */}
        <PremiumCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Top Disease Risks</h3>
            <Link href="/predictions" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
              Full Analysis <ArrowRight size={14} />
            </Link>
          </div>
          
          {dashboard.topRisks.length > 0 ? (
            <div className="space-y-4">
              {dashboard.topRisks.slice(0,3).map((risk, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-background border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Heart className="text-primary w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{risk.diseaseName}</p>
                      <p className="text-xs text-muted-foreground">{risk.predictedTimeframe}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                      ${risk.riskLevel === 'critical' ? 'bg-red-100 text-red-700' : 
                        risk.riskLevel === 'high' ? 'bg-orange-100 text-orange-700' : 
                        risk.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-green-100 text-green-700'}
                    `}>
                      {risk.riskLevel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl p-6">
              <ShieldAlert className="w-8 h-8 mb-2 text-muted-foreground/50" />
              <p>Log more data to see predicted disease risks.</p>
            </div>
          )}
        </PremiumCard>
      </div>
    </div>
  );
}
