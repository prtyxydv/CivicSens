"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Camera, ShieldCheck, Search, Lock, MapPin, 
  CheckCircle2, Loader2, ArrowRight, Activity, 
  Cpu, Moon, Sun, LogOut, Clock, Database, ShieldAlert, X
} from 'lucide-react';

export default function CivicSens() {
  // --- 1. CORE SYSTEM STATES ---
  const [copied, setCopied] = useState(false);

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
};
  const [complaint, setComplaint] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);
  const [searchID, setSearchID] = useState('');
  const [trackedStatus, setTrackedStatus] = useState(null);
  const [isDark, setIsDark] = useState(true); // Default to Dark Mode for the "Vibe"
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null); // To show Urgency Timer
  const [isHudExpanded, setIsHudExpanded] = useState(false);
  const [dashData, setDashData] = useState({ categories: {}, unresolved: 0, oldestHours: 0 });
  
  // --- 2. AUTH & ADMIN STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [allReports, setAllReports] = useState([]);

  // --- 3. UI, GEOSPATIAL & GLOW STATES ---
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [locationName, setLocationName] = useState("Detecting Sector...");
  const [coords, setCoords] = useState({ lat: "0.0000", lng: "0.0000" });
  const [nearbyCount, setNearbyCount] = useState(0);

  // --- 4. INITIALIZATION (GLOW & LOCATION) ---
  useEffect(() => {
    // Interactive Mouse Glow
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);

    // Auto-Location & Network Load
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude.toFixed(4), lng: longitude.toFixed(4) });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          setLocationName(data.address.suburb || data.address.neighbourhood || data.address.city || "Urban Core");
          
          // Fetch Nearby Count from Supabase
          const { count } = await supabase.from('reports').select('*', { count: 'exact', head: true });
          setNearbyCount(count || 0);
        } catch (e) { 
          setLocationName("Metropolitan District"); 
        }
      });
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  const fetchDashboardData = async () => {
    const { data } = await supabase.from('reports').select('*');
    if (data) {
      const cats = data.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
      }, {});
      const activeTickets = data.filter(r => r.status !== 'Resolved');
      let maxHours = 0;
      activeTickets.forEach(t => {
        const hours = Math.floor((new Date() - new Date(t.created_at)) / (1000 * 60 * 60));
        if (hours > maxHours) maxHours = hours;
      });
      setDashData({ categories: cats, unresolved: activeTickets.length, oldestHours: maxHours });
    }
  };

  useEffect(() => {
    if (isHudExpanded) fetchDashboardData();
  }, [isHudExpanded]);
  const fetchAdminReports = async () => {
    const { data } = await supabase
      .from('reports')
      .select('*')
      .order('priority_level', { ascending: false }); // Highest priority first
    if (data) setAllReports(data);
  };

  // --- 5. AI CLASSIFICATION ENGINE ---
  const analyzeInput = (text) => {
    const input = text.toLowerCase();
    let result = { cat: "Maintenance", prio: 1, msg: "Routine urban logging.", time: "3-5 Business Days" };

    if (/(pothole|road|bridge|crack|asphalt)/.test(input)) {
      result = { cat: "Infrastructure", prio: 2, msg: "Structural integrity risk detected.", time: "24-48 Hours" };
    } else if (/(leak|water|flood|drain|sewage|pipe)/.test(input)) {
      result = { cat: "Utilities", prio: 3, msg: "Critical resource breach detected.", time: "Under 4 Hours" };
    } else if (/(danger|wire|fire|hazard|collapsed|electric)/.test(input)) {
      result = { cat: "Emergency", prio: 3, msg: "Immediate public safety hazard.", time: "Under 1 Hour (Dispatching Now)" };
    } else if (/(trash|garbage|waste|smell|litter)/.test(input)) {
      result = { cat: "Sanitation", prio: 1, msg: "Environmental hygiene log.", time: "48-72 Hours" };
    }
    return result;
  };

  // --- 6. EVENT HANDLERS ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (adminUser === "ADMIN123" && adminPass === "admin@1234") {
      setIsLoggedIn(true);
      setShowAdminModal(false);
      fetchAdminReports();
    } else { 
      alert("System Alert: Invalid Access Credentials"); 
    }
  };

  const submitReport = async () => {
    if (!complaint) return alert("Please provide a description of the issue.");
    setIsLoading(true);
    
    // Generate Ticket ID
    const ticketID = `CS-${Math.floor(10000 + Math.random() * 90000)}`;
    const ai = analyzeInput(complaint);
    setAiAnalysisResult(ai); // Save for the success modal timer

    try {
      // Image Upload Logic
      const fileInput = document.getElementById('fileIn');
      const file = fileInput?.files[0];
      let imgUrl = "";
      
      if (file) {
        const fileName = `${ticketID}-${file.name}`;
        await supabase.storage.from('report-images').upload(fileName, file);
        const { data } = supabase.storage.from('report-images').getPublicUrl(fileName);
        imgUrl = data.publicUrl;
      }

      // Supabase Database Insert
      const { error } = await supabase.from('reports').insert([{
        ticket_id: ticketID, 
        category: ai.cat, 
        description: complaint,
        image_url: imgUrl, 
        status: 'Submitted', 
        priority_level: ai.prio,
        risk_assessment: ai.msg, 
        latitude: coords.lat, 
        longitude: coords.lng
      }]);

      // Success State Update
      setGeneratedTicket({
        id: ticketID,
        category: ai.cat,
        priority: ai.prio
      });
      setComplaint('');
      if (fileInput) fileInput.value = '';
      
      // Refresh local network stats
      const { count } = await supabase.from('reports').select('*', { count: 'exact', head: true });
      setNearbyCount(count || 0);

    } catch (err) { 
      console.error(err);
      alert("Database Connection Failed. Check your Supabase configuration."); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const updateStatus = async (id, newStatus) => {
    await supabase.from('reports').update({ status: newStatus }).eq('id', id);
    fetchAdminReports(); // Refresh Admin UI
  };

  const checkStatus = async () => {
    if (!searchID) return;
    const { data } = await supabase.from('reports').select('*').eq('ticket_id', searchID.toUpperCase()).single();
    if (data) {
      const stages = { 'Submitted': 0, 'Verified': 1, 'Dispatched': 2, 'Resolved': 3 };
      setTrackedStatus({ id: data.ticket_id, stage: stages[data.status] || 0 });
    } else { 
      alert("Reference ID Not Found in Global Ledger."); 
    }
  };

  // --- 7. MAIN RENDER ---
  return (
    <div className={`min-h-screen transition-colors duration-700 ease-in-out font-sans relative overflow-hidden ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#fcfdfe] text-slate-900'}`}>
      
      {/* PERFECTED MOUSE GLOW */}
      <div className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{ 
          background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, ${isDark ? 'rgba(37, 99, 235, 0.12)' : 'rgba(37, 99, 235, 0.05)'}, transparent 80%)` 
        }}
      />

      {/* TOP NAVIGATION */}
      <nav className={`relative z-50 border-b px-8 py-5 flex justify-between items-center backdrop-blur-xl transition-all ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200/60 bg-white/60'}`}>
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
            <Cpu className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none">CivicSens</h1>
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase opacity-50 mt-1">Autonomous Infrastructure</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button onClick={() => setIsDark(!isDark)} className="p-2 hover:scale-110 transition-transform text-slate-400 hover:text-blue-500">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          {isLoggedIn ? (
            <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-xs font-bold tracking-widest border border-red-500/20 uppercase hover:bg-red-500/20 transition-colors">
              <LogOut className="w-3 h-3" /> Terminate Session
            </button>
          ) : (
            <button onClick={() => setShowAdminModal(true)} className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-400 hover:text-blue-500 transition-colors uppercase">
              <Lock className="w-3 h-3" /> Admin Access
            </button>
          )}
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto py-12 px-6">
        
        {/* --- EXPANDING INTERACTIVE HUD --- */}
        <div className="flex justify-center mb-16 relative z-40">
          {!isHudExpanded && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce pointer-events-none">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 backdrop-blur-md">
                Tap to Expand HUD
              </span>
            </div>
          )}

          <div 
            className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] backdrop-blur-3xl border shadow-2xl relative group ${
              isHudExpanded 
                ? `w-full max-w-4xl rounded-[3.5rem] p-10 ${isDark ? 'bg-slate-900/80 border-slate-700 shadow-blue-950/60' : 'bg-white/80 border-slate-200 shadow-blue-500/10'}`
                : `max-w-max rounded-full p-3 cursor-pointer hover:scale-105 active:scale-95 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white/60 border-slate-200'} ring-4 ring-blue-500/20`
            }`}
            onClick={() => !isHudExpanded && setIsHudExpanded(true)}
          >
            {/* THE PILL (Always Visible) */}
            <div className={`flex items-center gap-8 ${isHudExpanded ? 'mb-10 pb-10 border-b border-slate-500/20' : 'px-6'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-full text-blue-500 shadow-inner transition-all ${!isHudExpanded && 'animate-pulse bg-blue-500/20 ring-4 ring-blue-500/10'}`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  {isHudExpanded && <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">Local Node</p>}
                  <p className="text-sm font-bold tracking-tight">{locationName}</p>
                </div>
              </div>
              
              <div className="w-px h-8 bg-slate-500/20" />
              
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-emerald-500/10 rounded-full text-emerald-500">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  {isHudExpanded && <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">Status</p>}
                  <p className="text-sm font-bold tracking-tight">{nearbyCount} Active Logs</p>
                </div>
              </div>

              {isHudExpanded && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsHudExpanded(false); }}
                  className="ml-auto p-3 rounded-2xl bg-slate-500/10 hover:bg-red-500/20 hover:text-red-500 transition-all group-hover:rotate-90"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* THE DASHBOARD CONTENT (Only visible when expanded) */}
            {isHudExpanded && (
              <div className="grid md:grid-cols-3 gap-8 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-700">
                
                {/* 1. Category Anomaly Distribution */}
                <div className={`p-6 rounded-[2rem] border transition-all hover:translate-y-[-4px] ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/50 border-slate-200'}`}>
                  <div className="flex items-center gap-2 mb-6">
                    <Database className="w-3 h-3 text-blue-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Issue Categories</h4>
                  </div>
                  <div className="space-y-5">
                    {Object.entries(dashData.categories).length > 0 ? Object.entries(dashData.categories).map(([cat, count]) => (
                      <div key={cat} className="group/item">
                        <div className="flex justify-between text-[11px] font-bold mb-2 uppercase tracking-tighter">
                          <span>{cat}</span>
                          <span className="text-blue-500">{count}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-500/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(37,99,235,0.4)]" 
                            style={{ width: `${(count / Math.max(1, nearbyCount)) * 100}%` }} 
                          />
                        </div>
                      </div>
                    )) : <p className="text-[10px] opacity-30 font-bold uppercase italic">No live data synced...</p>}
                  </div>
                </div>

                {/* 2. Hotspot Radar Map */}
                <div className={`p-6 rounded-[2rem] border flex flex-col justify-center items-center text-center transition-all hover:translate-y-[-4px] ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/50 border-slate-200'}`}>
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full border border-blue-500/10 flex items-center justify-center animate-[ping_4s_infinite]">
                      <div className="absolute inset-0 rounded-full border border-blue-500/20" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                        <MapPin className="w-5 h-5 text-blue-500" />
                      </div>
                    </div>
                  </div>
                  <h4 className="text-xl font-black italic tracking-tighter">Sector {coords.lat.slice(-2)}</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Geospatial Hotspot</p>
                </div>

                {/* 3. Latency Metrics (Time Not Worked On) */}
                <div className={`p-6 rounded-[2rem] border flex flex-col justify-between transition-all hover:translate-y-[-4px] ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/50 border-slate-200'}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-3 h-3 text-red-500" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">System Latency</h4>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black text-red-500 tracking-tighter tabular-nums">{dashData.oldestHours}</span>
                      <span className="text-xs font-black opacity-30 uppercase tracking-widest">Hrs</span>
                    </div>
                    <p className="text-[10px] font-bold opacity-50 mt-2 uppercase tracking-tight">Since oldest unresolved log</p>
                  </div>
                  
                  <div className="mt-6 flex items-center gap-3 bg-red-500/5 p-4 rounded-2xl border border-red-500/10 group-hover:bg-red-500/10 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{dashData.unresolved} Pending Action</span>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
        {isLoggedIn ? (
          /* --- ADMIN COMMAND CENTER --- */
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-5xl font-black tracking-tighter mb-2">Command Center</h2>
                <p className="text-sm font-medium text-slate-500">Monitoring real-time AI classifications for civic anomalies.</p>
              </div>
              <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black tracking-widest text-blue-500 uppercase">Root Access</span>
              </div>
            </div>

            <div className="grid gap-6">
              {allReports.map((r) => (
                <div key={r.id} className={`p-8 rounded-[2.5rem] border grid md:grid-cols-4 items-center gap-8 transition-all ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40'}`}>
                  
                  {/* Visual Proof */}
                  <div className="w-32 h-32 rounded-3xl bg-slate-800 overflow-hidden border border-slate-700/50 flex-shrink-0">
                    {r.image_url ? (
                      <img src={r.image_url} className="w-full h-full object-cover" alt="Proof" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs font-bold opacity-30">No Image</div>
                    )}
                  </div>
                  
                  {/* AI Intel */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3 mb-3 text-[10px] font-black uppercase">
                      <span className={`px-2 py-1 rounded ${r.priority_level === 3 ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}>
                        Priority {r.priority_level}
                      </span>
                      <span className="opacity-50 font-mono tracking-widest">{r.ticket_id}</span>
                    </div>
                    <h4 className="font-black text-2xl mb-2">{r.category} Hazard</h4>
                    <p className="text-sm opacity-70 mb-4 line-clamp-2">{r.description}</p>
                    <div className="text-[11px] font-bold text-blue-500 bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20 inline-block">
                      AI Insight: {r.risk_assessment}
                    </div>
                  </div>
                  
                  {/* Status Overrides */}
                  <div className="flex flex-col gap-3">
                    {['Verified', 'Dispatched', 'Resolved'].map(st => (
                      <button 
                        key={st} 
                        onClick={() => updateStatus(r.id, st)} 
                        className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${r.status === st ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* --- CITIZEN REPORTING PORTAL --- */
          <div className="grid lg:grid-cols-12 gap-12">
            
            {/* Form Section */}
            <div className="lg:col-span-7">
              <h2 className="text-7xl font-black tracking-tighter leading-[0.85] mb-6">
                Report. <br/><span className="text-blue-600">Resolve.</span>
              </h2>
              <p className="text-slate-500 text-lg font-medium max-w-lg mb-12">
                CivicSens uses artificial intelligence to instantly categorize your report and bypass administrative delays.
              </p>
              
              <div className={`p-10 rounded-[3rem] border transition-all ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white shadow-2xl shadow-blue-900/5 border-slate-100'}`}>
                <div className="space-y-8">
                  
                  {/* Image Upload */}
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Visual Evidence</label>
                    <div className={`relative h-40 rounded-[2rem] border-2 border-dashed flex items-center justify-center group transition-colors ${isDark ? 'border-slate-800 hover:border-blue-500 bg-slate-950/50' : 'border-slate-200 hover:border-blue-400 bg-slate-50'}`}>
                      <input type="file" id="fileIn" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="text-center">
                        <Camera className="w-10 h-10 opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all text-blue-500 mx-auto mb-2" />
                        <span className="text-xs font-bold text-slate-400 group-hover:text-blue-500">Tap to upload photo</span>
                      </div>
                    </div>
                  </div>

                  {/* Text Description */}
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Issue Description</label>
                    <textarea 
                      value={complaint} 
                      onChange={(e) => setComplaint(e.target.value)} 
                      placeholder="Describe the issue. Our AI will assess the risk and assign priority automatically..." 
                      className={`w-full rounded-[2rem] p-6 min-h-[160px] outline-none border transition-all text-sm font-medium ${isDark ? 'bg-slate-950 border-slate-800 focus:border-blue-600' : 'bg-white border-slate-200 focus:border-blue-500'}`} 
                    />
                  </div>

                  {/* Submit Button */}
                  <button 
                    onClick={submitReport} 
                    disabled={isLoading} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2rem] flex items-center justify-center gap-4 transition-all shadow-xl shadow-blue-600/30 uppercase tracking-[0.3em] text-[11px]"
                  >
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Initiate AI Scan & Submit <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </div>
            </div>

            {/* Tracker Section */}
            <div className="lg:col-span-5 pt-4 lg:pt-32">
              <div className={`p-10 rounded-[3rem] border transition-all ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white shadow-2xl shadow-blue-900/5 border-slate-100'}`}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-slate-900 rounded-2xl shadow-lg"><Search className="text-white w-5 h-5" /></div>
                  <h3 className="text-2xl font-black">Audit Tracker</h3>
                </div>
                
                <div className="space-y-4 mb-10">
                  <input 
                    type="text" 
                    placeholder="Enter Ticket ID (e.g. CS-12345)" 
                    value={searchID} 
                    onChange={(e) => setSearchID(e.target.value)} 
                    className={`w-full rounded-2xl px-6 py-5 outline-none font-mono text-sm border transition-colors ${isDark ? 'bg-slate-950 border-slate-800 focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-400'}`} 
                  />
                  <button 
                    onClick={checkStatus} 
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-colors"
                  >
                    Query Ledger
                  </button>
                </div>

                {/* Progress Bar */}
                {trackedStatus && (
                  <div className="pt-8 border-t border-slate-500/20 animate-in fade-in duration-500">
                    <div className="flex justify-between items-center mb-8 text-[10px] font-black opacity-50 tracking-widest uppercase">
                      Ticket: {trackedStatus.id}
                    </div>
                    <div className="flex justify-between relative px-2">
                      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-500/20 -translate-y-1/2" />
                      {['Submitted', 'Verified', 'Dispatched', 'Resolved'].map((label, step) => (
                        <div key={step} className="relative flex flex-col items-center group">
                          <div className={`w-10 h-10 rounded-xl z-10 flex items-center justify-center border-2 transition-all ${trackedStatus.stage >= step ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <span className={`absolute -bottom-6 text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${trackedStatus.stage >= step ? 'text-blue-500' : 'opacity-30'}`}>
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- MODALS --- */}

      {/* Admin Login Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className={`w-full max-w-sm rounded-[3rem] p-10 border shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="text-center mb-8">
              <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-black uppercase tracking-tighter">System Access</h3>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="text" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} className={`w-full border rounded-2xl px-6 py-5 outline-none font-mono text-sm ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} placeholder="Badge ID (ADMIN123)" />
              <input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} className={`w-full border rounded-2xl px-6 py-5 outline-none font-mono text-sm ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} placeholder="Passkey" />
              <button className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-lg hover:bg-blue-500 transition-colors mt-4">Authenticate</button>
              <button type="button" onClick={() => setShowAdminModal(false)} className="w-full text-center text-[10px] font-black opacity-40 uppercase tracking-widest mt-4 hover:opacity-100 transition-opacity">Cancel Protocol</button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal (Includes Urgency Timer) */}
      {generatedTicket && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[101] flex items-center justify-center p-6">
          <div className={`w-full max-w-md rounded-[3rem] p-10 text-center border animate-in zoom-in-95 duration-500 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xl'}`}>
            <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
              <ShieldCheck className="text-white w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black tracking-tighter mb-2">Network Synced</h2>
            <p className="text-sm opacity-60 mb-8 font-medium">Your report has been secured on the global ledger.</p>
            
            <div className="bg-slate-950 py-8 rounded-[2.5rem] border border-slate-800 mb-6">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Official Ticket ID</p>
              <span className="text-4xl font-mono font-black text-blue-500 tracking-widest">{generatedTicket.id}</span>
            </div>

            {/* AI Insights: Category & Priority */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">Category</p>
                <p className="text-xs font-bold">{generatedTicket.category}</p>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">Priority Level</p>
                <p className="text-xs font-bold">Level {generatedTicket.priority}</p>
              </div>
            </div>

            {/* Urgency Timer Restoration */}
            {aiAnalysisResult && (
              <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-3xl mb-8 text-left flex items-center gap-4">
                <Clock className="w-8 h-8 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">AI Est. Response Time</p>
                  <p className="text-sm font-bold">{aiAnalysisResult.time}</p>
                </div>
              </div>
            )}

            <button onClick={() => setGeneratedTicket(null)} className="w-full bg-slate-100 text-slate-900 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white transition-colors">Acknowledge</button>
          </div>
        </div>
      )}
    </div>
  );
}