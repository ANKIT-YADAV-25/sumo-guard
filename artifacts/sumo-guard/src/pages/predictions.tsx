import React, { useState } from "react";
import { useGetPredictions } from "@workspace/api-client-react";
import { PremiumCard, PageHeader } from "@/components/shared";
import { AlertTriangle, Info, Activity } from "lucide-react";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function Predictions() {
  const { data: predictions, isLoading, error } = useGetPredictions();
  const [activeTab, setActiveTab] = useState('Days');

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !predictions) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Analysis Failed</h2>
      </div>
    );
  }

  if (predictions.dataInsufficient) {
    return (
      <div className="space-y-6">
        <PageHeader title="Statistics" description="AI predictions" />
        <PremiumCard className="flex flex-col items-center text-center p-8 border-dashed">
          <Info className="w-12 h-12 text-primary mb-4" />
          <h3 className="text-lg font-bold mb-2">More Data Required</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Log sleep and habits for a few days to see predictions.
          </p>
          <Link href="/sleep">
            <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold mb-3">
              Log Sleep
            </button>
          </Link>
        </PremiumCard>
      </div>
    );
  }

  // Mock chart data for "Statistics" visual
  const chartData = [
    { name: 'Mon', value: 40 },
    { name: 'Tue', value: 70 },
    { name: 'Wed', value: 45 },
    { name: 'Thu', value: 90 },
    { name: 'Fri', value: 65 },
    { name: 'Sat', value: 85 },
    { name: 'Sun', value: 55 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Statistics" description="Risk Analysis & Trends" />

      {/* Tabs */}
      <div className="flex bg-card rounded-full p-1 border border-border">
        {['Days', 'Weeks', 'Months', 'All'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${
              activeTab === tab 
                ? 'bg-secondary text-secondary-foreground' 
                : 'text-muted-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bar Chart Section */}
      <PremiumCard className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Health Score Trend</h3>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px'}} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value > 80 ? 'hsl(var(--accent))' : 'hsl(var(--muted))'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PremiumCard>

      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Activity size={20} className="text-primary" /> Risk Factors
        </h3>
        
        {predictions.diseases.map((disease, idx) => {
          const barColor = disease.riskLevel === 'critical' ? 'bg-destructive' :
                         disease.riskLevel === 'high' ? 'bg-primary' :
                         disease.riskLevel === 'moderate' ? 'bg-accent' : 'bg-secondary';
          
          return (
            <PremiumCard key={idx} className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold">{disease.diseaseName}</h4>
                <span className="text-xs font-bold text-muted-foreground">{disease.riskScore}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${barColor}`} 
                  style={{ width: `${disease.riskScore}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Timeline: {disease.predictedTimeframe}</p>
            </PremiumCard>
          );
        })}
      </div>
    </div>
  );
}
