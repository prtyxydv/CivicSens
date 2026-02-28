"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const SectionWrapper = ({ children, className }) => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className={cn("max-w-7xl mx-auto px-6 py-20", className)}
    >
      {children}
    </motion.section>
  );
};
