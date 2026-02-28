"use client";
import React, { useEffect, useState } from "react";

export const AnimatedBackground = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1] bg-background">
      {/* High-performance Base Background */}
      <div className="bg-gradient-optimized absolute inset-0" />

      {/* GPU Accelerated Glows - Static or simple opacity pulses are smoother than movement */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-primary/5 blur-[100px] rounded-full" 
        style={{ willChange: 'opacity' }}
      />

      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[100px] rounded-full"
        style={{ willChange: 'opacity' }}
      />

      {/* Static Noise Overlay - CSS only is faster than SVG URLs */}
      <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-noise" />
    </div>
  );
};
