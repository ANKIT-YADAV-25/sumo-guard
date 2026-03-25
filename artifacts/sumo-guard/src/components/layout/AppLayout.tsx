import React, { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Moon, 
  ActivitySquare, 
  BrainCircuit, 
  UserCircle,
  ShieldPlus
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/sleep", label: "Sleep Logs", icon: Moon },
  { path: "/habits", label: "Daily Habits", icon: ActivitySquare },
  { path: "/predictions", label: "Predictions", icon: BrainCircuit },
  { path: "/profile", label: "Profile", icon: UserCircle },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/20">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-card border-r border-border shadow-xl shadow-black/5 z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/20 text-white">
            <ShieldPlus size={24} strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-foreground">
            Sumo Guard
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} className="block">
                <div className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold transition-all duration-200 cursor-pointer relative overflow-hidden group",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}>
                  <Icon size={20} className={cn("transition-transform duration-300", isActive && "scale-110")} />
                  {item.label}
                  {isActive && (
                    <motion.div 
                      layoutId="active-nav-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full" 
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6 m-4 bg-gradient-to-br from-primary/10 to-teal-500/5 rounded-3xl border border-primary/10">
          <p className="text-sm font-semibold text-primary mb-1">Stay consistent!</p>
          <p className="text-xs text-muted-foreground leading-relaxed">Logging daily improves your prediction accuracy.</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none -z-10" />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 pb-24 md:pb-10">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-card/80 backdrop-blur-xl border-t border-border z-50 pb-safe">
        <div className="flex justify-around items-center px-2 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} className="flex-1">
                <div className="flex flex-col items-center gap-1 cursor-pointer">
                  <div className={cn(
                    "p-2 rounded-xl transition-all duration-200",
                    isActive ? "bg-primary/15 text-primary" : "text-muted-foreground"
                  )}>
                    <Icon size={22} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-semibold",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
