"use client";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GlassCard } from "@/components/ui/GlassCard";
import { AIHighlightBox } from "@/components/ui/AIHighlightBox";
import { BrainCircuit, Search, Database } from "lucide-react";

export default function IntelligencePage() {
  return (
    <SectionWrapper className="space-y-12">
      <div className="text-center space-y-4">
        <AIHighlightBox className="inline-flex">Civic Neural Network v2.0</AIHighlightBox>
        <h1 className="text-6xl font-black tracking-tighter">Civic <span className="text-primary">Intelligence</span></h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Deep analytics and predictive models derived from decentralized community data.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <GlassCard className="space-y-4">
          <BrainCircuit className="text-primary" size={32} />
          <h3 className="text-xl font-bold">Sentiment Analysis</h3>
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            Real-time emotional mapping of district-level feedback.
          </p>
        </GlassCard>
        
        <GlassCard className="space-y-4">
          <Search className="text-secondary" size={32} />
          <h3 className="text-xl font-bold">Anomaly Detection</h3>
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            AI-driven identification of infrastructure failures before they are reported.
          </p>
        </GlassCard>

        <GlassCard className="space-y-4">
          <Database className="text-accent" size={32} />
          <h3 className="text-xl font-bold">Historical Ledger</h3>
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            Immutable record of all civic actions and resolutions.
          </p>
        </GlassCard>
      </div>

      <div className="h-64 glass rounded-3xl flex items-center justify-center border-dashed border-white/10">
        <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.5em] animate-pulse">
          Initializing Intelligence Stream...
        </p>
      </div>
    </SectionWrapper>
  );
}
