"use client";
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Camera, Activity, ArrowRight, ScanLine, X, Lock, BarChart3, Radio, Zap, Waves, 
  AlertTriangle, MapPin, AlertCircle, Cpu, ShieldCheck, Database, Globe, ChevronDown, CheckCircle2, Search
} from 'lucide-react';

export default function CivicSens() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeCategory, setActiveCategory] = useState('road');
  const [time, setTime] = useState("");
  const [overlay, setOverlay] = useState(null); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ user: '', pass: '' });
  const [complaint, setComplaint] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);
  const [searchID, setSearchID] = useState("");
  const [trackedStatus, setTrackedStatus] = useState(null);
  const [coords, setCoords] = useState({ lat: "28.4744", lng: "77.5040" });
  const [locationName, setLocationName] = useState("SYNCING...");
  const [hudPos, setHudPos] = useState({ x: 50, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const hudRef = useRef(null);

  const categories = [
    { id: 'road', label: 'Roadways', icon: <Activity size={22}/>, status: '92% OK', count: '142', percent: '42%' },
    { id: 'water', label: 'Water Grid', icon: <Waves size={22}/>, status: '98% Pure', count: '86', percent: '28%' },
    { id: 'light', label: 'Power/Light', icon: <Zap size={22}/>, status: '99% Up', count: '54', percent: '18%' },
    { id: 'safety', label: 'Hazards', icon: <AlertTriangle size={22}/>, status: 'Active: 0', count: '37', percent: '12%' }
  ];

  const systemLogs = [
    { id: 1, time: '15:12', msg: 'UPLINK: Node_Sector_04 Established', status: 'Secure' },
    { id: 2, time: '15:08', msg: 'AI_SCAN: Analyzing visual data #882', status: 'Processing' },
    { id: 3, time: '14:55', msg: 'RE-ROUTE: Traffic for Pothole #412', status: 'In-Route' },
    { id: 4, time: '14:40', msg: 'SENSOR: Hydraulic Pressure Grid B', status: 'Optimized' },
    { id: 5, time: '14:32', msg: 'RESOLVED: Transformer Sector 12', status: 'Closed' },
  ];

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude; const lng = position.coords.longitude;
        setCoords({ lat: lat.toFixed(4), lng: lng.toFixed(4) });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          setLocationName((data.address.city || data.address.suburb || "NCR_ZONE").toUpperCase());
        } catch (e) { setLocationName("NODE_ALPHA_NCR"); }
      });
    }
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (isDragging) setHudPos({ x: window.innerWidth - e.clientX - 100, y: e.clientY - 60 });
    };
    const handleMouseUp = () => setIsDragging(false);
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString('en-US', { hour12: false })), 1000);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); clearInterval(timer); };
  }, [isDragging]);

  const submitReport = async () => {
  setIsLoading(true);
  const ticketID = `BMS-${Math.floor(10000 + Math.random() * 90000)}`;

  try {
    const file = document.getElementById('fileIn').files[0];
    let publicUrl = "";
    
    if (file) {
      const fileName = `${ticketID}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('report-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('report-images')
        .getPublicUrl(fileName);
      publicUrl = urlData.publicUrl;
    }

    const { error: dbError } = await supabase.from('reports').insert([{
      ticket_id: ticketID,
      category: activeCategory,
      description: complaint,
      image_url: publicUrl,
      latitude: coords.lat,
      longitude: coords.lng,
      status: 'Submitted'
    }]);

    if (dbError) throw dbError;
    setGeneratedTicket(ticketID);
  } catch (err) {
    console.error("SYSTEM_FAILURE:", err.message);
    alert("CRITICAL ERROR: Failed to sync with municipal grid.");
  } finally {
    setIsLoading(false);
  }
};
  const checkStatus = async () => {
  if (!searchID) return;
  
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('ticket_id', searchID.toUpperCase())
    .single();

  if (data) {
    const stageMap = { 'Submitted': 0, 'Verified': 1, 'Dispatched': 2, 'Resolved': 3 };
    setTrackedStatus({
      id: data.ticket_id,
      stage: stageMap[data.status] || 0
    });
  } else {
    alert("INVALID_ID: No record found in the city ledger.");
  }
};

  return (
    <div className="bg-[#050507] text-[#f0f0f5] h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth relative font-sans">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)`, backgroundSize: '60px 60px' }} 
      />
      <div className="pointer-events-none fixed inset-0 z-0" 
        style={{ background: `radial-gradient(1000px circle at ${mousePos.x}px ${mousePos.y}px, rgba(34, 211, 238, 0.05), transparent 80%)` }} 
      />

      {/* DRAGGABLE HUD (RIGHT SIDE) */}
      <div 
        ref={hudRef}
        onMouseDown={() => setIsDragging(true)}
        style={{ right: `${hudPos.x}px`, top: `${hudPos.y}px` }}
        className="fixed z-[150] cursor-move select-none space-y-3 group"
      >
        <div className="bg-[#0c0c0f]/80 border border-red-500/30 backdrop-blur-xl p-5 rounded-3xl shadow-2xl animate-pulse">
          <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] flex items-center gap-2 mb-3">
            <AlertCircle size={14} /> Critical Node Status
          </div>
          <div className="flex gap-6 text-xs font-mono text-white uppercase font-bold">
            <div className="flex flex-col"><span className="text-gray-600 text-[9px] mb-1">Roads</span>42%</div>
            <div className="flex flex-col"><span className="text-gray-600 text-[9px] mb-1">Water</span>28%</div>
            <div className="flex flex-col"><span className="text-gray-600 text-[9px] mb-1">Grid</span>18%</div>
          </div>
        </div>
        <div className="bg-[#0c0c0f]/60 border border-white/10 backdrop-blur-xl p-4 rounded-3xl shadow-lg border-l-4 border-l-cyan-500">
          <div className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <MapPin size={12} /> Sync: {locationName}
          </div>
          <div className="text-xs font-mono text-gray-400 mt-2 font-bold italic tracking-wider">{coords.lat}N // {coords.lng}E</div>
        </div>
      </div>

      {/* NAVBAR */}
      <nav className="fixed w-full top-0 z-[110] flex justify-between items-center px-12 py-8 bg-[#050507]/60 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center gap-4">
          <ScanLine size={28} className="text-cyan-400" />
          <h1 className="text-2xl font-black tracking-[0.3em] uppercase">Civic<span className="text-cyan-400 italic">Sens</span></h1>
        </div>
        <div className="flex gap-12 items-center">
          <div className="hidden md:flex flex-col items-end gap-1 font-mono uppercase">
            <span className="text-xs text-gray-500 font-black">{time}</span>
            <span className="text-[10px] text-cyan-400 font-black tracking-widest opacity-80">Greater Noida Node // 2026</span>
          </div>
          <button onClick={() => setOverlay('admin')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.4em] transition-all ${isLoggedIn ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'border border-white/10 text-white hover:bg-white hover:text-black'}`}>
            {isLoggedIn ? 'Operator_Verified' : 'Admin Login'}
          </button>
        </div>
      </nav>

      {/* SECTION 1: HERO DASHBOARD */}
      <section className="h-screen snap-start flex items-center justify-center pt-24 px-16">
        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-[100px] font-black tracking-tighter leading-[0.8] uppercase">
                FIXING CITY<br/>
                <span className="italic">SYS<span className="text-cyan-400 underline decoration-cyan-500/20 underline-offset-[16px]">TEMS</span>.</span>
              </h2>
              <p className="text-gray-500 max-w-lg text-sm leading-relaxed font-bold uppercase tracking-wide">
                Distributed municipal reporting for high-density urban zones. Submit evidence via AI-uplink for immediate dispatch.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 max-w-xl">
              {categories.map((cat) => (
                <div key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`cursor-pointer p-8 rounded-[2.5rem] border transition-all duration-500 group ${activeCategory === cat.id ? 'border-cyan-500 bg-cyan-500/[0.04] shadow-2xl translate-y-[-4px]' : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'}`}>
                  <div className="flex justify-between items-center mb-6">
                    <span className={activeCategory === cat.id ? 'text-cyan-400 scale-110' : 'text-gray-600'}>{cat.icon}</span>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{cat.percent}</span>
                  </div>
                  <div className="text-base font-black uppercase text-white tracking-widest">{cat.label}</div>
                  <div className="text-[10px] font-mono text-gray-600 uppercase mt-2 font-bold tracking-[0.1em]">{cat.count} Tasks // {cat.status}</div>
                </div>
              ))}
            </div>

            <button onClick={() => setOverlay('report')} className="group flex items-center justify-between w-full md:w-[520px] bg-white text-black p-8 font-black uppercase rounded-[2.5rem] shadow-2xl hover:bg-cyan-400 transition-all active:scale-[0.98]">
               <span className="text-2xl italic tracking-tighter">Submit Report</span>
               <ArrowRight size={32} className="group-hover:translate-x-4 transition-transform duration-500"/>
            </button>
          </div>

          <div className="hidden lg:block">
            <div className="bg-[#0c0c0f]/80 border border-white/5 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden backdrop-blur-xl">
              <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-8">
                <span className="text-xs font-black uppercase text-cyan-400 tracking-[0.5em] italic flex items-center gap-3">
                  <BarChart3 size={20} /> Operational Feed
                </span>
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_20px_#22c55e]" />
              </div>
              <div className="space-y-7">
                {systemLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center text-xs font-mono">
                    <span className="text-gray-500">[{log.time}] {log.msg}</span>
                    <span className="text-cyan-400 text-[10px] font-black border border-cyan-500/20 px-3 py-1 rounded-full">{log.status}</span>
                  </div>
                ))}
              </div>
              <div className="mt-12 pt-8 border-t border-white/5 flex justify-between opacity-30">
                <div className="flex gap-6"><Cpu size={20} /><Globe size={20} /></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Core_Sync_Active</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20"><ChevronDown size={30}/></div>
      </section>

      {/* SECTION 2: STATUS & ANALYTICS */}
      <section className="h-screen snap-start flex items-center justify-center px-16 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-32">
          <div className="space-y-12">
            <div className="space-y-6">
              <h3 className="text-cyan-500 text-xs font-black uppercase tracking-[0.8em] italic">Network Ledger</h3>
              <h2 className="text-7xl font-black tracking-tighter uppercase leading-tight">TRACK STATUS.</h2>
              <p className="text-sm text-gray-500 leading-relaxed font-bold uppercase tracking-wide max-w-sm">Enter your unique ticket ID to view real-time municipality resolution progress.</p>
            </div>

            <div className="flex gap-4">
              <input type="text" placeholder="BMS-XXXXX" className="flex-1 bg-white/[0.03] border border-white/10 p-7 rounded-3xl font-mono text-base uppercase tracking-[0.4em] focus:border-cyan-500 outline-none transition-all placeholder:opacity-20" value={searchID} onChange={(e) => setSearchID(e.target.value)} />
              <button onClick={checkStatus} className="px-8 bg-cyan-500 text-black rounded-3xl hover:scale-105 transition-all"><Search size={28} /></button>
            </div>

            {trackedStatus && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
                <div className="flex items-center gap-4 text-cyan-400 font-black italic tracking-widest text-sm underline decoration-cyan-500/30 underline-offset-8">ID_UPLINK: {trackedStatus.id}</div>
                <div className="relative pl-10 border-l-2 border-white/5 space-y-10">
                  {['Submitted', 'AI Verified', 'Dispatched', 'Resolved'].map((step, i) => (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[51px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 border-[#0a0a0c] ${i <= trackedStatus.stage ? 'bg-cyan-500 shadow-[0_0_20px_#22d3ee]' : 'bg-gray-800'}`} />
                      <div className={`text-xs font-black uppercase tracking-[0.3em] ${i <= trackedStatus.stage ? 'text-white' : 'text-gray-600'}`}>{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-8">
              <div className="p-12 bg-white/[0.01] border border-white/5 rounded-[3.5rem] text-center group hover:border-cyan-500/30 transition-all">
                <div className="text-6xl font-black mb-4 italic group-hover:scale-110 transition-transform">8.4k</div>
                <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Resolved</div>
              </div>
              <div className="p-12 bg-cyan-500/5 border border-cyan-500/20 rounded-[3.5rem] text-center">
                <div className="text-6xl font-black text-cyan-400 mb-4 italic">94%</div>
                <div className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em]">Efficiency</div>
              </div>
            </div>

            {/* TEAM SIGNATURE */}
            <div className="flex items-center gap-10 justify-end group pt-20">
              <div className="text-right flex flex-col items-end gap-3">
                <h2 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.5em] italic">ByteMe Squad Lead</h2>
                <h4 className="text-5xl font-black text-white uppercase italic tracking-tighter group-hover:text-cyan-400 transition-all">Pratyaksh</h4>
                <div className="h-[2px] w-40 bg-gradient-to-l from-cyan-500 to-transparent opacity-50" />
                <p className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.4em] font-bold">Systems Architect // 2026</p>
              </div>
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 text-black rounded-[2.5rem] flex items-center justify-center font-black text-5xl shadow-2xl italic group-hover:rotate-6 transition-transform">P</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="h-[15vh] snap-start flex items-center justify-between px-16 border-t border-white/5 bg-[#050507]">
        <div className="text-xs font-black text-gray-700 uppercase tracking-[0.6em] italic flex items-center gap-6 opacity-50 hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#22d3ee]" />
          CivicSens_Net // Node_ID: {locationName} // BMS_AUTH_PRATYAKSH_2026
        </div>
        <div className="flex gap-16 text-xs font-black text-gray-800 uppercase tracking-[0.4em]">
          <a href="#" className="hover:text-cyan-400 transition-all flex items-center gap-3"><Radio size={16}/> Uplink</a>
          <a href="#" className="hover:text-cyan-400 transition-all flex items-center gap-3"><ShieldCheck size={16}/> Security</a>
          <a href="#" className="hover:text-cyan-400 transition-all flex items-center gap-3"><Database size={16}/> Archive</a>
        </div>
      </footer>

      {/* OVERLAYS (REPORT & LOGIN) */}
      {overlay && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6">
          <div className="relative w-full max-w-xl bg-[#0c0c0f] border border-white/10 p-16 rounded-[4rem] shadow-2xl">
            <button onClick={() => {setOverlay(null); setGeneratedTicket(null);}} className="absolute top-12 right-12 text-gray-600 hover:text-white"><X size={30} /></button>
            {overlay === 'report' ? (
              <div className="space-y-10 text-center">
                {!generatedTicket ? (
                  <>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Report City Failure</h2>
                    <div onClick={() => document.getElementById('fileIn').click()} className="w-full h-56 bg-white/[0.01] border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer group hover:border-cyan-500/40 transition-all">
                      {previewUrl ? <img src={previewUrl} className="h-full object-contain p-6" /> : <Camera size={48} className="text-gray-700 group-hover:text-cyan-400" />}
                    </div>
                    <input type="file" id="fileIn" onChange={(e) => setPreviewUrl(URL.createObjectURL(e.target.files[0]))} className="hidden" />
                    <textarea value={complaint} onChange={(e) => setComplaint(e.target.value)} placeholder="Failure description..." className="w-full h-32 bg-white/[0.02] border border-white/10 p-8 text-sm rounded-3xl focus:border-cyan-500 outline-none font-bold" />
                    <button onClick={submitReport} className="w-full py-7 bg-cyan-500 text-black font-black uppercase rounded-3xl tracking-[0.4em] text-xs hover:brightness-110 shadow-2xl shadow-cyan-500/20">Submit Report</button>
                  </>
                ) : (
                  <div className="py-10 animate-in zoom-in duration-500">
                    <CheckCircle2 size={100} className="text-green-500 mx-auto mb-8" />
                    <h2 className="text-3xl font-black uppercase mb-3 italic">Uplink Confirmed</h2>
                    <p className="text-sm font-mono text-cyan-400 tracking-[0.3em] font-black">{generatedTicket}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <Lock size={60} className="mx-auto mb-10 text-cyan-500" />
                <form onSubmit={handleLogin} className="space-y-6">
                  <input type="text" placeholder="Admin 1234" className="w-full bg-white/[0.02] border border-white/10 p-7 rounded-3xl text-sm font-mono outline-none" value={loginData.user} onChange={(e) => setLoginData({...loginData, user: e.target.value})} />
                  <input type="password" placeholder="••••••••" className="w-full bg-white/[0.02] border border-white/10 p-7 rounded-3xl text-sm font-mono outline-none" value={loginData.pass} onChange={(e) => setLoginData({...loginData, pass: e.target.value})} />
                  <button type="submit" className="w-full py-7 bg-white text-black font-black uppercase rounded-3xl text-xs tracking-[0.4em]">Authenticate</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}