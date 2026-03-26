import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Eye, EyeOff, Shield, Mail, Lock, User, ArrowRight, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Register() {
  const { register } = useAuth();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userName, setUserName] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const user = await register(name, email, password);
      setUserName(user.name);
      setSuccess(true);
      setTimeout(() => setLocation("/onboarding"), 2500);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(34,197,94,0.1) 0%, transparent 60%), #080d14" }}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="flex flex-col items-center text-center"
        >
          <div className="relative mb-8">
            <div className="w-28 h-28 rounded-full flex items-center justify-center"
              style={{ background: "radial-gradient(circle, rgba(34,197,94,0.2), transparent)", boxShadow: "0 0 60px rgba(34,197,94,0.3)" }}>
              <CheckCircle className="w-16 h-16 text-green-400" style={{ filter: "drop-shadow(0 0 20px rgba(34,197,94,0.6))" }} />
            </div>
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Welcome, {userName}! 🎉</h1>
          <p className="text-white/50 text-lg mb-2">Account created successfully!</p>
          <p className="text-white/30 text-sm">Setting up your health profile...</p>
          <div className="mt-8 flex gap-1.5">
            {[0,1,2].map(i => (
              <motion.div key={i} className="w-2 h-2 rounded-full bg-green-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(245,158,11,0.07) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(20,184,166,0.05) 0%, transparent 50%), #080d14" }}>

      <div className="absolute top-20 right-10 w-40 h-40 rounded-full blur-[80px] opacity-15" style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }} />
      <div className="absolute bottom-30 left-10 w-40 h-40 rounded-full blur-[80px] opacity-10" style={{ background: "radial-gradient(circle, #14b8a6, transparent)" }} />

      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 0 30px rgba(245,158,11,0.4)" }}>
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-black text-white">Create Account</h1>
        <p className="text-white/40 text-sm mt-1">Start your health journey today</p>
      </div>

      <div className="w-full max-w-sm rounded-3xl border border-white/10 p-7"
        style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(20px)", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs text-white/50 font-bold uppercase tracking-wider mb-2 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="John Doe" required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white text-sm font-medium placeholder:text-white/20 outline-none border transition-all"
                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
                onFocus={e => { e.target.style.borderColor = "rgba(245,158,11,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-white/50 font-bold uppercase tracking-wider mb-2 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
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
              <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="min 6 characters" required
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

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-xl font-black text-slate-900 text-base flex items-center justify-center gap-2 transition-all active:scale-95 mt-2"
            style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: loading ? "none" : "0 0 25px rgba(245,158,11,0.4)" }}>
            {loading ? <div className="w-5 h-5 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
              : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>

      <p className="mt-6 text-white/40 text-sm text-center">
        Already have an account?{" "}
        <button onClick={() => setLocation("/login")} className="text-amber-400 font-bold hover:text-amber-300 transition-colors">Sign in</button>
      </p>
    </div>
  );
}
