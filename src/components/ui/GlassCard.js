"use client";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export const GlassCard = ({ children, className, delay = 0, interactive = true }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["4deg", "-4deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"]);

  const handleMouseMove = (e) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.23, 1, 0.32, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: interactive ? rotateX : 0,
        rotateY: interactive ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "glass-panel p-8 relative overflow-hidden group rounded-2xl hover-lift",
        className
      )}
    >
      <div className="relative z-10" style={{ transform: "translateZ(30px)" }}>
        {children}
      </div>
      
      {/* Dynamic Inner Glow */}
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(255,255,255,0.03)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
        style={{
          "--x": useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]),
          "--y": useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]),
        }}
      />
    </motion.div>
  );
};
