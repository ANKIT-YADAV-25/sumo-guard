import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

export function PremiumCard({ className, children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "glass rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/5",
        "hover:border-white/10 transition-colors duration-300",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function GradientButton({ 
  className, 
  isLoading, 
  children, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { isLoading?: boolean }) {
  return (
    <button
      disabled={isLoading || props.disabled}
      className={cn(
        "relative flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-white text-lg tracking-wide",
        "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400",
        "shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)]",
        "transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        "transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none border border-orange-300/30",
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 glass",
        "text-white placeholder:text-white/30 font-medium",
        "focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:bg-white/10",
        "transition-all duration-300",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 ml-1", className)} {...props}>
      {children}
    </label>
  );
}

export function PageHeader({ title, description }: { title: string, description: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-black gradient-text mb-1 tracking-tight drop-shadow-sm">
        {title}
      </h1>
      <p className="text-sm font-medium text-white/50">{description}</p>
    </div>
  );
}
