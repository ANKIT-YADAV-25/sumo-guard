import React, { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Moon,
  ActivitySquare,
  BrainCircuit,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/sleep", label: "Sleep", icon: Moon },
  { path: "/habits", label: "Habits", icon: ActivitySquare },
  { path: "/statistics", label: "Stats", icon: BrainCircuit },
  { path: "/profile", label: "Profile", icon: UserCircle },
];

const NAV_HEIGHT = 80; // px — used for paddingBottom

export default function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div
      className="flex h-screen bg-black selection:bg-primary/20 text-foreground w-full justify-center overflow-hidden"
    >
      {/* App Container — mobile-like */}
      <main className="w-full max-w-md relative flex flex-col h-full sm:border-x sm:border-border/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1d] to-[#04060b] z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-stars z-0 pointer-events-none" />

        {/* Scrollable content — flex-1 grows, pb ensures last content clears nav */}
        <div
          className="flex-1 overflow-y-auto custom-scrollbar relative z-10"
          style={{ paddingBottom: NAV_HEIGHT + 16 }}
        >
          <div className="px-5 pt-5">
            {children}
          </div>
        </div>

        {/* Bottom Nav — fixed to bottom of the container */}
        <nav
          className="shrink-0 relative z-50 border-t border-white/10"
          style={{
            height: NAV_HEIGHT,
            background: "rgba(8,13,20,0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div className="flex justify-around items-center h-full px-2">
            {NAV_ITEMS.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path} className="flex-1">
                  <div className="flex flex-col items-center gap-1 cursor-pointer group relative py-2">
                    <div
                      className={cn(
                        "p-2 rounded-xl transition-all duration-300 relative",
                        isActive ? "text-orange-400" : "text-muted-foreground group-hover:text-white"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-orange-500/20 rounded-xl blur-[4px]"
                        />
                      )}
                      <Icon
                        size={22}
                        className={cn(
                          "relative z-10 transition-all",
                          isActive
                            ? "fill-orange-500/30 stroke-[2.5px] scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                            : "group-hover:scale-105"
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-[9px] font-black transition-all uppercase tracking-widest",
                        isActive
                          ? "text-orange-400 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]"
                          : "text-muted-foreground"
                      )}
                    >
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
