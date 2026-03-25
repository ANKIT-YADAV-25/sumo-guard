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
      <main className="w-full max-w-md relative flex flex-col h-full overflow-hidden bg-background shadow-2xl shadow-black/50 sm:border-x sm:border-border/30">
        
        <div className="flex-1 overflow-y-auto p-5 pb-28 custom-scrollbar">
          <div className="h-full">
            {children}
          </div>
        </div>

        {/* Bottom Nav */}
        <nav className="absolute bottom-0 left-0 w-full bg-card/95 backdrop-blur-xl border-t border-border z-50 pb-safe">
          <div className="flex justify-around items-center px-2 py-4">
            {NAV_ITEMS.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path} className="flex-1">
                  <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
                    <div className={cn(
                      "p-1.5 rounded-full transition-all duration-300 relative",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                      {isActive && (
                        <motion.div 
                          layoutId="nav-pill" 
                          className="absolute inset-0 bg-primary/10 rounded-full" 
                        />
                      )}
                      <Icon size={24} className={cn("relative z-10", isActive ? "fill-primary/20 stroke-primary" : "")} />
                    </div>
                    <span className={cn(
                      "text-[10px] font-semibold transition-colors",
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
      </main>
    </div>
  );
}
