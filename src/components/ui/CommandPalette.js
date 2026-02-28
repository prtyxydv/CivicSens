"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutDashboard, Globe, Users, Shield, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIONS = [
  { id: "dash", title: "Dashboard", icon: <LayoutDashboard size={16} />, href: "/dashboard" },
  { id: "intel", title: "Intelligence", icon: <Globe size={16} />, href: "/intelligence" },
  { id: "comm", title: "Communities", icon: <Users size={16} />, href: "/communities" },
  { id: "admin", title: "Admin Console", icon: <Shield size={16} />, href: "/admin" },
  { id: "privacy", title: "Privacy Policy", icon: <FileText size={16} />, href: "/privacy" },
];

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filtered = ACTIONS.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (href) => {
    setIsOpen(false);
    setSearch("");
    router.push(href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh]">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
          />
          
          {/* Palette */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass"
          >
            <div className="flex items-center px-4 py-4 border-b border-white/10">
              <Search className="text-muted-foreground mr-3" size={20} />
              <input 
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type a command or search..."
                className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
              <div className="px-2 py-1 bg-white/5 rounded text-[10px] font-mono text-muted-foreground ml-3 border border-white/5">ESC</div>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No results found.</div>
              ) : (
                filtered.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleSelect(action.href)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/20 hover:text-primary transition-colors text-left text-sm font-medium text-foreground group"
                  >
                    <div className="text-muted-foreground group-hover:text-primary transition-colors">
                      {action.icon}
                    </div>
                    {action.title}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
