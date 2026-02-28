"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Activity, ArrowRight, Camera, CheckCircle2, Clock, Copy, Cpu, Loader2, LogOut,
  MapPin, Search, Sparkles, X, AlertTriangle, Info, ShieldAlert, Zap, Send, 
  BarChart3, TrendingUp, History, MessageSquare, FileUp, Check, RefreshCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeInput } from "@/lib/analyze";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { GlowBorder } from "@/components/ui/GlowBorder";
import { AIHighlightBox } from "@/components/ui/AIHighlightBox";
import { cn } from "@/lib/utils";

export default function AppClient({ session }) {
  const router = useRouter();
  const [locationName, setLocationName] = useState("Detecting Sector...");
  const [coords, setCoords] = useState({ lat: null, lng: null });

  // Reporting State
  const [complaint, setComplaint] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [generated, setGenerated] = useState(null);
  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Pre-submission State
  const [showPreview, setShowPreview] = useState(false);
  const [preAiResult, setPreAiResult] = useState(null);

  // Tracker State
  const [searchID, setSearchID] = useState("");
  const [tracked, setTracked] = useState(null);
  const [trackError, setTrackError] = useState("");
  const [tracking, setTracking] = useState(false);

  // AI Assistant State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hello! I am your Civic AI assistant. How can I help you today?" }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const scrollRef = useRef(null);

  const [toast, setToast] = useState(null);
  const [descriptionTouched, setDescriptionTouched] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude.toFixed(4), lng: longitude.toFixed(4) });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          setLocationName(data?.address?.suburb || data?.address?.city || "Metropolitan District");
        } catch { setLocationName("Metropolitan District"); }
      },
      () => setLocationName("Metropolitan District"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const onFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    if (f) {
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const initializeUplink = async () => {
    if (!complaint.trim()) {
      setDescriptionTouched(true);
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: complaint }),
      });
      const aiResult = await res.json();
      setPreAiResult(aiResult);
      setShowPreview(true);
    } catch (e) {
      setSubmitError("Failed to initialize AI Uplink. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitReport = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      let imageUrl = "";
      if (file) {
        setUploading(true);
        const form = new FormData();
        form.append("file", file);
        const upRes = await fetch("/api/uploads", { method: "POST", body: form });
        const upJson = await upRes.json();
        if (!upRes.ok) throw new Error(upJson.error || "Upload failed");
        imageUrl = upJson.publicUrl;
      }

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          description: complaint.trim(), 
          latitude: coords.lat, 
          longitude: coords.lng, 
          imageUrl, 
          email: session?.email, 
          ai: preAiResult 
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submit failed");

      setGenerated({ ...json.report, ai: json.ai });
      setComplaint("");
      setFile(null);
      setPreviewUrl(null);
      setShowPreview(false);
      setToast({ message: "Intelligence report committed to ledger." });
      setTimeout(() => setToast(null), 3000);
    } catch (e) { 
      setSubmitError(e.message); 
      setShowPreview(false);
    }
    finally { setUploading(false); setSubmitting(false); }
  };

  const checkStatus = async () => {
    setTrackError(""); setTracked(null);
    const id = searchID.trim().toUpperCase();
    if (!id) return;
    setTracking(true);
    try {
      const res = await fetch(`/api/reports?ticket_id=${encodeURIComponent(id)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Not found");
      const st = json.report?.status || "Submitted";
      const stages = { Submitted: 0, Verified: 1, Dispatched: 2, Resolved: 3 };
      setTracked({ id: json.report.ticket_id, stage: stages[st] ?? 0, status: st });
    } catch (e) { setTrackError(e.message); }
    finally { setTracking(false); }
  };

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setAiInput("");
    setIsAiLoading(true);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "ai", content: "I've analyzed your query against the latest civic data. Currently, District " + (coords.lat ? coords.lat.slice(0,2) : "5") + " is showing high infrastructure stability." }]);
      setIsAiLoading(false);
    }, 1500);
  };

  const copyId = async (id) => {
    await navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Sidebar Stats */}
      <aside className="lg:col-span-3 space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <AIHighlightBox className="mb-4">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
              <Sparkles size={12} /> Active Node: {locationName}
            </span>
          </AIHighlightBox>
        </motion.div>

        <div className="space-y-4">
          <StatCard label="Civic Activity" value="1,284" icon={<TrendingUp size={16} />} color="primary" delay={0.1} />
          <StatCard label="Success Rate" value="94.2%" icon={<CheckCircle2 size={16} />} color="accent" delay={0.2} />
          <StatCard label="AI Uptime" value="99.9%" icon={<Zap size={16} />} color="cyan" delay={0.3} />
        </div>

        <GlassCard className="p-6" interactive={false}>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <History size={14} /> Activity Timeline
          </h4>
          <div className="space-y-6 text-left">
            <TimelineItem title="New Report" time="2m ago" desc="Pothole detected in Sector 5" />
            <TimelineItem title="Verified" time="15m ago" desc="Water leak resolved at 4th St" />
            <TimelineItem title="System Sync" time="1h ago" desc="Ledger integrity verified" />
          </div>
        </GlassCard>
      </aside>

      {/* Main Reporter */}
      <main className="lg:col-span-6 space-y-8">
        <GlowBorder className="w-full" glowColor="rgba(109, 40, 217, 0.3)">
          <div className="p-8 space-y-8 text-left">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black tracking-tight text-white">Initialize Report</h2>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Live Uplink</span>
                </div>
              </div>
              
              <textarea
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Describe the anomaly. Our AI will classify it instantly..."
                className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 min-h-[180px] outline-none focus:border-primary/50 transition-all text-sm leading-relaxed"
              />
              {descriptionTouched && !complaint.trim() && (
                <p className="text-xs font-bold text-red-500 px-2 flex items-center gap-2">
                  <AlertTriangle size={14} /> Please provide a description.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                className={cn(
                  "relative h-48 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3",
                  dragActive ? "border-primary bg-primary/5 scale-95" : "border-white/10 bg-white/5",
                  previewUrl ? "border-solid border-white/20" : ""
                )}
              >
                {previewUrl ? (
                  <div className="relative w-full h-full p-2 group">
                    <img src={previewUrl} className="w-full h-full object-cover rounded-2xl" alt="Preview" />
                    <button onClick={() => { setFile(null); setPreviewUrl(null); }} className="absolute top-4 right-4 p-2 bg-background/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-white/5 rounded-2xl text-muted-foreground">
                      <FileUp size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold">Drag & Drop visual matrix</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">or click to browse</p>
                    </div>
                    <input type="file" onChange={onFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                  </>
                )}
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <AIHighlightBox className="h-full bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={14} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">AI Preview Panel</span>
                  </div>
                  <p className="text-[10px] leading-relaxed opacity-70">
                    "AI classifications are generated in real-time. Please review the analysis before final sync to the civic ledger."
                  </p>
                </AIHighlightBox>
              </div>
            </div>

            {submitError && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-3">
                <ShieldAlert size={18} /> {submitError}
              </div>
            )}

            <AnimatedButton 
              onClick={initializeUplink} 
              disabled={!complaint.trim() || submitting}
              className="w-full py-5 text-sm uppercase tracking-[0.3em] shadow-glow-primary"
            >
              <span className="flex items-center gap-3">Initialize Uplink <ArrowRight size={18} /></span>
            </AnimatedButton>
          </div>
        </GlowBorder>
      </main>

      {/* Tracker Side */}
      <aside className="lg:col-span-3 space-y-8 text-left">
        <GlassCard className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-accent/10 rounded-2xl text-accent border border-accent/20">
              <Search size={20} />
            </div>
            <div>
              <h4 className="text-xl font-black">Audit Tracker</h4>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Query Ledger</p>
            </div>
          </div>
          <input 
            value={searchID} onChange={(e) => setSearchID(e.target.value)}
            placeholder="TICKET-ID-XXXXX" 
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none font-mono text-xs mb-4 focus:border-accent/50"
          />
          <AnimatedButton onClick={checkStatus} variant="secondary" className="w-full py-4 text-[10px] uppercase tracking-widest">
            {tracking ? <Loader2 className="animate-spin" size={16} /> : "Validate Reference"}
          </AnimatedButton>

          <AnimatePresence>
            {tracked && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-10 pt-10 border-t border-white/10 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Status: {tracked.status}</span>
                </div>
                <div className="flex justify-between relative">
                  <div className="absolute top-1/2 w-full h-[1px] bg-white/10 -translate-y-1/2" />
                  {[0,1,2,3].map(s => (
                    <div key={s} className={cn(
                      "w-8 h-8 rounded-xl z-10 flex items-center justify-center border transition-all duration-500",
                      tracked.stage >= s ? "bg-accent border-accent text-white shadow-glow-blue" : "bg-background border-white/5 text-muted-foreground"
                    )}>
                      {tracked.stage > s ? <CheckCircle2 size={14} /> : <div className="w-1 h-1 rounded-full bg-current" />}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        <AIHighlightBox className="border-accent/30 bg-accent/5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-accent" />
            <span className="font-black text-[10px] uppercase tracking-widest text-accent">Data Insight</span>
          </div>
          <p className="text-[11px] leading-relaxed opacity-80">
            Current system trust index: <span className="text-white font-bold">98.4%</span>.
            Metropolitan response latency is within standard parameters.
          </p>
        </AIHighlightBox>
      </aside>

      {/* Pre-submission Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 bg-background/95 backdrop-blur-3xl z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-2xl">
              <GlowBorder glowColor="rgba(109, 40, 217, 0.5)">
                <div className="p-10 space-y-8 text-left">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-black tracking-tight">Review Classification</h2>
                      <p className="text-sm text-muted-foreground">Neural analysis complete. Confirm data before sync.</p>
                    </div>
                    <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-4">AI Analysis Report</p>
                        <div className="space-y-4">
                          <AiStatItem label="Category" value={preAiResult?.cat} />
                          <AiStatItem label="Priority Level" value={`P-${preAiResult?.prio}`} />
                          <AiStatItem label="Est. Resolution" value={preAiResult?.time} />
                        </div>
                      </div>
                      <div className="px-2">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">Description Preview</p>
                        <p className="text-xs text-muted-foreground line-clamp-3 italic">"{complaint}"</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="h-48 rounded-3xl bg-white/5 border border-white/10 overflow-hidden relative">
                        {previewUrl ? (
                          <img src={previewUrl} className="w-full h-full object-cover" alt="Verification" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
                            <Camera size={32} className="mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No Visual Matrix</p>
                          </div>
                        )}
                        <div className="absolute top-4 left-4 px-3 py-1 bg-background/80 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest">
                          Visual Data
                        </div>
                      </div>
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-3">
                        <ShieldAlert size={20} className="text-primary" />
                        <p className="text-[10px] font-medium leading-relaxed opacity-80 italic">
                          This report will be linked to: <span className="text-white font-bold underline">{session?.email}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <AnimatedButton onClick={() => setShowPreview(false)} variant="outline" className="flex-1 py-5">
                      <RefreshCcw size={16} /> Edit Data
                    </AnimatedButton>
                    <AnimatedButton onClick={submitReport} disabled={submitting} className="flex-[2] py-5 shadow-glow-primary">
                      {submitting ? <Loader2 className="animate-spin" /> : <span className="flex items-center gap-2">Confirm & Sync to Ledger <Check size={18} /></span>}
                    </AnimatedButton>
                  </div>
                </div>
              </GlowBorder>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {generated && (
          <div className="fixed inset-0 bg-background/90 backdrop-blur-2xl z-[300] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg">
              <GlowBorder glowColor="rgba(109, 40, 217, 0.5)">
                <div className="p-10 text-center space-y-10">
                   <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto shadow-glow-primary rotate-12">
                     <CheckCircle2 className="text-white w-10 h-10" />
                   </div>
                   <div className="space-y-2">
                     <h2 className="text-3xl font-black">Sync Complete</h2>
                     <p className="text-sm text-muted-foreground">Your report is now live on the metropolitan network.</p>
                   </div>
                   <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 relative group">
                     <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4">Official Reference ID</p>
                     <p className="text-4xl font-mono font-black text-primary tracking-widest mb-6">{generated.ticket_id}</p>
                     <AnimatedButton 
                        onClick={() => copyId(generated.ticket_id)} 
                        variant="outline" 
                        className={cn("w-full py-3 text-[10px] uppercase tracking-widest transition-all", copied ? "bg-green-500/10 border-green-500/30 text-green-500" : "")}
                      >
                       {copied ? "ID Copied" : <span className="flex items-center justify-center gap-2"><Copy size={14} /> Copy Reference</span>}
                     </AnimatedButton>
                   </div>
                   <AnimatedButton onClick={() => setGenerated(null)} className="w-full py-5 font-black uppercase tracking-[0.2em]">Acknowledge</AnimatedButton>
                </div>
              </GlowBorder>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Assistant Button & Panel (Same as previous implementation) */}
      <motion.button onClick={() => setIsAiOpen(true)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="fixed bottom-10 right-10 w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-2xl z-[80] shadow-glow-primary group">
        <MessageSquare className="text-white group-hover:rotate-12 transition-transform" />
      </motion.button>

      <AnimatePresence>
        {isAiOpen && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }} className="fixed top-0 right-0 h-screen w-full max-w-md z-[200] glass border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden text-left">
            <div className="p-8 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-2xl"><Sparkles className="text-primary" size={20} /></div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">Civic Assistant</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Operational</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X size={20} /></button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {messages.map((m, i) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={cn("flex flex-col max-w-[85%]", m.role === "user" ? "ml-auto items-end" : "items-start")}>
                  <div className={cn("p-4 rounded-3xl text-sm leading-relaxed", m.role === "user" ? "bg-primary text-white rounded-tr-none" : "bg-white/5 border border-white/10 rounded-tl-none")}>
                    {m.content}
                  </div>
                  <span className="text-[9px] font-bold uppercase opacity-30 mt-2 px-2">{m.role === "user" ? "Citizen" : "Civic AI"}</span>
                </motion.div>
              ))}
            </div>
            <form onSubmit={handleAiSubmit} className="p-8 border-t border-white/10 flex gap-4">
              <input value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="Ask intelligence..." className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-primary/50 text-sm" />
              <AnimatedButton className="px-4 py-4 rounded-2xl"><Send size={18} /></AnimatedButton>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const AiStatItem = ({ label, value }) => (
  <div className="flex justify-between items-center pb-2 border-b border-white/5">
    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
    <span className="text-xs font-black text-white">{value}</span>
  </div>
);

const StatCard = ({ label, value, icon, color, delay }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <div className="glass glass-hover p-5 rounded-3xl flex items-center justify-between border-white/5">
      <div className="flex items-center gap-3">
        <div className={cn("p-2.5 rounded-xl border border-white/10", 
          color === "primary" ? "bg-primary/10 text-primary shadow-[0_0_10px_rgba(109,40,217,0.2)]" : 
          color === "accent" ? "bg-accent/10 text-accent shadow-[0_0_10px_rgba(59,130,246,0.2)]" : "bg-cyan-500/10 text-cyan-400"
        )}>
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <span className="text-xl font-black tracking-tight text-white tabular-nums">{value}</span>
    </div>
  </motion.div>
);

const TimelineItem = ({ title, time, desc }) => (
  <div className="timeline-dot">
    <div className="flex justify-between items-start mb-1">
      <h5 className="text-[10px] font-black uppercase tracking-widest text-white">{title}</h5>
      <span className="text-[9px] font-bold text-muted-foreground">{time}</span>
    </div>
    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">{desc}</p>
  </div>
);
