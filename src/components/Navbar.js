"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { AnimatedButton } from "./ui/AnimatedButton";
import { Cpu, LayoutDashboard, Globe, Users, Menu, X } from "lucide-react";

export const Navbar = () => {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: -100, opacity: 0 },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-6xl"
    >
      <div className="glass px-6 py-3 rounded-full flex items-center justify-between border-white/10 shadow-2xl backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent p-[2px] transition-transform duration-500 group-hover:rotate-[360deg]">
            <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
              <Cpu className="text-primary group-hover:text-accent transition-colors" size={18} />
            </div>
          </div>
          <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            CivicSens
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-2">
          <NavIconLink href="/dashboard" active={pathname === "/dashboard"} icon={<LayoutDashboard size={16} />}>Dashboard</NavIconLink>
          <NavIconLink href="/intelligence" active={pathname === "/intelligence"} icon={<Globe size={16} />}>Intelligence</NavIconLink>
          <NavIconLink href="/communities" active={pathname === "/communities"} icon={<Users size={16} />}>Communities</NavIconLink>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block">
            <AnimatedButton variant="ghost" className="px-5 py-2 text-xs">
              Log In
            </AnimatedButton>
          </Link>
          <Link href="/login?role=user">
            <AnimatedButton variant="primary" className="px-6 py-2 text-xs shadow-glow-primary">
              Get Started
            </AnimatedButton>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-muted-foreground hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 right-0 glass rounded-3xl p-6 lg:hidden flex flex-col gap-4 border-white/10"
          >
            <MobileNavLink href="/dashboard" icon={<LayoutDashboard size={18} />} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</MobileNavLink>
            <MobileNavLink href="/intelligence" icon={<Globe size={18} />} onClick={() => setIsMobileMenuOpen(false)}>Intelligence</MobileNavLink>
            <MobileNavLink href="/communities" icon={<Users size={18} />} onClick={() => setIsMobileMenuOpen(false)}>Communities</MobileNavLink>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const NavIconLink = ({ href, icon, children, active }) => (
  <Link 
    href={href} 
    className={`flex items-center gap-2 px-5 py-2 text-xs font-bold transition-all relative group rounded-full ${
      active ? "text-white" : "text-muted-foreground hover:text-white"
    }`}
  >
    {icon}
    {children}
    {active && (
      <motion.span 
        layoutId="active-pill"
        className="absolute inset-0 bg-white/5 border border-white/10 rounded-full -z-10 shadow-[0_0_15px_-3px_var(--glow-cyan)]"
      />
    )}
  </Link>
);

const MobileNavLink = ({ href, icon, children, onClick }) => (
  <Link 
    href={href} 
    onClick={onClick}
    className="flex items-center gap-3 p-4 rounded-2xl hover:bg-white/5 transition-colors text-sm font-bold"
  >
    {icon}
    {children}
  </Link>
);
