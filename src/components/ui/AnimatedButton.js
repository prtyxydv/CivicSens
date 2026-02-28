"use client";
import { useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export const AnimatedButton = ({ 
  children, 
  onClick, 
  variant = "primary", 
  className,
  disabled = false
}) => {
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 150, damping: 15 });
  const y = useSpring(0, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const { left, top, width, height } = rect;
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    // Magnetic strength
    x.set(distanceX * 0.2);
    y.set(distanceY * 0.2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const variants = {
    primary: "bg-primary text-primary-foreground shadow-[0_0_20px_-5px_var(--primary)]",
    secondary: "bg-accent text-accent-foreground shadow-[0_0_20px_-5px_var(--accent)]",
    outline: "border border-white/10 hover:bg-white/5 hover:border-white/20",
    ghost: "hover:bg-white/5",
  };

  return (
    <motion.button
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative px-8 py-3.5 rounded-2xl font-bold transition-all duration-300 cursor-pointer overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed group",
        variants[variant],
        className
      )}
    >
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};
