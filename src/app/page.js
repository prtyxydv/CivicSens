"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Camera, ShieldCheck, Search, Lock, MapPin, 
  CheckCircle2, Loader2, ArrowRight, X, Layers,
  Landmark, Activity, Sparkles, Cpu, Moon, Sun, LogOut
} from 'lucide-react';

export default function CivicProEngine() {
  // --- CORE SYSTEM STATE ---
  const [complaint, setComplaint] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);
  const [searchID, setSearchID] = useState('');
  const [trackedStatus, setTrackedStatus] = useState(null);
  
  // --- AUTH & ADMIN STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [allReports, setAllReports] = useState([]);

  // --- UI & GEOSPATIAL STATE ---
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [locationName, setLocationName] = useState("Detecting Sector...");
  const [nearbyCount, setNearbyCount] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const [coords, setCoords] = useState({ lat: "0.0000", lng: "0.0000" });

  // --- SYSTEM INITIALIZATION ---
  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude.toFixed(4), lng: longitude.toFixed(4) });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          setLocationName(data.address.suburb || data.address.neighbourhood || data.address.city || "Urban Sector 7");
          fetchNearbyCount();
        } catch (e) { setLocationName("Metropolitan Zone"); }
      });
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fetchNearbyCount = async () => {
    const { count } = await supabase.from('reports').select('*', { count: 'exact', head: true });
    setNearbyCount(count || 0);
  };

  const fetchAdminReports = async () => {
    const { data } = await supabase.from('reports').select('*').order('priority_level', { ascending: false });
    if (data) setAllReports(data);
  };

  // --- AI CLASSIFICATION LOGIC ---
  const runAIAnalysis = (text) => {
    const lowerText = text.toLowerCase();
    let category = "General";
    let priority = 1;
    let assessment = "Standard maintenance log.";

    if (/(hole|pothole|road|asphalt|crack)/.test(lowerText)) {
      category = "Infrastructure"; priority = 2; assessment = "AI Detect: Surface structural failure.";
    } else if (/(pipe|water|leak|flood|drain)/.test(lowerText)) {
      category = "Utilities"; priority = 3; assessment = "CRITICAL: Fluid containment breach.";
    } else if (/(trash|garbage|waste|smell|litter)/.test(lowerText)) {
      category = "Sanitation"; priority = 1; assessment = "Public health sanitation log.";
    } else if (/(danger|wire|electric|fire|collapse)/.test(lowerText)) {
      category = "Emergency"; priority = 3; assessment = "IMMEDIATE: Life-safety hazard.";
    }
    return { category, priority, assessment };
  };

  // --- ACTION HANDLERS ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (adminUser === "ADMIN123" && adminPass === "admin@1234") {
      setIsLoggedIn(true);
      setShowAdminModal(false);
      fetchAdminReports();
    } else {
      alert("ACCESS DENIED: Credentials Invalid.");
    }
  };

  const submitReport = async () => {
    if (!complaint) return alert("System requires input description.");
    setIsLoading(true);
    const ticketID = `CP-${Math.floor(10000 + Math.random() * 90000)}`;
    const ai = runAIAnalysis(complaint);

    try {
      const file = document.getElementById('fileIn')?.files[0];
      let publicUrl = "";
      if (file) {
        const fileName = `${ticketID}-${file.name}`;
        await supabase.storage.from('report-images').upload(fileName, file);
        const { data } = supabase.storage.from('report-images').getPublicUrl(fileName);
        publicUrl = data.publicUrl;
      }
      await supabase.from('reports').insert([{
        ticket_id: ticketID, category: ai.category, description: complaint,
        image_url: publicUrl, status: 'Submitted', priority_level: ai.priority,
        risk_assessment: ai.assessment, latitude: coords.lat, longitude: coords.lng
      }]);
      setGeneratedTicket(ticketID);
      fetchNearbyCount();
    } catch (err) { alert("Terminal Sync Failed."); } 
    finally { setIsLoading(false); }
  };

  const updateReportStatus = async (id, newStatus) => {
    await supabase.from('reports').update({ status: newStatus }).eq('id', id);
    fetchAdminReports();
  };

  const checkStatus = async () => {
    const { data } = await supabase.from('reports').select('*').eq('ticket_id', searchID.toUpperCase()).single();
    if (data) {
      const stageMap = { 'Submitted': 0, 'Verified': 1, 'Dispatched': 2, 'Resolved': 3 };
      setTrackedStatus({ id: data.ticket_id, stage: stageMap[data.status] || 0 });
    } else { alert("UID Not Found."); }
  };

  return (
    <div className={`min-h-screen transition-all duration-700 font-sans relative overflow-hidden ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#fcfdfe] text-slate-900'}`}>
      
      {/* INTERACTIVE MOUSE GLOW */}
      <div className="pointer-events-none fixed inset-0 z-0"
        style={{ background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, ${isDark ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.08)'}, transparent 80%)` }}
      />

      {/* NAVBAR */}
      <nav className={`relative z-50 border-b ${isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200/60 bg-white/80'} backdrop-blur-xl px-10 py-5 flex justify-between items-center`}>
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2 rounded-xl"><Landmark className="text-white w-5 h-5" /></div>
          <div>
            <h1 className="text-lg font-black tracking-tighter italic">CIVIC<span className="text-blue-600">PRO</span></h1>
            <p className="text-[9px] font-bold text-slate-400 tracking-[0.3em] uppercase underline decoration-blue-600/40">Autonomous Command Center</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded-xl transition-all ${isDark ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {!isLoggedIn ? (
            <button onClick={() => setShowAdminModal(true)} className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 hover:text-blue-600 uppercase">
              <Lock className="w-3 h-3" /> Personnel
            </button>
          ) : (
            <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase">
              <LogOut className="w-3 h-3" /> Logout
            </button>
          )}
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto py-12 px-8">
        
        {/* JURISDICTION HUD */}
        <div className={`flex flex-wrap items-center gap-6 mb-12 p-5 rounded-[2rem] border transition-all ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white/50 border-slate-200'} backdrop-blur-md shadow-sm`}>
          <div className="flex items-center gap-4 border-r border-slate-200/50 pr-8">
            <div className="p-2.5 bg-blue-600/10 rounded-xl text-blue-600"><MapPin className="w-5 h-5" /></div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Sector</p>
              <p className="text-sm font-bold">{locationName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500"><Activity className="w-5 h-5" /></div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Network Load</p>
              <p className="text-sm font-bold">{nearbyCount} Active Logs</p>
            </div>
          </div>
        </div>

        {isLoggedIn ? (
          /* --- ADMIN PORTAL VIEW --- */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="mb-10">
              <h2 className="text-5xl font-black tracking-tighter text-blue-600 italic">COMMAND_FEED</h2>
              <p className="text-[10px] font-mono tracking-widest text-slate-500 mt-2 uppercase">Root Access: {adminUser} // Sorting by AI_PRIORITY</p>
            </div>
            <div className="grid gap-4">
              {allReports.map((report) => (
                <div key={report.id} className={`p-6 rounded-[2.5rem] border flex flex-wrap md:flex-nowrap items-center gap-6 transition-all ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-white shadow-xl shadow-blue-900/5'}`}>
                  <div className="w-20 h-20 rounded-2xl bg-slate-800 overflow-hidden flex-shrink-0 border border-white/10">
                    {report.image_url ? <img src={report.image_url} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-[8px] text-slate-500">NO_IMG</div>}
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${report.priority_level === 3 ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}>Priority_{report.priority_level}</span>
                      <span className="text-xs font-mono font-bold text-slate-400">{report.ticket_id}</span>
                    </div>
                    <h4 className="font-bold text-sm mb-1 uppercase tracking-tight">{report.category} Incident</h4>
                    <p className="text-xs opacity-60 mb-2">{report.description}</p>
                    <div className="text-[9px] font-mono text-blue-500 bg-blue-500/5 p-2 rounded-lg italic">AI_ASSESS: {report.risk_assessment}</div>
                  </div>
                  <div className="flex gap-2">
                    {['Verified', 'Dispatched', 'Resolved'].map((s) => (
                      <button key={s} onClick={() => updateReportStatus(report.id, s)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${report.status === s ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* --- USER VIEW --- */
          <>
            <div className="mb-20">
              <h2 className="text-7xl font-black tracking-tighter leading-[0.85] mb-6">Autonomous <br/><span className="text-blue-600">Infrastructure.</span></h2>
              <p className={`max-w-xl text-lg font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>High-fidelity civic reporting. Our AI engine autonomously classifies and prioritizes municipal response units based on structural risk.</p>
            </div>
            <div className="grid lg:grid-cols-12 gap-10">
              <section className={`lg:col-span-7 p-10 rounded-[3rem] border transition-all ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white shadow-2xl shadow-blue-900/5 border-white'}`}>
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg"><Cpu className="text-white w-6 h-6" /></div>
                  <h3 className="text-2xl font-black tracking-tight italic">System Input</h3>
                </div>
                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block underline">Evidence_Capture</label>
                    <div className={`border-2 border-dashed rounded-2xl p-8 text-center ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/50'}`}>
                      <input type="file" id="fileIn" className="text-xs font-bold text-slate-400 file:mr-4 file:py-2 file:px-6 file:rounded-xl file:border-0 file:bg-slate-900 file:text-white cursor-pointer" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block underline">Data_Description</label>
                    <textarea value={complaint} onChange={(e) => setComplaint(e.target.value)} placeholder="AI will analyze text for classification..." className={`w-full border rounded-2xl p-6 min-h-[160px] outline-none transition-all ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'} focus:ring-2 focus:ring-blue-600 shadow-inner`} />
                  </div>
                  <button onClick={submitReport} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20 uppercase tracking-[0.3em] text-[11px]">
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Uplink to City Ledger <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </section>

              <section className={`lg:col-span-5 p-10 rounded-[3rem] border transition-all h-fit ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white shadow-2xl shadow-blue-900/5 border-white'}`}>
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center"><Search className="text-blue-600 w-6 h-6" /></div>
                  <h3 className="text-2xl font-black tracking-tight italic">Audit_UID</h3>
                </div>
                <div className="space-y-4">
                  <input type="text" placeholder="REF_ID: CP-XXXXX" value={searchID} onChange={(e) => setSearchID(e.target.value)} className={`w-full border rounded-2xl px-6 py-5 outline-none font-mono text-sm ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`} />
                  <button onClick={checkStatus} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600">Query Repository</button>
                </div>
                {trackedStatus && (
                  <div className="mt-12 pt-10 border-t border-slate-100/10 animate-in fade-in duration-500">
                    <div className="flex justify-between items-center mb-10 text-[10px] font-black uppercase tracking-widest italic opacity-50">TICKET: {trackedStatus.id}</div>
                    <div className="flex justify-between relative">
                      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-200/20 -translate-y-1/2" />
                      {[0,1,2,3].map(step => (
                        <div key={step} className={`w-10 h-10 rounded-xl z-10 flex items-center justify-center border-4 transition-all ${trackedStatus.stage >= step ? 'bg-blue-600 border-white text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-500'}`}><CheckCircle2 className="w-4 h-4" /></div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </main>

      {/* ADMIN MODAL */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-8">
          <div className={`w-full max-w-md rounded-[3rem] p-12 shadow-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`}>
            <h3 className="text-3xl font-black tracking-tighter mb-8 italic uppercase text-blue-600">Personnel Auth</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="text" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} className={`w-full rounded-2xl px-6 py-5 outline-none font-mono ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`} placeholder="ADMIN_USERNAME" />
              <input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} className={`w-full rounded-2xl px-6 py-5 outline-none font-mono ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`} placeholder="ADMIN_PASS_KEY" />
              <button className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs shadow-lg shadow-blue-600/20 mt-4">Verify Identity</button>
              <button type="button" onClick={() => setShowAdminModal(false)} className="w-full text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Abort Session</button>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS OVERLAY */}
      {generatedTicket && (
        <div className="fixed inset-0 bg-blue-950/90 backdrop-blur-2xl z-[101] flex items-center justify-center p-8">
          <div className="bg-white w-full max-w-lg rounded-[4rem] p-16 text-center text-slate-900 border border-white scale-in-center">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-400/50"><ShieldCheck className="text-white w-10 h-10" /></div>
            <h3 className="text-3xl font-black mb-4 tracking-tighter italic uppercase underline decoration-blue-600 underline-offset-8">Synchronized</h3>
            <div className="bg-slate-100 py-8 rounded-3xl border border-slate-200 mb-10"><span className="text-4xl font-mono font-black text-blue-600 tracking-[0.2em]">{generatedTicket}</span></div>
            <button onClick={() => setGeneratedTicket(null)} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Return to Terminal</button>
          </div>
        </div>
      )}
    </div>
  );
}