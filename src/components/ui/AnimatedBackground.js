"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const AnimatedBackground = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
      <div className="bg-mesh" />
      <div className="bg-grid" />
      
      {/* Hero Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_center,rgba(109,40,217,0.08)_0%,transparent_70%)] opacity-60" />

      {/* CSS Particles */}
      {[...Array(20)].map((_, i) => (
        <div 
          key={i} 
          className="particle" 
          style={{ 
            left: `${Math.random() * 100}%`, 
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }} 
        />
      ))}
    </div>
  );
};
