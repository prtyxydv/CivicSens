"use client";
import { cn } from "@/lib/utils";

export const GlowBorder = ({ children, className, glowColor = "rgba(139, 92, 246, 0.5)" }) => {
  return (
    <div className={cn("relative group p-[1px] rounded-2xl overflow-hidden", className)}>
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{ 
          background: `conic-gradient(from 0deg at 50% 50%, ${glowColor} 0deg, transparent 60deg, transparent 300deg, ${glowColor} 360deg)` 
        }}
      />
      <div className="relative glass rounded-2xl z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
};
