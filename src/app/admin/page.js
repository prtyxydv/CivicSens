"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  CheckCircle2, Search, RefreshCw, Mail, 
  Copy, Check, Loader2, Filter, ChevronDown, Camera,
  AlertTriangle, ShieldCheck, MapPin, Clock, MessageSquare, Send, X, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0, critical: 0, resolvedToday: 0, avgLatency: '4.2h'
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('priority_level', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);

      if (data) {
        const critical = data.filter(r => r.priority_level >= 7 || r.severity_score >= 80).length;
        const today = new Date().toISOString().split('T')[0];
        const resolvedToday = data.filter(r => r.status === 'Resolved' && r.updated_at?.startsWith(today)).length;
        setMetrics(prev => ({ ...prev, total: data.length, critical, resolvedToday }));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const copyId = async (id) => {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredReports = reports.filter(r =>
    r.ticket_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 py-10 max-w-7xl mx-auto px-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-border pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.4em] text-accent-blue">
            <ShieldCheck size={16} />
            <span>Master Administrative Node Active</span>
          </div>
          <h2 className="text-6xl font-black tracking-tighter uppercase leading-none text-foreground text-left">Master<br /><span className="text-muted-foreground/20">Ledger.</span></h2>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={fetchDashboardData} className="p-4 border border-border rounded-xl hover:bg-muted transition-all">
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
          <AnimatedButton variant="primary" className="px-8 py-4 text-[11px] uppercase tracking-widest !rounded-none">
            Export Audit
          </AnimatedButton>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border overflow-hidden rounded-sm">
        <MetricBox label="Total Nodes" value={metrics.total} meta="+12.4% Cycle" />
        <MetricBox label="Critical Vectors" value={metrics.critical} meta="Urgent Action" color="text-red-500" />
        <MetricBox label="Resolved Today" value={metrics.resolvedToday} meta="Efficiency" color="text-green-500" />
        <MetricBox label="Fix Latency" value={metrics.avgLatency} meta="System Average" />
      </div>

      {/* Main Stream Table */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/30">Active Intelligence Stream</h3>
            <span className="px-2 py-0.5 rounded-sm bg-muted text-foreground text-[9px] font-bold tabular-nums">{filteredReports.length} ENTRIES</span>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
            <input
              type="text"
              placeholder="Query reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-b border-border rounded-none pl-8 pr-4 py-3 text-sm outline-none focus:border-foreground transition-all font-black placeholder:text-foreground/5 uppercase tracking-widest"
            />
          </div>
        </div>

        <div className="border border-border rounded-sm overflow-hidden bg-card/40 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-foreground/40 italic">Incident Matrix</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-foreground/40 italic text-center">Triage</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-foreground/40 italic">Department</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-foreground/40 italic">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-foreground/40 italic text-right">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan="5" className="px-8 py-32 text-center"><Loader2 className="animate-spin w-8 h-8 text-foreground/20 mx-auto" /></td></tr>
                ) : filteredReports.map((report) => (
                  <tr key={report.id} className="group hover:bg-muted/30 transition-all duration-500 cursor-pointer" onClick={() => setSelectedReport(report)}>
                    <td className="px-8 py-10">
                      <div className="flex gap-8">
                        <div className="w-20 h-20 bg-muted rounded-sm overflow-hidden shrink-0 border border-border grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                          {report.image_url ? (
                            <img src={report.image_url} className="w-full h-full object-cover" alt="Report" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30"><Camera size={24} /></div>
                          )}
                        </div>
                        <div className="space-y-2 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[10px] text-foreground/30 font-black tabular-nums tracking-widest">#{report.ticket_id}</span>
                          </div>
                          <p className="font-black text-lg uppercase tracking-tighter text-foreground truncate">{report.category || 'Maintenance'}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1 italic font-medium opacity-60">&quot;{report.description}&quot;</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-10 text-center">
                      <div className="inline-flex flex-col items-center gap-2">
                        <span className={cn(
                          "px-3 py-1 rounded-sm text-[9px] font-black tracking-widest border",
                          (report.priority_level >= 7 || report.severity_score >= 80) ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-accent-blue/10 text-accent-blue border-accent-blue/20"
                        )}>SCORE-{report.severity_score || 'NA'}</span>
                        <span className="text-[8px] font-bold uppercase opacity-30 tracking-tighter italic">AI-Priority</span>
                      </div>
                    </td>
                    <td className="px-6 py-10">
                      <div className="flex flex-col space-y-1">
                        <span className="text-[10px] font-black text-foreground/80 uppercase tracking-widest">{report.department || 'Unassigned'}</span>
                        <span className="text-[9px] font-bold text-foreground/20 uppercase tracking-tighter">Department Node</span>
                      </div>
                    </td>
                    <td className="px-6 py-10">
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">
                        <div className={cn("w-1.5 h-1.5 rounded-full", 
                          report.status === 'Resolved' ? "bg-green-500 shadow-[0_0_8px_green]" : "bg-accent-blue animate-pulse"
                        )} />
                        {report.status}
                      </div>
                    </td>
                    <td className="px-8 py-10 text-right">
                      <button className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20 group-hover:text-foreground transition-all">
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Ticket Details Workspace (Modal) */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[200] flex items-center justify-end p-0 bg-background/80 backdrop-blur-md">
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-4xl h-full bg-background border-l border-white/10 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Workspace Header */}
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-foreground/[0.01]">
                <div className="space-y-2">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-accent-blue">
                    <span>Protocol Identifier</span>
                    <div className="h-px w-8 bg-accent-blue/30" />
                    <span className="tabular-nums">#{selectedReport.ticket_id}</span>
                  </div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground italic">{selectedReport.category}</h2>
                </div>
                <button onClick={() => setSelectedReport(null)} className="p-4 hover:bg-white/5 rounded-full transition-colors text-foreground/20 hover:text-foreground"><X size={32} /></button>
              </div>

              {/* Workspace Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-16">
                <div className="grid md:grid-cols-2 gap-16">
                  <div className="space-y-12">
                    <section className="space-y-6">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/30 italic">Observation Details</h4>
                      <div className="editorial-card p-8 bg-foreground/[0.02] border-white/5 text-left">
                        <p className="text-lg font-medium leading-relaxed italic text-foreground/80">&quot;{selectedReport.description}&quot;</p>
                      </div>
                    </section>

                    <div className="grid grid-cols-2 gap-8">
                      <DetailItem label="Assigned Dept" value={selectedReport.department} color="text-accent-blue" />
                      <DetailItem label="Severity Scale" value={`${selectedReport.severity_score}/100`} color="text-accent-teal" />
                      <DetailItem label="Triage Priority" value={`Level ${selectedReport.priority_level}`} />
                      <DetailItem label="Reporter Identity" value={selectedReport.email?.split('@')[0]} meta={selectedReport.email} />
                    </div>
                  </div>

                  <div className="space-y-12">
                    <section className="space-y-6">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/30 italic">Visual Matrix</h4>
                      <div className="aspect-video bg-muted rounded-sm border border-white/5 overflow-hidden group/img relative">
                        {selectedReport.image_url ? (
                          <img src={selectedReport.image_url} alt="Report evidence" className="w-full h-full object-cover grayscale opacity-80 group-hover/img:grayscale-0 group-hover/img:opacity-100 transition-all duration-1000" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-10"><Camera size={48} /></div>
                        )}
                      </div>
                    </section>

                    <section className="space-y-6">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/30 italic">Status Control</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {['Submitted', 'Verified', 'Dispatched', 'Resolved'].map((st) => (
                          <button 
                            key={st} 
                            onClick={() => handleStatusChange(selectedReport.id, st)}
                            className={cn(
                              "px-4 py-4 text-[10px] font-black uppercase tracking-widest border transition-all rounded-sm",
                              selectedReport.status === st ? "bg-accent-blue text-white border-accent-blue shadow-glow-primary" : "bg-white/5 border-white/10 text-foreground/30 hover:border-white/30"
                            )}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>

                {/* Collaboration Section */}
                <section className="space-y-8 pt-16 border-t border-white/5 text-left">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/30 italic">Internal Admin Logs</h4>
                    <span className="text-[9px] font-black uppercase tracking-widest text-accent-blue">Real-time sync</span>
                  </div>
                  
                  <div className="space-y-6">
                    <Comment sender="System AI" text="Priority recalculated based on structural impact analysis. Score updated to 84/100." time="2h ago" isAi />
                    <Comment sender="Root Admin" text="Department lead notified. Dispatching structural engineering team to Sector 5." time="1h ago" />
                  </div>

                  <div className="relative mt-12 group text-left">
                    <input 
                      placeholder="Append protocol update..." 
                      className="w-full bg-foreground/[0.03] border-b border-white/10 py-6 pr-16 outline-none focus:border-accent-blue transition-all italic text-sm" 
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-foreground/20 group-focus-within:text-accent-blue transition-all">
                      <Send size={20} />
                    </button>
                  </div>
                </section>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricBox({ label, value, meta, color = "text-foreground" }) {
  return (
    <div className="p-10 bg-card/40 space-y-6 text-left relative group overflow-hidden">
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30 group-hover:text-foreground transition-all duration-700">{label}</p>
      <div className="space-y-2">
        <h4 className={cn("text-6xl font-black italic tracking-tighter tabular-nums leading-none", color)}>{value}</h4>
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-[1px] bg-foreground/10" />
          <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest tabular-nums">{meta}</span>
        </div>
      </div>
    </div>
  );
}

const DetailItem = ({ label, value, meta, color = "text-foreground" }) => (
  <div className="space-y-2 text-left">
    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/20 italic">{label}</p>
    <div className="space-y-1">
      <p className={cn("text-xl font-black uppercase tracking-tighter", color)}>{value}</p>
      {meta && <p className="text-[10px] font-bold text-foreground/30 lowercase italic">{meta}</p>}
    </div>
  </div>
);

const Comment = ({ sender, text, time, isAi }) => (
  <div className="space-y-3 pb-6 border-b border-white/[0.02]">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <span className={cn("text-[10px] font-black uppercase tracking-widest", isAi ? "text-accent-violet" : "text-foreground/60")}>{sender}</span>
        <div className="w-1 h-1 rounded-full bg-white/10" />
        <span className="text-[9px] font-bold text-foreground/20 uppercase tabular-nums">{time}</span>
      </div>
    </div>
    <p className="text-sm font-medium leading-relaxed text-foreground/70">{text}</p>
  </div>
);
