"use client";
import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { ThemeContext } from './layout'; // Import the context from layout
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
  const { isDark } = useContext(ThemeContext); // Consume the theme from context
  const [reports, setReports] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    critical: 0,
    resolvedToday: 0,
    avgLatency: '0h'
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // --- 1. DATA FETCHING ---
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
        const total = data.length;
        const critical = data.filter(r => r.priority_level === 3).length;
        const today = new Date().toISOString().split('T')[0];
        const resolvedToday = data.filter(r => 
          r.status === 'Resolved' && 
          r.updated_at && 
          r.updated_at.startsWith(today)
        ).length;

        setMetrics({
          total,
          critical,
          resolvedToday,
          avgLatency: '4.2h'
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
  const handleStatusChange = async (id, newStatus) => {
    if (!newStatus) return;
    const { error } = await supabase.from('reports').update({ status: newStatus }).eq('id', id);
    if (!error) fetchDashboardData();
  };

  // --- 3. FILTERED DATA ---
  const filteredReports = reports.filter(r => 
    r.ticket_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const glassStyle = isDark 
    ? "bg-slate-900/40 border-slate-800 shadow-2xl shadow-blue-950/20" 
    : "bg-white/80 border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-xl";

  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const borderPrimary = isDark ? "border-slate-800" : "border-slate-200";

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div>
          <h2 className={`text-5xl font-black tracking-tighter leading-none mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Dashboard <span className="text-blue-500">Overview</span>
          </h2>
          <p className={`${textSecondary} font-medium tracking-tight flex items-center gap-2`}>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            System uptime 99.9% • Real-time AI classification active
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchDashboardData}
            className={`p-4 rounded-[1.5rem] border transition-all ${isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500 shadow-sm'}`}
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
        <MetricCard icon={<TrendingUp />} label="Total Reports" value={metrics.total} color="blue" isDark={isDark} />
        <MetricCard icon={<AlertCircle />} label="Critical Issues" value={metrics.critical} color="red" isPriority isDark={isDark} />
        <MetricCard icon={<CheckCircle2 />} label="Resolved Today" value={metrics.resolvedToday} color="emerald" isDark={isDark} />
        <MetricCard icon={<Clock />} label="Avg Latency" value={metrics.avgLatency} color="amber" isDark={isDark} />
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* --- AI-PRIORITIZED TABLE --- */}
        <div className="lg:col-span-8">
          <div className={`${glassStyle} border rounded-[2.5rem] overflow-hidden backdrop-blur-2xl`}>
            <div className={`p-8 border-b ${borderPrimary} flex justify-between items-center bg-transparent`}>
              <div className="flex items-center gap-4">
                <h3 className={`text-xl font-black italic tracking-tight uppercase ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Live Ledger</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{filteredReports.length} Items</span>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Filter by ID, category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`border rounded-2xl pl-12 pr-6 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors ${isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
              </div>
            </div>

            <div className="overflow-hidden px-2">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className={isDark ? 'bg-slate-950/50' : 'bg-slate-50/50'}>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 w-[40%]">Incident</th>
                    <th className="px-2 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center w-[15%]">Priority</th>
                    <th className="px-2 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 w-[15%]">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right w-[30%]">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                          <RefreshCw className="animate-spin w-8 h-8 text-blue-500" />
                          <span className="font-bold text-xs uppercase tracking-widest">Syncing AI Ledger...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center opacity-30 font-bold text-xs uppercase tracking-widest">
                        No reports found in this sector.
                      </td>
                    </tr>
                  ) : filteredReports.map((report) => (
                    <tr key={report.id} className={`group transition-colors ${isDark ? 'hover:bg-slate-800/20' : 'hover:bg-slate-50/50'} ${report.priority_level === 3 && (isDark ? 'bg-red-500/5' : 'bg-red-50/30')}`}>
                      <td className="px-6 py-6">
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-mono text-[9px] text-blue-500 font-black mb-1 truncate">#{report.ticket_id}</span>
                          <span className={`font-black text-sm ${isDark ? 'text-slate-100' : 'text-slate-800'} truncate`}>{report.category}</span>
                          <span className={`text-[10px] font-medium truncate ${textSecondary}`}>{report.description}</span>
                        </div>
                      </td>
                      <td className="px-2 py-6 text-center">
                        <div className="flex justify-center">
                          <span className={`px-2 py-1 rounded-full text-[9px] font-black tracking-widest border shrink-0 ${
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
                      <td className="px-2 py-6">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            report.status === 'Resolved' ? 'bg-emerald-500' : 
                            report.status === 'Dispatched' ? 'bg-blue-500' : 'bg-slate-400 animate-pulse'
                          }`} />
                          <span className={`text-[10px] font-bold truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{report.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right relative">
                        <div className="flex justify-end gap-2 items-center">
                          {/* Functional Custom Dropdown */}
                          <div className="relative">
                            <button 
                              onClick={() => setOpenDropdownId(openDropdownId === report.id ? null : report.id)}
                              className={`
                                flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest 
                                border transition-all hover:scale-105 active:scale-95 shrink-0
                                ${report.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                  report.status === 'Dispatched' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                                  report.status === 'Verified' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                  isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'}
                              `}
                            >
                              <span className="truncate">{report.status}</span>
                              <MoreVertical size={10} className={`transition-transform duration-300 shrink-0 ${openDropdownId === report.id ? 'rotate-90 text-white' : 'opacity-40'}`} />
                            </button>

                            {openDropdownId === report.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)} />
                                <div className={`absolute right-0 mt-2 w-36 border rounded-xl shadow-2xl z-50 p-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                  {['Submitted', 'Verified', 'Dispatched', 'Resolved'].map((st) => (
                                    <button
                                      key={st}
                                      onClick={() => {
                                        handleStatusChange(report.id, st);
                                        setOpenDropdownId(null);
                                      }}
                                      className={`
                                        w-full text-left px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all mb-0.5
                                        ${report.status === st 
                                          ? 'bg-blue-600 text-white shadow-lg' 
                                          : isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-50 hover:bg-slate-100 hover:text-blue-600'}
                                      `}
                                    >
                                      {st}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                          
                          <button className={`p-2 rounded-lg border transition-all hover:scale-105 active:scale-95 shrink-0 ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500 shadow-sm'}`} title="Assign Officer">
                            <UserPlus size={14} />
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

        {/* --- MINI-MAP (GLASS) --- */}
        <div className="lg:col-span-4 space-y-8">
          <div className={`${glassStyle} rounded-[2.5rem] p-8 backdrop-blur-2xl h-full flex flex-col`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className={`text-xl font-black italic tracking-tight uppercase ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Radar Map</h3>
              <MapPin className="text-blue-500 w-5 h-5" />
            </div>
            
            <div className={`flex-1 rounded-3xl border relative overflow-hidden group ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
              <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20`} />
              <div className={`absolute inset-0 ${isDark ? 'bg-[linear-gradient(rgba(37,99,235,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.1)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(37,99,235,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.05)_1px,transparent_1px)]'} bg-[size:40px_40px]`} />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-48 h-48 rounded-full border flex items-center justify-center animate-[pulse_4s_infinite] ${isDark ? 'border-blue-500/20' : 'border-blue-500/10'}`}>
                  <div className={`w-32 h-32 rounded-full border ${isDark ? 'border-blue-500/40' : 'border-blue-500/20'}`} />
                </div>
              </div>

              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-3 h-3 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse"
                  style={{ top: `${Math.random() * 80 + 10}%`, left: `${Math.random() * 80 + 10}%` }}
                />
              ))}

              <div className={`absolute bottom-6 left-6 right-6 p-4 backdrop-blur-md border rounded-2xl flex items-center justify-between ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Active Sector</p>
                  <p className={`text-sm font-black italic tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>District Alpha-9</p>
                </div>
                <button className="text-[10px] font-black uppercase bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-lg">Expand</button>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40 px-2">
                <span>Hotspot Cluster</span>
                <span>Incident Rate</span>
              </div>
              <div className="space-y-3">
                <HotspotItem label="Central Hub" percentage={82} color="red" isDark={isDark} />
                <HotspotItem label="East Side" percentage={45} color="amber" isDark={isDark} />
                <HotspotItem label="Residential" percentage={12} color="emerald" isDark={isDark} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color, isPriority = false, isDark = true }) {
  const colorMap = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/10',
    red: 'text-red-500 bg-red-500/10 border-red-500/20 shadow-red-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/10'
  };

  const bgStyle = isDark 
    ? 'bg-slate-900/40 border-slate-800' 
    : 'bg-white/70 border-slate-200 shadow-sm shadow-slate-200/50 backdrop-blur-md';

  return (
    <div className={`p-8 rounded-[2.5rem] border backdrop-blur-xl transition-all hover:translate-y-[-4px] group ${bgStyle}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl shadow-inner ${colorMap[color]} ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
        {isPriority && (
          <span className="bg-red-500 text-white text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full animate-pulse shadow-lg shadow-red-500/30">
            Critical
          </span>
        )}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
      <h4 className={`text-4xl font-black italic tracking-tighter tabular-nums ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{value}</h4>
    </div>
  );
}

function HotspotItem({ label, percentage, color, isDark = true }) {
  const colorMap = {
    red: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]',
    amber: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]',
    emerald: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
  };

  return (
    <div className="space-y-2">
      <div className={`flex justify-between text-[11px] font-bold uppercase tracking-tight ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        <span>{label}</span>
        <span className="opacity-50">{percentage}%</span>
      </div>
      <div className={`h-1.5 w-full rounded-full overflow-hidden border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-200/50 border-slate-200'}`}>
        <div 
          className={`h-full transition-all duration-1000 ease-out rounded-full ${colorMap[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
