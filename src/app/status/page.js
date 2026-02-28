"use client";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { CheckCircle2, Activity, Zap, Server } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export default function StatusPage() {
  return (
    <SectionWrapper className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-black uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <CheckCircle2 size={16} /> All Systems Operational
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white">System Status</h1>
        <p className="text-muted-foreground font-medium">Real-time health of the CivicSens infrastructure.</p>
      </div>

      <div className="space-y-6">
        <StatusRow name="API Gateway" status="Operational" icon={<Zap size={18} />} />
        <StatusRow name="Neural Classification Engine" status="Operational" icon={<Activity size={18} />} />
        <StatusRow name="Civic Ledger Database" status="Operational" icon={<Server size={18} />} />
        <StatusRow name="Image Processing CDN" status="Operational" icon={<CheckCircle2 size={18} />} />
      </div>

      <GlassCard className="mt-16 text-center py-12">
        <p className="text-3xl font-black tabular-nums text-white mb-2">99.99%</p>
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Uptime over the last 90 days</p>
      </GlassCard>
    </SectionWrapper>
  );
}

const StatusRow = ({ name, status, icon }) => (
  <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
    <div className="flex items-center gap-4">
      <div className="text-muted-foreground">{icon}</div>
      <span className="font-bold text-white">{name}</span>
    </div>
    <span className="text-xs font-black uppercase tracking-widest text-emerald-500">{status}</span>
  </div>
);
