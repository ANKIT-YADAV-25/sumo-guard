import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

export function PremiumCard({ className, children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "bg-card rounded-3xl p-5 border border-border/50 shadow-lg",
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
        "relative flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-primary-foreground",
        "bg-primary hover:bg-primary/90",
        "shadow-lg shadow-primary/20",
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
        "w-full px-4 py-3 rounded-xl bg-background border border-border/60",
        "text-foreground placeholder:text-muted-foreground",
        "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary",
        "transition-all duration-200",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("block text-sm font-semibold text-muted-foreground mb-1.5", className)} {...props}>
      {children}
    </label>
  );
}

export function PageHeader({ title, description }: { title: string, description: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-extrabold text-foreground mb-1 tracking-tight">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
