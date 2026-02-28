"use client";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GlowBorder } from "@/components/ui/GlowBorder";

export default function AboutPage() {
  return (
    <SectionWrapper className="max-w-4xl mx-auto space-y-12">
      <div className="space-y-4">
        <h1 className="text-5xl font-black tracking-tighter">About <span className="text-primary">CivicSens</span></h1>
        <p className="text-xl text-muted-foreground font-medium">Reimagining urban governance through decentralized artificial intelligence.</p>
      </div>

      <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
        <p>
          CivicSens was founded on a singular premise: the belief that a city is only as intelligent as the communication network connecting its citizens to its infrastructure. Traditional municipal reporting systems are siloed, reactive, and fundamentally slow.
        </p>
        <p>
          We built CivicSens to introduce a proactive, AI-driven layer to civic management. By processing citizen reports through advanced neural networks, we automatically classify, prioritize, and route structural issues in real-time.
        </p>
      </div>

      <GlowBorder glowColor="rgba(109, 40, 217, 0.3)">
        <div className="p-8 md:p-12 space-y-6 bg-card/50">
          <h3 className="text-2xl font-black text-white">Our Mission</h3>
          <p className="text-muted-foreground leading-relaxed">
            To eliminate the latency between urban decay and municipal response, fostering safer, more resilient metropolitan environments worldwide.
          </p>
        </div>
      </GlowBorder>
    </SectionWrapper>
  );
}
