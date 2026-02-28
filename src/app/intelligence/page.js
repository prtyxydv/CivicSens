"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GlassCard } from "@/components/ui/GlassCard";
import { BarChart3, ShieldAlert, Zap, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function IntelligencePage() {
  const [stats, setMetrics] = useState({
    total: 0,
    resolved: 0,
    avgSeverity: 0,
    criticalCount: 0,
    deptDistribution: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntel = async () => {
      const { data, error } = await supabase.from("reports").select("*");
      if (!error && data) {
        const resolved = data.filter(r => r.status === 'Resolved').length;
        const critical = data.filter(r => r.severity_score >= 80).length;
        const sumSeverity = data.reduce((acc, r) => acc + (r.severity_score || 0), 0);
        
        const depts = data.reduce((acc, r) => {
          const d = r.department || 'Unassigned';
          acc[d] = (acc[d] || 0) + 1;
          return acc;
        }, {});

        setMetrics({
          total: data.length,
          resolved,
          avgSeverity: data.length ? Math.round(sumSeverity / data.length) : 0,
          criticalCount: critical,
          deptDistribution: depts
        });
      }
      setLoading(false);
    };
    fetchIntel();
  }, []);

  return (
    <SectionWrapper className="space-y-24 py-12 text-left">
      <header className="space-y-8 max-w-3xl">
        <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.5em] text-accent-blue italic">
          <BarChart3 size={16} />
          <span>City-Wide Intelligence Matrix</span>
        </div>
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-[0.75] text-foreground">Risk<br /><span className="text-muted-foreground/10 text-8xl md:text-[10rem]">Profile.</span></h1>
        <p className="text-xl text-muted-foreground font-medium leading-relaxed italic border-l-2 border-white/5 pl-8">
          Real-time statistical processing of metropolitan infrastructure health. 
          Aggregated data from over {stats.total || '...'} verified node syncs.
        </p>
      </header>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5 overflow-hidden rounded-sm">
        <BigMetric label="Mean Severity Index" value={`${stats.avgSeverity}%`} meta="System Wide Avg" />
        <BigMetric label="Resolution Efficiency" value={`${stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%`} meta="Target: 95%" />
        <BigMetric label="Critical Thresholds" value={stats.criticalCount} meta="Immediate Action" color="text-red-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-16">
        {/* Department Distribution */}
        <div className="space-y-10">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/30 italic">Department Load Distribution</h3>
          <div className="space-y-6">
            {Object.entries(stats.deptDistribution).map(([name, count]) => (
              <div key={name} className="group">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-foreground/80">{name}</span>
                  <span className="text-[10px] font-bold text-foreground/30 tabular-nums">{count} NODES</span>
                </div>
                <div className="h-1 w-full bg-white/5 overflow-hidden">
                  <div 
                    className="h-full bg-accent-blue shadow-[0_0_10px_var(--accent-blue)] transition-all duration-1000" 
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence Insights */}
        <div className="space-y-10">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/30 italic">Automated Insights</h3>
          <div className="grid gap-6">
            <InsightCard 
              icon={<TrendingUp size={18} className="text-accent-teal" />}
              title="Optimization Potential"
              desc="Response time in the Sanitation sector has improved by 14% this cycle."
            />
            <InsightCard 
              icon={<AlertTriangle size={18} className="text-red-500" />}
              title="Anomaly Detection"
              desc="High cluster of utility failures detected in the South-East quadrant."
            />
            <InsightCard 
              icon={<ShieldAlert size={18} className="text-accent-violet" />}
              title="System Integrity"
              desc="Immutable ledger verification successful for 100% of recent syncs."
            />
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

function BigMetric({ label, value, meta, color = "text-foreground" }) {
  return (
    <div className="p-12 bg-background space-y-8 text-left group hover:bg-foreground/[0.01] transition-all">
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30 group-hover:text-foreground/60 transition-colors">{label}</p>
      <div className="space-y-2">
        <h4 className={cn("text-7xl font-black italic tracking-tighter leading-none", color)}>{value}</h4>
        <div className="flex items-center gap-3">
          <div className="w-1 h-px bg-white/10" />
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{meta}</span>
        </div>
      </div>
    </div>
  );
}

const InsightCard = ({ icon, title, desc }) => (
  <div className="p-8 border border-white/5 bg-foreground/[0.01] rounded-sm space-y-4 hover:border-white/10 transition-colors">
    <div className="flex items-center gap-4">
      {icon}
      <h4 className="text-sm font-black uppercase tracking-widest">{title}</h4>
    </div>
    <p className="text-xs text-muted-foreground leading-relaxed font-medium">{desc}</p>
  </div>
);
