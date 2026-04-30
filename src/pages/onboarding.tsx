import React, { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Cigarette, Wine, Beer, Heart, Activity, Salad, ArrowRight, ArrowLeft, CheckCircle, X, TrendingDown, Zap, Leaf, Sprout, Flame, Apple } from "lucide-react";

interface ToggleCardProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  active: boolean;
  onClick: () => void;
  color: string;
  glow: string;
}

function ToggleCard({ icon, label, sublabel, active, onClick, color, glow }: ToggleCardProps) {
  return (
    <button onClick={onClick}
      className={cn(
        "group flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 text-left w-full active:scale-95",
        active ? "border-transparent" : "border-white/10"
      )}
      style={{
        background: active ? `${color}15` : "rgba(255,255,255,0.03)",
        borderColor: active ? `${color}60` : "rgba(255,255,255,0.08)",
        boxShadow: active ? `0 0 25px ${color}20` : "none",
      }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
        style={{ 
          background: active ? `${color}35` : "rgba(255,255,255,0.05)",
          border: active ? `1px solid ${color}40` : "1px solid transparent"
        }}>
        <div style={{ color: active ? color : "rgba(255,255,255,0.4)", opacity: active ? 1 : 0.6 }}>{icon}</div>
      </div>
      <div className="flex-1">
        <p className="font-bold text-sm" style={{ color: active ? "white" : "rgba(255,255,255,0.5)" }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: active ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)" }}>{sublabel}</p>
      </div>
      <div className="shrink-0">
        {active
          ? <CheckCircle className="w-5 h-5" style={{ color }} />
          : <div className="w-5 h-5 rounded-full border-2 border-white/15" />}
      </div>
    </button>
  );
}

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary", sub: "Little to no exercise", icon: <TrendingDown size={28} strokeWidth={3} />, color: "#94a3b8", glow: "rgba(148,163,184,0.15)" },
  { value: "light", label: "Light", sub: "1–2 days/week", icon: <Activity size={28} strokeWidth={3} />, color: "#38bdf8", glow: "rgba(56,189,248,0.15)" },
  { value: "moderate", label: "Moderate", sub: "3–4 days/week", icon: <Zap size={28} strokeWidth={3} />, color: "#14b8a6", glow: "rgba(20,184,166,0.15)" },
  { value: "active", label: "Active", sub: "5–6 days/week", icon: <Activity size={28} strokeWidth={3} />, color: "#f59e0b", glow: "rgba(245,158,11,0.15)" },
  { value: "very_active", label: "Very Active", sub: "Daily intense exercise", icon: <CheckCircle size={28} strokeWidth={3} />, color: "#ef4444", glow: "rgba(239,68,68,0.15)" },
];

const DIET_TYPES = [
  { value: "standard", label: "Standard", sub: "Mixed diet", icon: <Salad size={28} strokeWidth={3} />, color: "#22c55e", glow: "rgba(34,197,94,0.15)" },
  { value: "vegetarian", label: "Vegetarian", sub: "No meat", icon: <Leaf size={28} strokeWidth={3} />, color: "#4ade80", glow: "rgba(74,222,128,0.15)" },
  { value: "vegan", label: "Vegan", sub: "No animal products", icon: <Sprout size={28} strokeWidth={3} />, color: "#14b8a6", glow: "rgba(20,184,166,0.15)" },
  { value: "keto", label: "Keto", sub: "High fat, low carb", icon: <Flame size={28} strokeWidth={3} />, color: "#f59e0b", glow: "rgba(245,158,11,0.15)" },
  { value: "paleo", label: "Paleo", sub: "Whole foods", icon: <Apple size={28} strokeWidth={3} />, color: "#f97316", glow: "rgba(249,115,22,0.15)" },
];

export default function Onboarding() {
  const { saveOnboarding, user } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    isSmoker: false,
    isDrinker: false,
    isAlcoholic: false,
    hasChronicCondition: false,
    chronicConditions: [] as string[],
    activityLevel: "moderate",
    dietType: "standard",
  });

  const [conditionInput, setConditionInput] = useState("");

  function toggle(key: keyof typeof form) {
    setForm(f => ({ ...f, [key]: !f[key] }));
  }

  function addCondition() {
    const val = conditionInput.trim();
    if (val && !form.chronicConditions.includes(val)) {
      setForm(f => ({ ...f, chronicConditions: [...f.chronicConditions, val] }));
    }
    setConditionInput("");
  }

  function removeCondition(c: string) {
    setForm(f => ({ ...f, chronicConditions: f.chronicConditions.filter(x => x !== c) }));
  }

  const [error, setError] = useState("");

  async function handleFinish() {
    setLoading(true);
    setError("");
    try {
      await saveOnboarding(form);
      setLocation("/");
    } catch (err: any) {
      console.error("Onboarding save failed:", err);
      setError(err.message || "Failed to save. Please check your internet connection and try again.");
      setLoading(false);
    }
  }

  const steps = [
    {
      title: "Lifestyle Habits",
      sub: "Help us personalise your risk predictions",
      content: (
        <div className="space-y-3">
          <ToggleCard icon={<Cigarette size={20} />} label="I Smoke" sublabel="Cigarette or tobacco user"
            active={form.isSmoker} onClick={() => toggle("isSmoker")} color="#ef4444" glow="rgba(239,68,68,0.2)" />
          <ToggleCard icon={<Beer size={20} />} label="I Drink Alcohol" sublabel="Regular alcohol consumption"
            active={form.isDrinker} onClick={() => toggle("isDrinker")} color="#f59e0b" glow="rgba(245,158,11,0.2)" />
          <ToggleCard icon={<Wine size={20} />} label="Heavy Drinker / Alcoholic" sublabel="Daily or heavy alcohol use"
            active={form.isAlcoholic} onClick={() => toggle("isAlcoholic")} color="#f97316" glow="rgba(249,115,22,0.2)" />
          <ToggleCard icon={<Heart size={20} />} label="Chronic Condition" sublabel="Diabetes, hypertension, etc."
            active={form.hasChronicCondition} onClick={() => toggle("hasChronicCondition")} color="#a855f7" glow="rgba(168,85,247,0.2)" />

          {form.hasChronicCondition && (
            <div className="rounded-2xl border border-purple-500/20 p-4" style={{ background: "rgba(168,85,247,0.05)" }}>
              <p className="text-xs text-white/40 font-bold uppercase tracking-wider mb-3">Your Conditions</p>
              <div className="flex gap-2 mb-3">
                <input value={conditionInput} onChange={e => setConditionInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCondition())}
                  placeholder="e.g. diabetes, asthma..."
                  className="flex-1 px-3 py-2 rounded-xl text-white text-sm outline-none border border-white/10 placeholder:text-white/20"
                  style={{ background: "rgba(255,255,255,0.05)" }} />
                <button onClick={addCondition} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-900"
                  style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}>Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.chronicConditions.map(c => (
                  <span key={c} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-purple-300 border border-purple-500/30"
                    style={{ background: "rgba(168,85,247,0.15)" }}>
                    {c}
                    <button onClick={() => removeCondition(c)}><X size={12} /></button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Activity Level",
      sub: "How active are you in a typical week?",
      content: (
        <div className="space-y-3">
          {ACTIVITY_LEVELS.map(opt => (
            <ToggleCard 
              key={opt.value}
              icon={opt.icon}
              label={opt.label}
              sublabel={opt.sub}
              active={form.activityLevel === opt.value}
              onClick={() => setForm(f => ({ ...f, activityLevel: opt.value }))}
              color={opt.color}
              glow={opt.glow}
            />
          ))}
        </div>
      ),
    },
    {
      title: "Diet Type",
      sub: "What best describes your eating habits?",
      content: (
        <div className="space-y-3">
          {DIET_TYPES.map(opt => (
            <ToggleCard 
              key={opt.value}
              icon={opt.icon}
              label={opt.label}
              sublabel={opt.sub}
              active={form.dietType === opt.value}
              onClick={() => setForm(f => ({ ...f, dietType: opt.value }))}
              color={opt.color}
              glow={opt.glow}
            />
          ))}
        </div>
      ),
    },
  ];

  const isLast = step === steps.length - 1;

  return (
    <div className="min-h-screen flex flex-col px-5 pt-16 pb-10 relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 10%, rgba(245,158,11,0.07) 0%, transparent 50%), #080d14" }}>

      <div className="absolute top-10 right-10 w-40 h-40 rounded-full blur-[80px] opacity-15"
        style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }} />

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-white/30 font-bold uppercase tracking-wider">Step {step + 1} of {steps.length}</p>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 font-bold transition-colors">
              <ArrowLeft size={14} /> Back
            </button>
          )}
        </div>
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className="h-1 rounded-full flex-1 transition-all duration-500"
              style={{ background: i <= step ? "linear-gradient(90deg, #f59e0b, #f97316)" : "rgba(255,255,255,0.08)" }} />
          ))}
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }} className="flex-1">
          <h2 className="text-2xl font-black text-white mb-1">{steps[step].title}</h2>
          <p className="text-white/40 text-sm mb-6">{steps[step].sub}</p>
          <div className="overflow-y-auto">{steps[step].content}</div>
        </motion.div>
      </AnimatePresence>

      {/* CTA */}
      <div className="mt-8">
        {error && (
          <div className="rounded-xl p-3 text-sm text-red-400 font-bold text-center border border-red-500/20 mb-4" style={{ background: "rgba(239,68,68,0.1)" }}>
            {error}
          </div>
        )}
        {isLast ? (
          <button onClick={handleFinish} disabled={loading}
            className="w-full py-4 rounded-2xl font-black text-slate-900 text-base flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 0 25px rgba(245,158,11,0.4)" }}>
            {loading
              ? <div className="w-5 h-5 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
              : <><span>Start Tracking Health</span><ArrowRight size={18} /></>}
          </button>
        ) : (
          <button onClick={() => setStep(s => s + 1)}
            className="w-full py-4 rounded-2xl font-black text-slate-900 text-base flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 0 25px rgba(245,158,11,0.4)" }}>
            <span>Continue</span><ArrowRight size={18} />
          </button>
        )}
        {!isLast && (
          <button onClick={() => setStep(s => s + 1)}
            className="w-full py-3 text-center text-white/30 text-sm font-bold hover:text-white/50 transition-colors mt-2">
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
