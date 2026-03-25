import React from "react";
import { useGetPredictions } from "@workspace/api-client-react";
import { PremiumCard, PageHeader } from "@/components/shared";
import { BrainCircuit, AlertTriangle, Info, ArrowUpRight, Activity } from "lucide-react";
import { Link } from "wouter";
import { format, parseISO } from "date-fns";

export default function Predictions() {
  const { data: predictions, isLoading, error } = useGetPredictions();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <BrainCircuit className="w-16 h-16 text-primary animate-pulse" />
          <p className="text-primary font-medium text-lg">AI is analyzing your health patterns...</p>
        </div>
      </div>
    );
  }

  if (error || !predictions) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Analysis Failed</h2>
        <p className="text-muted-foreground">Could not generate predictions at this time.</p>
      </div>
    );
  }

  if (predictions.dataInsufficient) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Disease Risk Predictions" 
          description="AI-powered analysis based on your unique habits and sleep patterns."
        />
        <PremiumCard className="flex flex-col items-center text-center p-12 border-dashed border-2">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Info className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2">More Data Required</h3>
          <p className="text-muted-foreground max-w-lg mb-8 text-lg">
            Our AI needs a consistent baseline to accurately predict health risks. 
            Please log your sleep and habits for at least 3-5 days.
          </p>
          <div className="flex gap-4">
            <Link href="/sleep">
              <button className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:shadow-lg transition-all">
                Log Sleep
              </button>
            </Link>
            <Link href="/habits">
              <button className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:shadow-lg transition-all">
                Log Habits
              </button>
            </Link>
          </div>
        </PremiumCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <PageHeader 
          title="Disease Risk Predictions" 
          description="AI-powered analysis based on your unique habits and sleep patterns."
        />
        <p className="text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border border-border">
          Assessment Date: <span className="font-bold text-foreground">{format(parseISO(predictions.riskAssessmentDate), 'MMMM do, yyyy')}</span>
        </p>
      </div>

      <PremiumCard className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-40 h-40 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(20,184,166,0.5)]">
              <path
                className="text-slate-700"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="text-teal-400"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={`${predictions.overallHealthScore}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-display font-extrabold text-white tracking-tighter">
                {predictions.overallHealthScore}
              </span>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Activity className="text-teal-400" /> Overall Health Assessment
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              {predictions.summary}
            </p>
          </div>
        </div>
      </PremiumCard>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          Specific Risk Factors
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {predictions.diseases.map((disease, idx) => {
            const riskColors = {
              critical: "text-red-600 bg-red-100 border-red-200",
              high: "text-orange-600 bg-orange-100 border-orange-200",
              moderate: "text-yellow-700 bg-yellow-100 border-yellow-200",
              low: "text-green-700 bg-green-100 border-green-200"
            };
            
            const barColors = {
              critical: "bg-red-500",
              high: "bg-orange-500",
              moderate: "bg-yellow-400",
              low: "bg-green-500"
            };

            return (
              <PremiumCard key={idx} className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-1">{disease.diseaseName}</h4>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      Timeline: {disease.predictedTimeframe}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${riskColors[disease.riskLevel]}`}>
                    {disease.riskLevel} Risk
                  </span>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-bold mb-1.5 text-muted-foreground">
                    <span>Risk Score</span>
                    <span>{disease.riskScore}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-1000 ${barColors[disease.riskLevel]}`} 
                      style={{ width: `${disease.riskScore}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                  <div>
                    <h5 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Contributing Factors</h5>
                    <ul className="space-y-2">
                      {disease.contributingFactors.map((factor, i) => (
                        <li key={i} className="text-sm flex items-start gap-2 text-foreground/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive/50 mt-1.5 shrink-0" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Recommendations</h5>
                    <ul className="space-y-2">
                      {disease.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm flex items-start gap-2 text-foreground/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </PremiumCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
