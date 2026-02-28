"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const AnimatedButton = ({ 
  children, 
  onClick, 
  variant = "primary", 
  className,
  disabled = false,
  type = "button"
}) => {
  const variants = {
    primary: "bg-foreground text-background hover:bg-foreground/90",
    secondary: "bg-muted text-foreground hover:bg-muted/80 border border-border",
    outline: "bg-transparent border border-border text-foreground hover:border-foreground/40",
    accent: "bg-accent-blue text-white hover:bg-accent-blue/90",
    ghost: "bg-transparent text-muted-foreground hover:text-foreground",
    text: "bg-transparent p-0 text-foreground underline-offset-4 hover:underline"
  };

  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "text" ? "px-0 py-0" : "",
        variants[variant],
        className
      )}
    >
      {children}
    </motion.button>
  );
};
