"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  MapPin,
  RefreshCw,
  UserPlus
} from 'lucide-react';

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    critical: 0,
    resolvedToday: 0,
    avgLatency: '0h'
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- 1. DATA FETCHING ---
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all reports
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('priority_level', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);

      // Calculate Metrics
      if (data) {
        const total = data.length;
        const critical = data.filter(r => r.priority_level === 3).length;
        
        const today = new Date().toISOString().split('T')[0];
        const resolvedToday = data.filter(r => 
          r.status === 'Resolved' && 
          r.updated_at && 
          r.updated_at.startsWith(today)
        ).length;

        // Calculate average latency (mock for prototype)
        setMetrics({
          total,
          critical,
          resolvedToday,
          avgLatency: '4.2h' // This could be calculated from created_at vs updated_at
        });
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- 2. ACTIONS ---
  const handleStatusChange = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Verified' ? 'Dispatched' : currentStatus === 'Dispatched' ? 'Resolved' : 'Verified';
    const { error } = await supabase.from('reports').update({ status: nextStatus }).eq('id', id);
    if (!error) fetchDashboardData();
  };

  // --- 3. FILTERED DATA ---
  const filteredReports = reports.filter(r => 
    r.ticket_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div>
          <h2 className="text-5xl font-black tracking-tighter leading-none mb-3">Dashboard <span className="text-blue-500">Overview</span></h2>
          <p className="text-slate-400 font-medium tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            System uptime 99.9% • Real-time AI classification active
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchDashboardData}
            className="p-4 bg-slate-900 border border-slate-800 rounded-[1.5rem] hover:bg-slate-800 transition-all text-slate-400"
          >
            <RefreshCw className={`w-5 h-5 ${loading && 'animate-spin'}`} />
          </button>
          <button className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all active:scale-95">
            Generate Report
          </button>
        </div>
      </div>

      {/* --- METRIC CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon={<TrendingUp />} label="Total Reports" value={metrics.total} color="blue" />
        <MetricCard icon={<AlertCircle />} label="Critical Issues" value={metrics.critical} color="red" isPriority />
        <MetricCard icon={<CheckCircle2 />} label="Resolved Today" value={metrics.resolvedToday} color="emerald" />
        <MetricCard icon={<Clock />} label="Avg Latency" value={metrics.avgLatency} color="amber" />
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* --- AI-PRIORITIZED TABLE --- */}
        <div className="lg:col-span-8">
          <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-black italic tracking-tight uppercase">Live Ledger</h3>
                <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black">{filteredReports.length} Items</span>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Filter by ID, category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Incident</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Priority</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                          <RefreshCw className="animate-spin w-8 h-8" />
                          <span className="font-bold text-xs uppercase tracking-widest">Syncing AI Ledger...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center opacity-30 font-bold text-xs uppercase tracking-widest">
                        No reports found.
                      </td>
                    </tr>
                  ) : filteredReports.map((report) => (
                    <tr key={report.id} className={`group hover:bg-slate-800/20 transition-colors ${report.priority_level === 3 && 'bg-red-500/5'}`}>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-blue-500 font-bold mb-1">#{report.ticket_id}</span>
                          <span className="font-black text-slate-100">{report.category}</span>
                          <span className="text-[10px] text-slate-500 font-medium max-w-[200px] truncate">{report.description}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border ${
                            report.priority_level === 3 
                              ? 'bg-red-500/20 text-red-500 border-red-500/30' 
                              : report.priority_level === 2 
                                ? 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-500 border-blue-500/30'
                          }`}>
                            P{report.priority_level}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            report.status === 'Resolved' ? 'bg-emerald-500' : 
                            report.status === 'Dispatched' ? 'bg-blue-500' : 'bg-slate-500 animate-pulse'
                          }`} />
                          <span className="text-xs font-bold">{report.status}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleStatusChange(report.id, report.status)}
                            className="p-2.5 bg-slate-800 rounded-xl hover:bg-blue-600 hover:text-white transition-all group-hover:scale-105"
                            title="Change Status"
                          >
                            <ExternalLink size={16} />
                          </button>
                          <button className="p-2.5 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all group-hover:scale-105" title="Assign Officer">
                            <UserPlus size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- MINI-MAP PLACEHOLDER --- */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 backdrop-blur-xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black italic tracking-tight uppercase">Radar Map</h3>
              <MapPin className="text-blue-500 w-5 h-5" />
            </div>
            
            {/* The actual placeholder div */}
            <div className="flex-1 rounded-3xl border border-slate-800 relative overflow-hidden group">
              {/* Background Grid/Simulation */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
              
              {/* Fake Map Elements */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border border-blue-500/20 flex items-center justify-center animate-[pulse_4s_infinite]">
                  <div className="w-32 h-32 rounded-full border border-blue-500/40" />
                </div>
              </div>

              {/* Data points (mock) */}
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-3 h-3 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse"
                  style={{ 
                    top: `${Math.random() * 80 + 10}%`, 
                    left: `${Math.random() * 80 + 10}%` 
                  }}
                />
              ))}

              <div className="absolute bottom-6 left-6 right-6 p-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Active Sector</p>
                  <p className="text-sm font-black italic tracking-tight">District Alpha-9</p>
                </div>
                <button className="text-[10px] font-black uppercase bg-blue-600 px-3 py-1.5 rounded-lg">Expand</button>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40 px-2">
                <span>Hotspot Cluster</span>
                <span>Incident Rate</span>
              </div>
              <div className="space-y-3">
                <HotspotItem label="Central Hub" percentage={82} color="red" />
                <HotspotItem label="East Side" percentage={45} color="amber" />
                <HotspotItem label="Residential" percentage={12} color="emerald" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color, isPriority = false }) {
  const colorMap = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/10',
    red: 'text-red-500 bg-red-500/10 border-red-500/20 shadow-red-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/10'
  };

  return (
    <div className={`p-8 rounded-[2.5rem] border backdrop-blur-xl transition-all hover:translate-y-[-4px] group ${colorMap[color]}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl bg-slate-950 shadow-inner ${colorMap[color]}`}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
        {isPriority && (
          <span className="bg-red-500 text-white text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full animate-pulse">
            Critical
          </span>
        )}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
      <h4 className="text-4xl font-black italic tracking-tighter tabular-nums">{value}</h4>
    </div>
  );
}

function HotspotItem({ label, percentage, color }) {
  const colorMap = {
    red: 'bg-red-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500'
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight">
        <span>{label}</span>
        <span className="opacity-50">{percentage}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
        <div 
          className={`h-full transition-all duration-1000 ease-out rounded-full ${colorMap[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
