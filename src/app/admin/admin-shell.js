"use client";

import React, { createContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  FileWarning,
  LayoutDashboard,
  LogOut,
  Map as MapIcon,
  Menu,
  Settings,
  ShieldCheck,
  X,
  Cpu,
  User,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

export const ThemeContext = createContext({
  isDark: true,
});

export default function AdminShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login?role=admin");
    router.refresh();
  };

  return (
    <ThemeContext.Provider value={{ isDark: true }}>
      <div className="min-h-screen flex bg-background text-foreground overflow-hidden font-sans">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: isSidebarOpen ? 280 : 80 }}
          className="relative z-50 border-r border-white/5 bg-background/50 backdrop-blur-3xl flex flex-col"
        >
          <div className="p-8 flex items-center justify-between">
            <AnimatePresence mode="wait">
              {isSidebarOpen ? (
                <motion.div
                  key="logo-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-glow-primary">
                    <ShieldCheck size={18} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-black tracking-tighter">CivicAdmin</h1>
                    <p className="text-[8px] font-bold tracking-widest uppercase opacity-40">Command Center</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="logo-icon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto"
                >
                  <ShieldCheck size={18} className="text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active={pathname === "/admin"} isOpen={isSidebarOpen} href="/admin" />
            <NavItem icon={<FileWarning size={20} />} label="Active Ledger" isOpen={isSidebarOpen} href="/admin/ledger" />
            <NavItem icon={<MapIcon size={20} />} label="Sector Radar" isOpen={isSidebarOpen} href="/admin/radar" />
            <NavItem icon={<Activity size={20} />} label="System Pulse" isOpen={isSidebarOpen} href="/admin/pulse" /> 
            <div className="pt-8 opacity-10 border-t mx-4 mb-4" />
            <NavItem icon={<Settings size={20} />} label="Node Settings" isOpen={isSidebarOpen} href="/admin/settings" />      
          </nav>

          <div className="p-6 border-t border-white/5 space-y-2">
            <button
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all text-muted-foreground hover:text-red-400 hover:bg-red-500/10",
                !isSidebarOpen && "justify-center"
              )}
            >
              <LogOut size={20} />
              {isSidebarOpen && <span className="font-black text-[10px] uppercase tracking-widest">Terminate Session</span>}
            </button>
            
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </motion.aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto relative flex flex-col">
          {/* Top Bar */}
          <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-background/50 backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operational Status: Nominal</span>
            </div>
            
            <div className="flex items-center gap-6">
              <button className="relative p-2 text-muted-foreground hover:text-white transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border-2 border-background" />
              </button>
              <div className="h-8 w-[1px] bg-white/5" />
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-tight">Root Admin</p>
                  <p className="text-[9px] font-bold text-primary">Master Node</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <User size={20} className="text-muted-foreground" />
                </div>
              </div>
            </div>
          </header>

          <div className="p-10">{children}</div>
        </main>
      </div>
    </ThemeContext.Provider>
  );
}

function NavItem({ icon, label, active = false, isOpen = true, href }) {
  return (
    <Link href={href}>
      <button
        className={cn(
          "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative",
          active 
            ? "bg-primary text-white shadow-glow-primary" 
            : "text-muted-foreground hover:bg-white/5 hover:text-white"
        )}
      >
        <span className={cn(active ? "text-white" : "text-muted-foreground group-hover:text-primary", "transition-colors")}>
          {icon}
        </span>
        {isOpen && (
          <span className="font-black text-[10px] uppercase tracking-widest">        
            {label}
          </span>
        )}
        {active && isOpen && (
          <motion.div layoutId="nav-glow" className="ml-auto w-1 h-1 rounded-full bg-white shadow-[0_0_8px_white]" />
        )}
      </button>
    </Link>
  );
}
