"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Users, MapPin, Award, ShieldCheck, Heart, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CommunitiesPage() {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectors = async () => {
      const { data, error } = await supabase.from("reports").select("latitude, longitude, status, category");
      if (!error && data) {
        // Mock sector logic based on coordinate clusters or categories for practical view
        const clusterMap = data.reduce((acc, r) => {
          const key = r.category || 'General';
          if (!acc[key]) acc[key] = { name: key, count: 0, resolved: 0 };
          acc[key].count++;
          if (r.status === 'Resolved') acc[key].resolved++;
          return acc;
        }, {});

        const sorted = Object.values(clusterMap)
          .map(s => ({ ...s, trustScore: Math.round((s.resolved / s.count) * 100) }))
          .sort((a, b) => b.trustScore - a.trustScore);
        
        setSectors(sorted);
      }
      setLoading(false);
    };
    fetchSectors();
  }, []);

  return (
    <SectionWrapper className="space-y-24 py-12 text-left">
      <header className="space-y-8 max-w-3xl">
        <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.5em] text-accent-blue italic">
          <Users size={16} />
          <span>Neighborhood Trust Network</span>
        </div>
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-[0.75] text-foreground">Social<br /><span className="text-muted-foreground/10 text-8xl md:text-[10rem]">Equity.</span></h1>
        <p className="text-xl text-muted-foreground font-medium leading-relaxed italic border-l-2 border-white/5 pl-8">
          Monitoring civic engagement and resolution success across metropolitan sectors. 
          Transparency drives accountability.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Top Performers */}
        <div className="lg:col-span-2 space-y-10">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/30 italic">Sector Trust Leaderboard</h3>
          <div className="border border-white/5 bg-foreground/[0.01] rounded-sm overflow-hidden">
            <div className="grid grid-cols-4 px-8 py-6 bg-white/5 text-[10px] font-black uppercase tracking-widest text-foreground/40">
              <div className="col-span-2">Sector Node</div>
              <div className="text-center">Activity</div>
              <div className="text-right">Trust Score</div>
            </div>
            <div className="divide-y divide-white/5">
              {sectors.map((s, i) => (
                <div key={i} className="grid grid-cols-4 px-8 py-8 items-center hover:bg-white/[0.02] transition-colors group">
                  <div className="col-span-2 flex items-center gap-6">
                    <span className="text-2xl font-black text-foreground/10 italic tabular-nums w-8">{i + 1}</span>
                    <div className="space-y-1">
                      <p className="text-sm font-black uppercase tracking-tight text-foreground/80">{s.name}</p>
                      <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-tighter italic">Verified District</p>
                    </div>
                  </div>
                  <div className="text-center text-xs font-bold text-foreground/40 tabular-nums">
                    {s.count} REPORTS
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "text-lg font-black italic tabular-nums",
                      s.trustScore > 80 ? "text-accent-teal" : s.trustScore > 50 ? "text-accent-blue" : "text-foreground/40"
                    )}>{s.trustScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Community Info */}
        <div className="space-y-12">
          <div className="editorial-card p-10 space-y-8 bg-accent-blue/5 border-accent-blue/10">
            <div className="w-12 h-12 bg-accent-blue/20 rounded-xl flex items-center justify-center text-accent-blue">
              <Award size={24} />
            </div>
            <div className="space-y-4">
              <h4 className="text-xl font-black uppercase tracking-tight">Active Rewards.</h4>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Top performing sectors receive priority budget allocation for discretionary infrastructure projects.
              </p>
            </div>
            <AnimatedButton variant="accent" className="w-full py-4 text-[10px] tracking-widest uppercase">
              Join Local Council
            </AnimatedButton>
          </div>

          <div className="space-y-8 p-10 border border-white/5 rounded-sm">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/30 italic">Network Impact</h4>
            <div className="space-y-6">
              <ImpactStat label="Verified Citizens" value="12,482" />
              <ImpactStat label="Active Councils" value="48" />
              <ImpactStat label="Collective Trust" value="High" />
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

const ImpactStat = ({ label, value }) => (
  <div className="flex justify-between items-center pb-4 border-b border-white/5">
    <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-black text-foreground uppercase italic tracking-tighter">{value}</span>
  </div>
);
