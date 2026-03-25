import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

export function PremiumCard({ className, children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl p-6 md:p-8",
        "shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]",
        "transition-all duration-300",
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
        "relative flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-white",
        "bg-gradient-to-r from-primary to-teal-500",
        "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40",
        "transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        "transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none",
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
        "w-full px-4 py-3 rounded-xl bg-background/50 border-2 border-border/60",
        "text-foreground placeholder:text-muted-foreground/70",
        "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10",
        "transition-all duration-200",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("block text-sm font-semibold text-foreground/80 mb-1.5", className)} {...props}>
      {children}
    </label>
  );
}

export function PageHeader({ title, description }: { title: string, description: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2 tracking-tight">
        {title}
      </h1>
      <p className="text-lg text-muted-foreground">{description}</p>
    </div>
  );
}
