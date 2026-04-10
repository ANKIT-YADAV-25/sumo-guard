import React, { useEffect, useState } from "react";
import { useGetProfile, useUpdateProfile } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  User, Ruler, Weight, Calendar, Activity, Leaf, Cigarette, Wine, Beer,
  CheckCircle, Edit3, Save, X, Shield, LogOut,
} from "lucide-react";

const QUALITY_COLOR = (v: number, low: number, high: number) =>
  v >= high ? "#22c55e" : v >= low ? "#f59e0b" : "#ef4444";

function InfoChip({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center p-3 rounded-2xl border gap-1"
      style={{ background: `${color}08`, borderColor: `${color}20` }}
    >
      <div style={{ color }} className="mb-0.5">{icon}</div>
      <p className="text-lg font-black text-white leading-none">{value}</p>
      <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{label}</p>
    </div>
  );
}

function LifestyleBadge({ label, active, color }: { label: string; active: boolean; color: string }) {
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold"
      style={{
        background: active ? `${color}15` : "rgba(255,255,255,0.03)",
        borderColor: active ? `${color}40` : "rgba(255,255,255,0.08)",
        color: active ? color : "rgba(255,255,255,0.25)",
      }}
    >
      {active ? <CheckCircle size={11} /> : <X size={11} />}
      {label}
    </div>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: profile, isLoading } = useGetProfile();
  const updateMutation = useUpdateProfile();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age: 0,
    gender: "" as any,
    weight: 0,
    height: 0,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: user?.name || profile.name,
        age: profile.age,
        gender: profile.gender as "male" | "female" | "other",
        weight: profile.weight,
        height: profile.height,
      });
    }
  }, [profile, user]);

  function handleSave() {
    updateMutation.mutate(
      {
        data: {
          ...form,
          existingConditions: profile?.existingConditions || [],
          familyHistory: profile?.familyHistory || [],
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Profile updated!" });
          queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
          setEditing(false);
        },
        onError: (err: any) => {
          toast({ 
            title: "Error saving profile", 
            description: err.message, 
            variant: "destructive" 
          });
        }
      }
    );
  }

  const lifestyle = user?.lifestyle || {};
  const bmi = form.height > 0 ? Math.round((form.weight / (form.height / 100) ** 2) * 10) / 10 : 0;
  const bmiLabel = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy" : bmi < 30 ? "Overweight" : "Obese";
  const bmiColor = bmi < 18.5 ? "#6366f1" : bmi < 25 ? "#22c55e" : bmi < 30 ? "#f59e0b" : "#ef4444";

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"
          style={{ boxShadow: "0 0 20px rgba(245,158,11,0.3)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-2xl font-black text-white">Profile</h2>
          <p className="text-xs text-white/40 font-medium mt-0.5">Your health identity</p>
        </div>
        <button
          onClick={logout}
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <LogOut size={15} className="text-white/40" />
        </button>
      </div>

      {/* Avatar + Name card */}
      <div
        className="rounded-3xl border border-white/10 p-5 relative overflow-hidden"
        style={{ background: "rgba(15,23,42,0.8)" }}
      >
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 rounded-full blur-[60px] opacity-25 pointer-events-none"
          style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }} />

        <div className="flex items-center gap-4 relative z-10">
          {/* Avatar */}
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black"
              style={{
                background: "linear-gradient(135deg, rgba(245,158,11,0.3), rgba(249,115,22,0.2))",
                border: "2px solid rgba(245,158,11,0.3)",
                boxShadow: "0 0 25px rgba(245,158,11,0.2)",
                color: "#f59e0b",
              }}
            >
              {(user?.name || form.name || "U").charAt(0).toUpperCase()}
            </div>
            <div
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 0 10px rgba(245,158,11,0.4)" }}
            >
              <Shield size={14} className="text-white" />
            </div>
          </div>

          {/* Name + email */}
          <div className="flex-1">
            <h3 className="text-xl font-black text-white leading-tight">{user?.name || form.name || "User"}</h3>
            <p className="text-xs text-white/40 font-medium mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: "0 0 6px rgba(34,197,94,0.6)" }} />
              <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Active member</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <InfoChip icon={<Calendar size={16} />} label="Age" value={form.age || "—"} color="#6366f1" />
          <InfoChip icon={<Ruler size={16} />} label="Height" value={form.height ? `${form.height}cm` : "—"} color="#14b8a6" />
          <InfoChip icon={<Weight size={16} />} label="Weight" value={form.weight ? `${form.weight}kg` : "—"} color="#f59e0b" />
          <InfoChip icon={<Activity size={16} />} label="BMI" value={bmi || "—"} color={bmiColor} />
        </div>

        {form.height > 0 && form.weight > 0 && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (bmi / 40) * 100)}%`, background: `linear-gradient(90deg, ${bmiColor}60, ${bmiColor})` }} />
            </div>
            <span className="text-xs font-black shrink-0" style={{ color: bmiColor }}>{bmiLabel}</span>
          </div>
        )}
      </div>

      {/* Lifestyle section */}
      {user?.onboardingDone && (
        <div className="rounded-2xl border border-white/8 p-4" style={{ background: "rgba(15,23,42,0.6)" }}>
          <p className="text-xs font-black text-white/50 uppercase tracking-wider mb-3">Lifestyle Profile</p>
          <div className="flex flex-wrap gap-2">
            <LifestyleBadge label="Smoker" active={!!lifestyle.isSmoker} color="#ef4444" />
            <LifestyleBadge label="Drinker" active={!!lifestyle.isDrinker} color="#f59e0b" />
            <LifestyleBadge label="Heavy Alcohol" active={!!lifestyle.isAlcoholic} color="#f97316" />
            <LifestyleBadge label="Chronic Condition" active={!!lifestyle.hasChronicCondition} color="#a855f7" />
          </div>
          {lifestyle.chronicConditions && lifestyle.chronicConditions.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-2">Conditions</p>
              <div className="flex flex-wrap gap-1.5">
                {lifestyle.chronicConditions.map((c: string) => (
                  <span key={c} className="px-2.5 py-1 rounded-full text-xs font-bold text-purple-300 border border-purple-500/30"
                    style={{ background: "rgba(168,85,247,0.12)" }}>{c}</span>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="rounded-xl p-3 border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-[10px] text-white/30 font-bold">Activity</p>
              <p className="text-sm font-black text-white capitalize mt-0.5">
                {(lifestyle.activityLevel || "—").replace("_", " ")}
              </p>
            </div>
            <div className="rounded-xl p-3 border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-[10px] text-white/30 font-bold">Diet</p>
              <p className="text-sm font-black text-white capitalize mt-0.5">
                {lifestyle.dietType || "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit health profile */}
      <div className="rounded-2xl border border-white/8 p-4" style={{ background: "rgba(15,23,42,0.6)" }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-black text-white/50 uppercase tracking-wider">Health Details</p>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border border-amber-500/30 text-amber-400"
              style={{ background: "rgba(245,158,11,0.08)" }}
            >
              <Edit3 size={12} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-black border border-white/10 text-white/40"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-slate-900"
                style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}
              >
                {updateMutation.isPending ? (
                  <div className="w-3 h-3 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                ) : (
                  <><Save size={12} /> Save</>
                )}
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            {/* Age */}
            <div>
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1.5 block">Age</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm(f => ({ ...f, age: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl text-white text-sm font-bold outline-none border"
                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
              />
            </div>
            {/* Gender */}
            <div>
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1.5 block">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm(f => ({ ...f, gender: e.target.value as any }))}
                className="w-full px-4 py-3 rounded-xl text-white text-sm font-bold outline-none border appearance-none"
                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
              >
                <option value="" disabled style={{ background: "#0f172a" }}>Select Gender</option>
                <option value="male" style={{ background: "#0f172a" }}>Male</option>
                <option value="female" style={{ background: "#0f172a" }}>Female</option>
                <option value="other" style={{ background: "#0f172a" }}>Other</option>
              </select>
            </div>
            {/* Weight + Height */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1.5 block">Weight (kg)</label>
                <input
                  type="number"
                  value={form.weight}
                  onChange={(e) => setForm(f => ({ ...f, weight: Number(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm font-bold outline-none border"
                  style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1.5 block">Height (cm)</label>
                <input
                  type="number"
                  value={form.height}
                  onChange={(e) => setForm(f => ({ ...f, height: Number(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm font-bold outline-none border"
                  style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {[
              { label: "Age", value: form.age ? `${form.age} years` : "Not set", icon: <Calendar size={14} />, color: "#6366f1" },
              { label: "Gender", value: form.gender ? form.gender.charAt(0).toUpperCase() + form.gender.slice(1) : "Not set", icon: <User size={14} />, color: "#14b8a6" },
              { label: "Height", value: form.height ? `${form.height} cm` : "Not set", icon: <Ruler size={14} />, color: "#22c55e" },
              { label: "Weight", value: form.weight ? `${form.weight} kg` : "Not set", icon: <Weight size={14} />, color: "#f59e0b" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${item.color}15`, color: item.color }}>
                  {item.icon}
                </div>
                <span className="text-xs text-white/40 font-bold flex-1">{item.label}</span>
                <span className="text-sm font-black text-white">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account */}
      <div className="rounded-2xl border border-white/8 p-4" style={{ background: "rgba(15,23,42,0.6)" }}>
        <p className="text-xs font-black text-white/50 uppercase tracking-wider mb-3">Account</p>
        <div className="flex items-center gap-3 py-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>
            <User size={14} />
          </div>
          <span className="text-xs text-white/40 font-bold flex-1">Email</span>
          <span className="text-sm font-black text-white">{user?.email || "—"}</span>
        </div>
        <div className="flex items-center gap-3 py-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>
            <Calendar size={14} />
          </div>
          <span className="text-xs text-white/40 font-bold flex-1">Member since</span>
          <span className="text-sm font-black text-white">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "—"}
          </span>
        </div>

        <button
          onClick={logout}
          className="mt-4 w-full py-3 rounded-xl text-sm font-black text-red-400 border border-red-500/20 transition-all active:scale-95"
          style={{ background: "rgba(239,68,68,0.06)" }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
