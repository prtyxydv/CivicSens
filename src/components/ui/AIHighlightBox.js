"use client";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const AIHighlightBox = ({ children, className }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={cn(
        "relative p-4 rounded-xl border border-primary/20 bg-primary/5 shadow-glow-purple",
        className
      )}
    >
      <div className="absolute -top-3 -right-3 p-1.5 rounded-full bg-primary shadow-lg">
        <Sparkles size={14} className="text-white" />
      </div>
      <div className="text-sm font-medium text-primary-foreground/90 italic">
        {children}
      </div>
    </motion.div>
  );
};
