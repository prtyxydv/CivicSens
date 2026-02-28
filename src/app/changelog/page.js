"use client";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GlassCard } from "@/components/ui/GlassCard";

export default function ChangelogPage() {
  return (
    <SectionWrapper className="max-w-3xl mx-auto space-y-16">
      <div className="space-y-4">
        <h1 className="text-5xl font-black tracking-tighter">Changelog</h1>
        <p className="text-xl text-muted-foreground font-medium">New updates and improvements to CivicSens.</p>
      </div>

      <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
        
        <ChangelogItem 
          version="v3.0.0" 
          date="February 2026" 
          title="The Intelligence Engine Upgrade"
          changes={[
            "Integrated Gemini 1.5 Flash for real-time natural language classification.",
            "Complete dashboard redesign with 'Command Console' aesthetic.",
            "Added drag-and-drop file uploads with image preview.",
            "Introduced global Command Palette (Ctrl+K).",
            "Enhanced AI Assistant panel with contextual auto-suggestions."
          ]}
        />
        
        <ChangelogItem 
          version="v2.1.0" 
          date="January 2026" 
          title="Security & Scaling"
          changes={[
            "Implemented end-to-end encryption for all civic data.",
            "Added role-based access control for administrative nodes.",
            "Optimized map rendering for high-density hotspot clusters.",
          ]}
        />

        <ChangelogItem 
          version="v1.0.0" 
          date="December 2025" 
          title="Initial Beta Launch"
          changes={[
            "Basic civic reporting via text and location data.",
            "Static dashboard for issue tracking.",
            "Proof of concept deployment in District Alpha-9."
          ]}
        />

      </div>
    </SectionWrapper>
  );
}

const ChangelogItem = ({ version, date, title, changes }) => (
  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-background text-primary shadow-[0_0_15px_rgba(109,40,217,0.3)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
      <div className="w-2 h-2 rounded-full bg-primary" />
    </div>
    <GlassCard className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 !rounded-3xl hover:border-primary/30 transition-colors">
      <div className="flex flex-col gap-1 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-black text-white bg-primary/20 px-2 py-0.5 rounded text-primary">{version}</span>
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{date}</span>
        </div>
        <h3 className="text-xl font-black text-white">{title}</h3>
      </div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {changes.map((change, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-primary mt-1">-</span> {change}
          </li>
        ))}
      </ul>
    </GlassCard>
  </div>
);
