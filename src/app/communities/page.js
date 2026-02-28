"use client";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowBorder } from "@/components/ui/GlowBorder";
import { Users, Map, Heart } from "lucide-react";

export default function CommunitiesPage() {
  return (
    <SectionWrapper className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-black tracking-tighter">Community <span className="text-secondary">Networks</span></h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Connected neighborhoods. Shared accountability. Decipher the collective pulse.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <GlowBorder glowColor="rgba(14, 165, 233, 0.5)">
          <div className="p-8 space-y-4">
            <Users className="text-secondary" size={32} />
            <h3 className="text-2xl font-bold">District Councils</h3>
            <p className="text-muted-foreground">
              Direct communication channels between residents and district leadership.
            </p>
          </div>
        </GlowBorder>

        <GlowBorder glowColor="rgba(139, 92, 246, 0.5)">
          <div className="p-8 space-y-4">
            <Map className="text-primary" size={32} />
            <h3 className="text-2xl font-bold">Neighborhood Nodes</h3>
            <p className="text-muted-foreground">
              Hyper-local hubs for rapid reporting and community-driven resolutions.
            </p>
          </div>
        </GlowBorder>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <CommunityMetric label="Active Sectors" value="48" />
        <CommunityMetric label="Total Residents" value="1.2M" />
        <CommunityMetric label="Response Success" value="94%" />
        <CommunityMetric label="Trust Index" value="High" />
      </div>
    </SectionWrapper>
  );
}

const CommunityMetric = ({ label, value }) => (
  <GlassCard className="text-center p-8 border border-white/5">
    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">{label}</p>
    <p className="text-4xl font-black text-white">{value}</p>
  </GlassCard>
);
