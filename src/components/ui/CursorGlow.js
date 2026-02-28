"use client";
import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export const CursorGlow = () => {
  const [mounted, setMounted] = useState(false);
  const cursorX = useSpring(-100, { stiffness: 250, damping: 20 });
  const cursorY = useSpring(-100, { stiffness: 250, damping: 20 });

  useEffect(() => {
    setMounted(true);
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 150);
      cursorY.set(e.clientY - 150);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);

  if (!mounted) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none z-[9999]"
      style={{
        x: cursorX,
        y: cursorY,
      }}
    />
  );
};
