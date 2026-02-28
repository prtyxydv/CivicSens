"use client";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BarChart3, Globe, Shield, Zap, Sparkles, Cpu, Fingerprint } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { AIHighlightBox } from "@/components/ui/AIHighlightBox";
import { GlowBorder } from "@/components/ui/GlowBorder";

export default function LandingPage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const rotate = useTransform(scrollY, [0, 1000], [0, 45]);

  return (
    <div className="flex flex-col gap-32 pb-32">
      {/* Hero Section */}
      <SectionWrapper className="relative min-h-[70vh] flex flex-col items-center justify-center text-center overflow-visible">
        <motion.div
          style={{ y: y2 }}
          className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] z-0 opacity-20 pointer-events-none flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] blur-[100px]" />
          {/* Animated SVG Hero Illustration */}
          <svg viewBox="0 0 800 600" className="w-full h-full text-primary" stroke="currentColor" fill="none">
            <motion.path 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
              strokeWidth="1"
              d="M100 300 L200 200 L400 300 L500 150 L700 250"
            />
            <motion.circle cx="200" cy="200" r="4" fill="currentColor" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
            <motion.circle cx="400" cy="300" r="6" fill="currentColor" animate={{ scale: [1, 2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />
            <motion.circle cx="500" cy="150" r="4" fill="currentColor" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity }} />
            {/* Grid base */}
            <path strokeWidth="0.5" strokeDasharray="4 4" d="M0 400 L800 400 M0 450 L800 450 M0 500 L800 500 M200 400 L100 600 M400 400 L400 600 M600 400 L700 600" opacity="0.3" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-10 flex flex-col items-center gap-10 mt-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AIHighlightBox className="px-6 py-2 border-primary/30 shadow-glow-primary/20">
              <span className="flex items-center gap-2">
                <Sparkles size={14} className="text-primary animate-pulse" />
                Intelligence Engine v3.0 Powered by Gemini Pro
              </span>
            </AIHighlightBox>
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight leading-[0.85] text-gradient">
            Civic <br />
            <span className="text-gradient-primary">Intelligence</span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium"
          >
            A decentralized neural network for metropolitan governance. 
            Transforming community feedback into immutable civic action.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-6 mt-4"
          >
            <Link href="/dashboard">
              <AnimatedButton variant="primary" className="h-16 px-12 text-lg tracking-widest shadow-glow-primary">
                Initialize Console
              </AnimatedButton>
            </Link>
            <Link href="/dashboard">
              <AnimatedButton variant="outline" className="h-16 px-12 text-lg flex items-center gap-3 border-white/10 group">
                Audit Reports <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </AnimatedButton>
            </Link>
          </motion.div>
        </motion.div>
      </SectionWrapper>

      {/* How it Works Section */}
      <SectionWrapper className="space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter">How It <span className="text-accent">Works</span></h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">A seamless flow from citizen observation to municipal resolution.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-y-1/2 z-0" />
          {[
            { step: "01", title: "Observe & Report", desc: "Citizens capture visual matrices of infrastructure decay." },
            { step: "02", title: "Neural Sync", desc: "Gemini AI categorizes and prioritizes the anomaly instantly." },
            { step: "03", title: "Active Ledger", desc: "Admin nodes dispatch resources based on intelligence routing." }
          ].map((item, i) => (
            <GlassCard key={i} className="relative z-10 p-8 text-center space-y-4 border-white/5 bg-background/80">
              <div className="w-12 h-12 mx-auto bg-primary/20 text-primary rounded-full flex items-center justify-center font-black text-lg border border-primary/30 shadow-glow-primary">
                {item.step}
              </div>
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </GlassCard>
          ))}
        </div>
      </SectionWrapper>

      {/* Metric Section */}
      <SectionWrapper>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          <MetricBox label="Live Nodes" value="2.4k" trend="+12%" />
          <MetricBox label="Reports Synced" value="184k" trend="+5.2%" />
          <MetricBox label="Uptime" value="99.9%" trend="Stable" />
          <MetricBox label="Trust Score" value="A+" trend="Verified" />
        </div>
      </SectionWrapper>

      {/* Feature Section with 3D Interaction */}
      <SectionWrapper className="space-y-20">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Core <span className="text-primary">Protocols</span></h2>
            <p className="text-muted-foreground text-lg max-w-md">Our architecture is built on three pillars of civic technology.</p>
          </div>
          <div className="h-[1px] flex-1 bg-white/5 mb-4 hidden md:block" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ProtocolCard 
            icon={<Cpu size={32} className="text-primary" />}
            title="Neural Classification"
            description="Advanced NLP models categorize and prioritize every report based on community impact and urgency."
            delay={0.1}
          />
          <ProtocolCard 
            icon={<Fingerprint size={32} className="text-secondary" />}
            title="Immutable Ledger"
            description="Every resolution is cryptographically signed and stored in a transparent, tamper-proof history."
            delay={0.2}
          />
          <ProtocolCard 
            icon={<Zap size={32} className="text-accent" />}
            title="Predictive Response"
            description="Anticipate infrastructure failure before it occurs using historical patterns and real-time sensors."
            delay={0.3}
          />
        </div>
      </SectionWrapper>

      {/* Immersive Dashboard Preview */}
      <SectionWrapper>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <GlowBorder className="relative w-full aspect-video md:aspect-[21/9] overflow-hidden bg-slate-950/50">
            <div className="w-full h-full p-8 md:p-12 flex flex-col gap-10">
               <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Intelligence Stream</p>
                    <h3 className="text-3xl font-black">Metropolitan Analytics</h3>
                  </div>
                  <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-white/10" />
                    ))}
                  </div>
               </div>

               <div className="flex-1 grid grid-cols-12 gap-6">
                  <div className="col-span-8 glass-light rounded-3xl p-6 flex items-center justify-center border-dashed border-white/5">
                    <BarChart3 size={48} className="text-white/10 animate-pulse" />
                  </div>
                  <div className="col-span-4 space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-1/3 glass-light rounded-2xl p-4 border-white/5 flex flex-col justify-between">
                        <div className="h-2 w-1/2 bg-white/10 rounded-full" />
                        <div className="h-4 w-3/4 bg-white/5 rounded-full" />
                      </div>
                    ))}
                  </div>
               </div>
            </div>
            
            {/* Overlay CTA */}
            <div className="absolute inset-0 bg-background/40 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
               <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                 <Link href="/dashboard">
                   <AnimatedButton variant="primary" className="h-16 px-12 text-lg shadow-2xl">
                      Launch Interactive View
                   </AnimatedButton>
                 </Link>
               </motion.div>
               <p className="mt-6 text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Authorized Personnel Only</p>
            </div>
          </GlowBorder>
        </div>
      </SectionWrapper>
    </div>
  );
}

const MetricBox = ({ label, value, trend }) => (
  <GlassCard className="p-8 text-center" interactive={false}>
    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-3">{label}</p>
    <div className="flex flex-col gap-1">
      <span className="text-4xl font-black text-white">{value}</span>
      <span className="text-[10px] font-bold text-secondary">{trend}</span>
    </div>
  </GlassCard>
);

const ProtocolCard = ({ icon, title, description, delay }) => (
  <GlassCard delay={delay} className="flex flex-col gap-6 h-full border-white/5 hover:border-primary/20 transition-colors">
    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
      {icon}
    </div>
    <div className="space-y-3">
      <h3 className="text-2xl font-black tracking-tight">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed font-medium">{description}</p>
    </div>
  </GlassCard>
);
