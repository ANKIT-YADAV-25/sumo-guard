import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Eye, EyeOff, Shield, Mail, Lock, ArrowRight } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      setLocation("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 20% 20%, rgba(245,158,11,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(20,184,166,0.06) 0%, transparent 50%), #080d14" }}>

      {/* Decorative glows */}
      <div className="absolute top-20 left-10 w-48 h-48 rounded-full blur-[80px] opacity-20" style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }} />
      <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full blur-[80px] opacity-15" style={{ background: "radial-gradient(circle, #14b8a6, transparent)" }} />

      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 relative"
          style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 0 40px rgba(245,158,11,0.4)" }}>
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Sumo Guard</h1>
        <p className="text-white/40 text-sm mt-1 font-medium">Your personal health guardian</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-3xl border border-white/10 p-7"
        style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(20px)", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
        <h2 className="text-2xl font-black text-white mb-1">Welcome back</h2>
        <p className="text-white/40 text-sm mb-7">Sign in to continue tracking your health</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-xs text-white/50 font-bold uppercase tracking-wider mb-2 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white text-sm font-medium placeholder:text-white/20 outline-none border transition-all"
                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
                onFocus={e => { e.target.style.borderColor = "rgba(245,158,11,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-white/50 font-bold uppercase tracking-wider mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-12 py-3.5 rounded-xl text-white text-sm font-medium placeholder:text-white/20 outline-none border transition-all"
                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
                onFocus={e => { e.target.style.borderColor = "rgba(245,158,11,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl p-3 text-sm text-red-400 font-bold text-center border border-red-500/20" style={{ background: "rgba(239,68,68,0.1)" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-black text-slate-900 text-base flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: loading ? "none" : "0 0 25px rgba(245,158,11,0.4)" }}>
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
            ) : (
              <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>

      <p className="mt-6 text-white/40 text-sm text-center">
        Don't have an account?{" "}
        <button onClick={() => setLocation("/register")} className="text-amber-400 font-bold hover:text-amber-300 transition-colors">
          Create one
        </button>
      </p>
    </div>
  );
}
