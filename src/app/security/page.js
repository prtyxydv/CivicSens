"use client";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { ShieldCheck, Lock, Database, FileKey } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export default function SecurityPage() {
  return (
    <SectionWrapper className="max-w-4xl mx-auto space-y-16">
      <div className="space-y-4">
        <h1 className="text-5xl font-black tracking-tighter">Security & <span className="text-accent">Trust</span></h1>
        <p className="text-xl text-muted-foreground font-medium">Enterprise-grade encryption protecting civic data.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <SecurityFeature 
          icon={<Lock className="text-primary" />} 
          title="Data Encryption" 
          desc="All civic data is encrypted at rest using AES-256 and in transit via TLS 1.3 protocols."
        />
        <SecurityFeature 
          icon={<ShieldCheck className="text-accent" />} 
          title="Role-Based Access" 
          desc="Strictly enforced RBAC ensures only verified municipal administrators access PII."
        />
        <SecurityFeature 
          icon={<Database className="text-cyan-400" />} 
          title="Secure Storage" 
          desc="Immutable, geographically distributed databases prevent data loss and unauthorized tampering."
        />
        <SecurityFeature 
          icon={<FileKey className="text-emerald-500" />} 
          title="Audit Logging" 
          desc="Every system interaction is recorded, timestamped, and hashed for transparent compliance."
        />
      </div>
      
      <div className="p-8 border border-white/10 bg-white/5 rounded-3xl">
        <h3 className="text-lg font-black text-white mb-2">GDPR Readiness</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          CivicSens is built on principles of data minimization. We only collect the coordinates and descriptions required to route infrastructure requests. Personally Identifiable Information (PII) is securely isolated and managed strictly under GDPR and CCPA guidelines.
        </p>
      </div>
    </SectionWrapper>
  );
}

const SecurityFeature = ({ icon, title, desc }) => (
  <GlassCard className="space-y-4 p-8">
    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-inner">
      {icon}
    </div>
    <div>
      <h4 className="text-xl font-black text-white mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  </GlassCard>
);
