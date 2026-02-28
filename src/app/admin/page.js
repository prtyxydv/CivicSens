"use client";
import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { ThemeContext } from './admin-shell';
import { 
  TrendingUp, AlertCircle, CheckCircle2, Clock, Search, MoreVertical, 
  MapPin, RefreshCw, UserPlus, Mail, ShieldAlert, Zap, ExternalLink, Image as ImageIcon,
  Copy, Check, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { GlowBorder } from '@/components/ui/GlowBorder';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0, critical: 0, resolvedToday: 0, avgLatency: '4.2h'
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

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
        const critical = data.filter(r => r.priority_level >= 3).length;
        const today = new Date().toISOString().split('T')[0];
        const resolvedToday = data.filter(r => r.status === 'Resolved' && r.updated_at?.startsWith(today)).length;
        setMetrics(prev => ({ ...prev, total: data.length, critical, resolvedToday }));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase.from('reports').update({ status: newStatus }).eq('id', id);
    if (!error) fetchDashboardData();
  };

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
    <div className="space-y-10 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-5xl font-black tracking-tighter leading-none">Command <span className="text-primary">Console</span></h2>
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-glow-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Real-time Intelligence Stream</span>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchDashboardData} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <RefreshCw className={cn("w-5 h-5 text-primary", loading && "animate-spin")} />
          </button>
          <AnimatedButton className="px-8 py-4 text-[10px] uppercase tracking-widest shadow-glow-primary">Generate Report</AnimatedButton>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon={<TrendingUp />} label="Total Syncs" value={metrics.total} color="primary" />
        <MetricCard icon={<AlertCircle />} label="Critical Nodes" value={metrics.critical} color="accent" isPriority />
        <MetricCard icon={<CheckCircle2 />} label="Resolutions" value={metrics.resolvedToday} color="cyan" />
        <MetricCard icon={<Clock />} label="Response Latency" value={metrics.avgLatency} color="primary" />
      </div>

      {/* Main Table */}
      <GlassCard className="p-0 overflow-hidden border-white/5 shadow-2xl">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-black uppercase tracking-tight italic">Active Ledger</h3>
            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black">{filteredReports.length} NODES</span>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by ID, email, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background/50 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-xs outline-none focus:border-primary/50 transition-all font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-1/4">Incident Matrix</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Submitter</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">AI Logic</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status Control</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="5" className="px-8 py-24 text-center"><Loader2 className="animate-spin w-10 h-10 text-primary mx-auto opacity-20" /></td></tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-4">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-4">
                        <Search size={32} className="text-muted-foreground" />
                      </div>
                      <h4 className="text-lg font-black text-white">No active nodes found</h4>
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                        The neural stream returned zero results for your query. Try adjusting your filters or expanding the search parameters.
                      </p>
                      <button onClick={() => setSearchTerm('')} className="mt-4 px-6 py-2 bg-primary/20 text-primary border border-primary/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/30 transition-colors">
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredReports.map((report) => (
                <tr key={report.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-8">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 relative group/img">
                        {report.image_url ? (
                          <>
                            <img src={report.image_url} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" alt="Evidence" />
                            <a href={report.image_url} target="_blank" className="absolute inset-0 bg-background/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                              <ExternalLink size={14} className="text-white" />
                            </a>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-20"><ImageIcon size={20} /></div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] text-primary font-black">#{report.ticket_id}</span>
                          <button onClick={() => copyId(report.ticket_id)} className="p-1 hover:bg-white/10 rounded transition-colors">
                            {copiedId === report.ticket_id ? <Check size={10} className="text-green-500" /> : <Copy size={10} className="text-muted-foreground" />}
                          </button>
                        </div>
                        <span className="font-black text-sm text-white truncate">{report.category || 'Unclassified'}</span>
                        <span className="text-[10px] text-muted-foreground truncate italic">"{report.description}"</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-8">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-muted-foreground"><Mail size={12} /></div>
                      <span className="text-xs font-bold text-muted-foreground">{report.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-8">
                    <div className="flex flex-col items-center gap-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black tracking-[0.2em] border shadow-sm",
                        report.priority_level >= 3 ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-red-500/10" :
                        report.priority_level === 2 ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/10" :
                        "bg-primary/10 text-primary border-primary/20 shadow-primary/10"
                      )}>P-{report.priority_level || 1}</span>
                      <span className="text-[8px] font-bold uppercase opacity-40">AI-Priority</span>
                    </div>
                  </td>
                  <td className="px-6 py-8">
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdownId(openDropdownId === report.id ? null : report.id)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                          report.status === 'Resolved' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                          report.status === 'Dispatched' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                          "bg-white/5 text-muted-foreground border-white/10"
                        )}
                      >
                        {report.status}
                        <RefreshCw size={10} className={cn("transition-transform duration-500", openDropdownId === report.id && "rotate-180")} />
                      </button>
                      <AnimatePresence>
                        {openDropdownId === report.id && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-0 mt-2 w-44 bg-background rounded-2xl shadow-2xl z-[100] p-2 border border-white/20">
                            {['Submitted', 'Verified', 'Dispatched', 'Resolved'].map((st) => (
                              <button key={st} onClick={() => { handleStatusChange(report.id, st); setOpenDropdownId(null); }} className={cn(
                                "w-full text-left px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all mb-1",
                                report.status === st ? "bg-primary text-white" : "text-muted-foreground hover:bg-white/10 hover:text-white"
                              )}>{st}</button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <div className="flex justify-end gap-3">
                      <button className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all hover:scale-110 active:scale-95 text-muted-foreground hover:text-primary">
                        <UserPlus size={16} />
                      </button>
                      <button className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all hover:scale-110 active:scale-95 text-muted-foreground hover:text-accent">
                        <ShieldAlert size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function MetricCard({ icon, label, value, color, isPriority }) {
  return (
    <GlowBorder glowColor={color === 'primary' ? "rgba(109, 40, 217, 0.4)" : color === 'accent' ? "rgba(244, 63, 94, 0.4)" : "rgba(6, 182, 212, 0.4)"}>
      <div className="p-8 space-y-6 bg-card/50">
        <div className="flex justify-between items-start">
          <div className={cn("p-3 rounded-2xl", 
            color === 'primary' ? "bg-primary/10 text-primary shadow-glow-primary/20" :
            color === 'accent' ? "bg-accent/10 text-accent" :
            "bg-cyan-500/10 text-cyan-400"
          )}>{React.cloneElement(icon, { size: 24 })}</div>
          {isPriority && <div className="px-2 py-1 bg-red-500 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse shadow-glow-accent">CRITICAL</div>}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
          <h4 className="text-4xl font-black italic tracking-tighter tabular-nums">{value}</h4>
        </div>
      </div>
    </GlowBorder>
  );
}
