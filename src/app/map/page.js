"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Loader2, Globe, ShieldCheck, Activity } from "lucide-react";

// Load map dynamically to avoid SSR errors
const Map = dynamic(() => import("@/components/DynamicMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted animate-pulse rounded-2xl flex items-center justify-center text-muted-foreground uppercase font-black tracking-widest text-xs">Initializing Neural Map...</div>
});

export default function TransparencyMapPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .not("latitude", "is", null);
      
      if (!error) setReports(data || []);
      setLoading(false);
    };
    fetchReports();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SectionWrapper className="flex-1 flex flex-col gap-12 py-12">
        <header className="space-y-6 max-w-2xl text-left">
          <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.4em] text-accent-blue">
            <Globe size={16} />
            <span>Public Transparency Protocol</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8]">Live<br /><span className="text-muted-foreground/10">Matrix.</span></h1>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed italic">
            Real-time visualization of metropolitan infrastructure anomalies. Providing complete transparency from detection to resolution.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[600px]">
          <div className="lg:col-span-3 h-full relative group">
            <div className="absolute -inset-1 bg-accent-blue/20 blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            <Map reports={reports} />
          </div>
          
          <aside className="space-y-6 overflow-y-auto custom-scrollbar pr-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 border-b border-white/5 pb-4 italic text-left">Real-time Feed</h3>
            <div className="space-y-6 text-left">
              {loading ? <Loader2 className="animate-spin text-accent-blue mx-auto" /> : 
                reports.slice(0, 5).map(r => (
                  <div key={r.id} className="space-y-2 group cursor-pointer">
                    <div className="flex justify-between items-start">
                      <p className="text-[10px] font-black text-accent-blue uppercase tracking-widest tabular-nums">#{r.ticket_id}</p>
                      <span className="text-[9px] font-bold text-foreground/20 uppercase tracking-tighter tabular-nums">{new Date(r.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs font-bold text-foreground/80 uppercase truncate group-hover:text-foreground transition-colors">{r.category}</p>
                    <div className="h-px w-0 bg-accent-blue group-hover:w-full transition-all duration-500" />
                  </div>
                ))
              }
            </div>
          </aside>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatMini label="Active Nodes" value={reports.length} icon={<Activity size={14}/>} />
          <StatMini label="System Integrity" value="99.9%" icon={<ShieldCheck size={14}/>} />
          <StatMini label="Transparency" value="Verified" icon={<Globe size={14}/>} />
        </div>
      </SectionWrapper>
    </div>
  );
}

const StatMini = ({ label, value, icon }) => (
  <div className="p-8 border border-white/5 bg-foreground/[0.01] rounded-sm space-y-4 text-left">
    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-foreground/30">
      {icon}
      <span>{label}</span>
    </div>
    <p className="text-3xl font-black uppercase text-foreground italic leading-none">{value}</p>
  </div>
);
