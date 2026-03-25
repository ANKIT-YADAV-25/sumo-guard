import React from "react";
import { useGetDashboard } from "@workspace/api-client-react";
import { PremiumCard } from "@/components/shared";
import { 
  Activity, Moon, ShieldAlert, ChevronRight
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: dashboard, isLoading, error } = useGetDashboard();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Could not load dashboard</h2>
      </div>
    );
  }

  const today = new Date();
  const daysOfWeek = ['M','T','W','T','F','S','S'];
  const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{format(today, "EEEE d MMM")}</h2>
          <p className="text-sm text-muted-foreground">Good Morning</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-card overflow-hidden border-2 border-border">
          <img src={`${import.meta.env.BASE_URL}images/avatar-placeholder.png`} alt="Profile" className="w-full h-full object-cover"/>
        </div>
      </div>

      {/* Days of Week */}
      <div className="flex justify-between items-center bg-card rounded-2xl p-3 border border-border">
        {daysOfWeek.map((day, i) => (
          <div key={i} className={`flex flex-col items-center justify-center w-10 h-12 rounded-xl text-sm font-bold ${i === currentDayIndex ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
            {day}
            {i === currentDayIndex && <div className="w-1 h-1 bg-primary-foreground rounded-full mt-1" />}
          </div>
        ))}
      </div>

      {/* Main Circular Health Score */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative w-56 h-56 flex items-center justify-center">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            <path
              className="text-card"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="text-primary"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${dashboard.healthScore}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-display font-extrabold text-foreground">
              {dashboard.healthScore}%
            </span>
            <span className="text-sm font-semibold text-muted-foreground mt-1">Quality</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold mt-4">{dashboard.avgSleepHours.toFixed(1)}h <span className="text-muted-foreground font-medium text-lg">In bed</span></h3>
      </div>

      {/* Sleep Trend Chart */}
      <PremiumCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Moon size={18} className="text-secondary" /> Sleep Analysis
          </h3>
        </div>
        <div className="h-[140px] w-full">
          {dashboard.sleepTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboard.sleepTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  hide 
                />
                <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: 'none', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--secondary))' }}
                />
                <Line type="monotone" dataKey="hours" stroke="hsl(var(--secondary))" strokeWidth={3} dot={{r: 4, fill: "hsl(var(--card))", strokeWidth: 2}} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No sleep data available yet.
            </div>
          )}
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/50 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Went to bed</span>
            <span className="font-bold">11:30 PM</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-muted-foreground">Woke up</span>
            <span className="font-bold">07:15 AM</span>
          </div>
        </div>
      </PremiumCard>

      {/* Top Risks snippet */}
      <PremiumCard className="p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Activity size={18} className="text-accent" /> Health Risks
          </h3>
          <Link href="/predictions" className="text-primary text-sm font-semibold flex items-center">
            View <ChevronRight size={16} />
          </Link>
        </div>
        {dashboard.topRisks.length > 0 ? (
          <div className="space-y-3">
            {dashboard.topRisks.slice(0,2).map((risk, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${risk.riskLevel === 'critical' ? 'bg-red-500' : risk.riskLevel === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                  <p className="font-bold text-sm">{risk.diseaseName}</p>
                </div>
                <span className="text-xs font-bold uppercase text-muted-foreground">{risk.riskLevel}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">Log data to see predictions.</p>
        )}
      </PremiumCard>
    </div>
  );
}
