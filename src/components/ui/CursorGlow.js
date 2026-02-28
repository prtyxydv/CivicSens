"use client";
import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export const CursorGlow = () => {
  const [mounted, setMounted] = useState(false);
  // Large, slow, incredibly subtle glow
  const cursorX = useSpring(-200, { stiffness: 50, damping: 30 });
  const cursorY = useSpring(-200, { stiffness: 50, damping: 30 });

  useEffect(() => {
    setMounted(true);
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 400);
      cursorY.set(e.clientY - 400);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);

  if (!mounted) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-[800px] h-[800px] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none z-0"
      style={{
        x: cursorX,
        y: cursorY,
      }}
    />
  );
};
