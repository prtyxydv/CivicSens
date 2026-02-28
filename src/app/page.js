"use client";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  
  // Scroll-linked movement: Moves as you scroll
  const xTranslate = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const xTranslateReverse = useTransform(scrollYProgress, [0, 1], ["-30%", "0%"]);

  // Mouse reaction wiggle
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const wiggleX = useTransform(smoothMouseX, [-500, 500], [-20, 20]);
  const wiggleY = useTransform(smoothMouseY, [-500, 500], [-10, 10]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="flex flex-col bg-background relative overflow-x-hidden min-h-screen">
      
      {/* Interactive Background Typography Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
        <motion.div 
          style={{ x: xTranslate, y: wiggleY, skewX: wiggleX }}
          className="absolute top-24 left-0 whitespace-nowrap text-[25vw] font-black tracking-tighter leading-none uppercase select-none italic"
        >
          CIVIC REPORTING SYSTEM &bull; CIVIC REPORTING SYSTEM
        </motion.div>
        
        <motion.div 
          style={{ x: xTranslateReverse, y: wiggleY, skewX: wiggleX }}
          className="absolute bottom-24 left-0 whitespace-nowrap text-[25vw] font-black tracking-tighter leading-none uppercase select-none italic"
        >
          CITY MAINTENANCE &bull; CITY MAINTENANCE
        </motion.div>
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center gap-8 max-w-3xl mx-auto"
        >
          <div className="space-y-6 text-center">
            <span className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
              Smart City Reporting
            </span>
            
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-tight text-foreground">
              Fix Your City.
            </h1>
          </div>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-normal balance">
            The easiest way to report potholes, broken lights, and maintenance needs. 
            Track every fix in real-time without the hassle.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 mt-6">
            <Link href="/dashboard">
              <AnimatedButton variant="primary">
                Report an Issue
              </AnimatedButton>
            </Link>
            <Link href="/dashboard">
              <AnimatedButton variant="outline">
                Check Progress
              </AnimatedButton>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 2. PROCESS SECTION */}
      <section className="relative min-h-screen flex items-center bg-muted/20 px-6 py-24 z-10 border-t border-border">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center w-full text-left">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">How it Works</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Reporting a problem takes less than a minute. We notify the right city department immediately so it gets fixed faster.
            </p>
          </motion.div>
          
          <div className="grid gap-12">
            <ProcessStep number="01" title="Snap a photo" desc="Upload a picture of the issue and we'll automatically find the location." />
            <ProcessStep number="02" title="Smart Sorting" desc="Our system automatically identifies the type of problem and how urgent it is." />
            <ProcessStep number="03" title="Fast Resolution" desc="The right city team is assigned to fix it and you are kept updated." />
          </div>
        </div>
      </section>

      {/* 3. STATS SECTION */}
      <section className="relative flex flex-col justify-center px-6 py-32 z-10 border-t border-border bg-background">
        <div className="max-w-6xl mx-auto w-full space-y-16 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Live Impact</h2>
            <p className="text-muted-foreground text-lg">System statistics in real-time</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x divide-border">
            <MetricItem label="Active Fixes" value="2.4k" />
            <MetricItem label="Total Reports" value="184k" />
            <MetricItem label="Uptime" value="99.9%" />
            <MetricItem label="Trust Score" value="A+" />
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="relative py-20 px-6 text-left z-10 border-t border-border bg-muted/20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-16 w-full text-left">
          <div className="space-y-6">
            <span className="text-xl font-bold tracking-tight text-foreground">CivicSens</span>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
              Better technology.<br />
              Better cities.
            </p>
          </div>
          <FooterGroup title="Menu" links={[{label: "Dashboard", href: "/dashboard"}, {label: "Intelligence", href: "/intelligence"}, {label: "Status", href: "/status"}]} />
          <FooterGroup title="Privacy" links={[{label: "Privacy Policy", href: "/privacy"}, {label: "Terms of Service", href: "/terms"}]} />
          <FooterGroup title="About" links={[{label: "Our Story", href: "/about"}, {label: "Updates", href: "/changelog"}]} />
        </div>
      </footer>
    </div>
  );
}

const ProcessStep = ({ number, title, desc }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    viewport={{ once: true, margin: "-100px" }}
    className="flex gap-8 items-start text-left"
  >
    <span className="text-3xl font-bold text-muted-foreground/30 tabular-nums">{number}</span>
    <div className="space-y-2">
      <h3 className="text-xl font-bold tracking-tight text-foreground">{title}</h3>
      <p className="text-base text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

const MetricItem = ({ label, value }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.98 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
    viewport={{ once: true, margin: "-100px" }}
    className="space-y-4 group"
  >
    <p className="text-sm font-medium tracking-wide text-muted-foreground">{label}</p>
    <p className="text-4xl md:text-5xl font-bold tabular-nums tracking-tight text-foreground">{value}</p>
  </motion.div>
);

const FooterGroup = ({ title, links }) => (
  <div className="space-y-6 text-left">
    <h4 className="text-sm font-semibold tracking-wide text-foreground">{title}</h4>
    <ul className="space-y-4">
      {links.map((link, i) => (
        <li key={i}>
          <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);
