"use client";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export const GlassCard = ({ children, className, delay = 0, interactive = true }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

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
      transition={{ duration: 0.4, delay, ease: [0.33, 1, 0.68, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: interactive ? rotateX : 0,
        rotateY: interactive ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "glass glass-hover rounded-[2rem] p-8 relative overflow-hidden group",
        className
      )}
    >
      <div className="relative z-10" style={{ transform: "translateZ(30px)" }}>
        {children}
      </div>
    </motion.div>
  );
};
