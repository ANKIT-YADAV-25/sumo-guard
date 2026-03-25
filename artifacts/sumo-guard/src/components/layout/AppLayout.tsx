import React, { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Moon, 
  ActivitySquare, 
  BrainCircuit, 
  UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/sleep", label: "Sleep", icon: Moon },
  { path: "/habits", label: "Habits", icon: ActivitySquare },
  { path: "/predictions", label: "Statistics", icon: BrainCircuit },
  { path: "/profile", label: "Profile", icon: UserCircle },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen bg-black overflow-hidden selection:bg-primary/20 text-foreground w-full justify-center">
      {/* App Container for mobile-like feel */}
      <main className="w-full max-w-md relative flex flex-col h-full overflow-hidden sm:border-x sm:border-border/30 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
        {/* Background gradient and stars */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1d] to-[#04060b] z-0" />
        <div className="absolute inset-0 bg-stars z-0 pointer-events-none" />

        <div className="flex-1 overflow-y-auto p-5 pb-28 custom-scrollbar relative z-10">
          <div className="h-full">
            {children}
          </div>
        </div>

        {/* Bottom Nav */}
        <nav className="absolute bottom-0 left-0 w-full glass border-t border-white/10 z-50 pb-safe">
          <div className="flex justify-around items-center px-2 py-4">
            {NAV_ITEMS.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path} className="flex-1">
                  <div className="flex flex-col items-center gap-1.5 cursor-pointer group relative">
                    <div className={cn(
                      "p-2 rounded-xl transition-all duration-300 relative",
                      isActive ? "text-orange-400" : "text-muted-foreground group-hover:text-white"
                    )}>
                      {isActive && (
                        <motion.div 
                          layoutId="nav-pill" 
                          className="absolute inset-0 bg-orange-500/20 rounded-xl blur-[4px]" 
                        />
                      )}
                      <Icon size={24} className={cn("relative z-10 transition-all", isActive ? "fill-orange-500/30 stroke-[2.5px] scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" : "group-hover:scale-105")} />
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold transition-all uppercase tracking-widest",
                      isActive ? "text-orange-400 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]" : "text-muted-foreground"
                    )}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </main>
    </div>
  );
}
