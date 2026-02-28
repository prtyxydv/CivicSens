"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  MapPin, Search, Sparkles, X, Camera, Loader2, LogOut, Check, FileUp, Copy, Activity, ShieldCheck, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeInput } from "@/lib/analyze";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

// Load map dynamically to avoid SSR errors
const Map = dynamic(() => import("@/components/DynamicMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted/20 animate-pulse rounded-2xl flex items-center justify-center text-muted-foreground uppercase font-black tracking-widest text-xs">Initializing Geo-Sync...</div>
});

export default function AppClient({ session }) {
  const router = useRouter();
  const [locationName, setLocationName] = useState("Locating...");
  const [coords, setCoords] = useState({ lat: 37.7749, lng: -122.4194 }); 
  const [recentReports, setRecentReports] = useState([]);

  // Reporting State
  const [complaint, setComplaint] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [generated, setGenerated] = useState(null);
  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Pre-submission
  const [showPreview, setShowPreview] = useState(false);
  const [preAiResult, setPreAiResult] = useState(null);

  // Tracker
  const [searchID, setSearchID] = useState("");
  const [tracked, setTracked] = useState(null);
  const [trackError, setTrackError] = useState("");
  const [tracking, setTracking] = useState(false);

  const [descriptionTouched, setDescriptionTouched] = useState(false);

  useEffect(() => {
    // Fetch all reports for the map view
    const fetchReports = async () => {
      const { data } = await supabase.from("reports").select("*").not("latitude", "is", null);
      if (data) setRecentReports(data);
    };
    fetchReports();

    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        updateLocationName(latitude, longitude);
      },
      null,
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const updateLocationName = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      setLocationName(data?.address?.city || data?.address?.suburb || "Metropolitan Node");
    } catch { setLocationName("Metropolitan Node"); }
  };

  const handleLocationSelect = (lat, lng) => {
    setCoords({ lat, lng });
    updateLocationName(lat, lng);
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

  const onFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    if (f) {
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
      if (!res.ok) throw new Error("AI analysis offline.");
      setPreAiResult(aiResult);
      setShowPreview(true);
    } catch (e) {
      setSubmitError("AI Core failed. Using basic logic.");
      const fallback = analyzeInput(complaint);
      setPreAiResult(fallback);
      setShowPreview(true);
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
        if (!upRes.ok) throw new Error(upJson.error || "Matrix upload failed");
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
      if (!res.ok) throw new Error(json.error || "Ledger sync failed");

      setGenerated({ ...json.report, ai: json.ai });
      setComplaint("");
      setFile(null);
      setPreviewUrl(null);
      setPreAiResult(null);
      setShowPreview(false);
      setDescriptionTouched(false);
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
      if (!res.ok) throw new Error(json.error || "ID not found.");
      const report = json.report;
      const stages = { Submitted: 0, Verified: 1, Dispatched: 2, Resolved: 3 };
      setTracked({ 
        id: report.ticket_id, 
        stage: stages[report.status] ?? 0, 
        status: report.status,
        category: report.category,
        dept: report.department,
        score: report.severity_score,
        assessment: report.risk_assessment,
        lat: report.latitude,
        lng: report.longitude
      });
    } catch (e) { setTrackError(e.message); }
    finally { setTracking(false); }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="bg-background min-h-[calc(100vh-80px)] p-4 md:p-10 lg:p-16 transition-colors duration-700">
      <div className="max-w-[1400px] mx-auto h-full grid lg:grid-cols-[280px_1fr_320px] gap-10 lg:h-[calc(100vh-180px)]">
        
        {/* Left Sidebar */}
        <aside className="flex flex-col gap-8">
          <div className="intelligence-card p-8 border border-white/5 shadow-2xl">
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-accent-blue">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-blue shadow-[0_0_10px_var(--accent-blue)]" />
                <span>Node Core</span>
              </div>
              <h2 className="text-3xl font-black tracking-tighter text-foreground leading-[0.9]">{locationName}</h2>
              <p className="text-[10px] text-muted-foreground font-mono tabular-nums tracking-widest uppercase">
                {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </p>
            </div>

            <div className="pt-8 border-t border-white/5 mt-8">
              <div className="flex justify-between items-center group text-left">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest italic">Identity</p>
                  <p className="text-sm font-black truncate text-foreground">{session?.email?.split('@')[0]}</p>
                </div>
                <button onClick={logout} className="p-3 hover:bg-foreground/5 rounded-xl transition-all duration-500 text-foreground/20 hover:text-foreground">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="editorial-card p-8 border border-white/5 flex flex-col gap-6 overflow-hidden">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground/30 text-left italic">Hotspot Matrix</h3>
            <div className="h-48 relative group overflow-hidden rounded-xl border border-white/5 shadow-inner">
              <Map 
                center={[coords.lat, coords.lng]} 
                zoom={14} 
                reports={recentReports}
                userLocation={[coords.lat, coords.lng]}
                onLocationSelect={handleLocationSelect}
                showUserMarker={true}
              />
              <p className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 text-[8px] font-bold uppercase tracking-widest border border-white/5 backdrop-blur-md pointer-events-none">Click map to refine</p>
            </div>
          </div>
        </aside>

        {/* Workspace */}
        <main className="intelligence-card flex flex-col border border-white/5 bg-foreground/[0.01]">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 lg:p-16">
            <div className="max-w-xl mx-auto space-y-16">
              <div className="space-y-4 text-left">
                <h1 className="text-6xl font-black tracking-tighter text-foreground leading-none uppercase italic">Report.<br />Sync.</h1>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-md">
                  Log infrastructure anomalies directly to the municipal ledger.
                </p>
              </div>

              <div className="space-y-12 text-left">
                <div className="space-y-4 group">
                  <label className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground/20 group-focus-within:text-accent-blue transition-colors ml-1 italic">01 Description</label>
                  <textarea
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    placeholder="Describe the issue. Be specific about landmarks."
                    className="w-full min-h-[180px] text-3xl font-black tracking-tighter resize-none !rounded-none bg-transparent border-none p-0 focus:ring-0 placeholder:text-foreground/5 text-foreground"
                  />
                  <div className="h-px w-full bg-white/5 group-focus-within:bg-accent-blue transition-all duration-700" />
                  {descriptionTouched && !complaint.trim() && (
                    <p className="text-[11px] font-black uppercase tracking-widest text-red-500/60 ml-1">Input Required</p>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground/20 ml-1 italic">02 Visual Matrix</label>
                  <div 
                    onDragEnter={(e)=>{e.preventDefault(); setDragActive(true)}} onDragOver={(e)=>{e.preventDefault(); setDragActive(true)}} onDragLeave={(e)=>{e.preventDefault(); setDragActive(false)}} onDrop={handleDrop}
                    className={cn(
                      "relative h-56 border border-dashed border-white/10 bg-foreground/[0.01] rounded-3xl flex flex-col items-center justify-center gap-4 transition-all hover:bg-foreground/[0.02] cursor-pointer overflow-hidden",
                      dragActive && "border-accent-blue/40 bg-accent-blue/5 scale-[0.99]",
                      previewUrl && "border-solid border-white/10 p-1"
                    )}
                  >
                    {previewUrl ? (
                      <div className="relative w-full h-full group">
                        <img src={previewUrl} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" alt="Preview" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                          <button onClick={(e) => { e.stopPropagation(); setFile(null); setPreviewUrl(null); }} className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-md shadow-2xl">
                            Purge
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-5 bg-foreground/[0.02] rounded-2xl border border-white/5 shadow-inner group-hover:border-accent-blue/20 transition-colors">
                          <FileUp size={24} className="text-foreground/20" />
                        </div>
                        <div className="text-center">
                          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/40 italic">Add Evidence</p>
                        </div>
                        <input type="file" onChange={onFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-12 border-t border-white/5 bg-background/50 backdrop-blur-2xl mt-auto">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-12">
              <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] text-foreground/20">
                <Sparkles size={16} className="text-accent-violet animate-pulse" />
                <span>AI Ready</span>
              </div>
              <AnimatedButton 
                onClick={initializeUplink} 
                disabled={!complaint.trim() || submitting}
                className="w-full sm:w-auto px-20 py-6 text-[12px] tracking-[0.4em] !rounded-none bg-foreground text-background font-black uppercase shadow-2xl"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : "Continue"}
              </AnimatedButton>
            </div>
          </div>
        </main>

        {/* Audit Sidebar */}
        <aside className="flex flex-col gap-8 text-left">
          <div className="intelligence-card p-10 flex flex-col gap-10 border-white/5 shadow-2xl">
            <h4 className="text-2xl font-black tracking-tighter uppercase italic opacity-40">Audit.</h4>
            <div className="space-y-6">
              <input 
                value={searchID} onChange={(e) => setSearchID(e.target.value)}
                placeholder="ID-XXXXX" 
                className="w-full text-center font-mono text-sm tracking-[0.4em] uppercase bg-foreground/5 border-b border-white/10 rounded-none px-4 py-5 focus:border-accent-blue transition-all text-foreground"
              />
              <AnimatedButton onClick={checkStatus} variant="outline" className="w-full py-5 text-[10px] tracking-[0.3em] !rounded-none">
                {tracking ? <Loader2 className="animate-spin" size={16} /> : "Validate ID"}
              </AnimatedButton>
            </div>

            <AnimatePresence mode="wait">
              {tracked && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="space-y-10 pt-10 mt-10 overflow-hidden border-t border-white/5">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-foreground/30 tracking-widest italic">Status</span>
                      <span className="text-[11px] font-black uppercase text-accent-teal tabular-nums">{tracked.status}</span>
                    </div>
                    <div className="flex gap-2.5">
                      {[0,1,2,3].map(s => (
                        <div key={s} className={cn(
                          "h-1 flex-1 transition-all duration-1000 rounded-full",
                          tracked.stage >= s ? "bg-accent-blue shadow-[0_0_15px_var(--accent-blue)]" : "bg-white/5"
                        )} />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-white/[0.03]">
                    <DetailItem label="AI Result" value={tracked.category} />
                    <DetailItem label="Severity" value={`${tracked.score}/100`} color="text-accent-teal" />
                    {tracked.lat && (
                      <div className="h-32 w-full mt-4 rounded-sm overflow-hidden border border-white/5">
                        <Map center={[tracked.lat, tracked.lng]} zoom={15} userLocation={[tracked.lat, tracked.lng]} showUserMarker={true} />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {(showPreview || generated) && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-3xl overflow-hidden">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-background border border-white/10 rounded-sm shadow-2xl relative">
              
              {showPreview && !generated && (
                <div className="p-10 md:p-16 space-y-12 text-left">
                  <button onClick={() => setShowPreview(false)} className="absolute top-8 right-8 p-4 text-foreground/20 hover:text-foreground transition-all duration-500"><X size={32} /></button>
                  <div className="space-y-6 border-b border-white/5 pb-10">
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-[-0.04em] leading-[0.8] text-foreground italic">Verify.<br /><span className="text-accent-blue opacity-20">Sync.</span></h2>
                    <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.4em] italic text-left">Confirm analysis results.</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-16">
                    <div className="space-y-10">
                      <InsightMetric label="Category" value={preAiResult?.cat} />
                      <div className="grid grid-cols-2 gap-8 border-b border-white/5 pb-8">
                        <InsightMetric label="Priority" value={`Level ${preAiResult?.prio}`} noBorder />
                        <InsightMetric label="Severity" value={`${preAiResult?.score}/100`} noBorder />
                      </div>
                      <InsightMetric label="Dept" value={preAiResult?.dept} />
                    </div>
                    <div className="aspect-square bg-foreground/[0.02] border border-white/10 overflow-hidden rounded-xl flex items-center justify-center">
                      {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover grayscale opacity-80" /> : <div className="text-foreground/5"><Camera size={64} /></div>}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6 pt-10 border-t border-white/5">
                    <AnimatedButton onClick={submitReport} disabled={submitting} className="flex-[2] py-8 text-[12px] bg-foreground text-background tracking-[0.5em] shadow-2xl !rounded-none font-black uppercase">
                      {submitting ? <Loader2 className="animate-spin" /> : "Commit to Ledger"}
                    </AnimatedButton>
                    <AnimatedButton onClick={() => setShowPreview(false)} variant="secondary" className="flex-1 py-8 text-[12px] tracking-[0.4em] border-white/5 opacity-60 !rounded-none font-black uppercase">Abort</AnimatedButton>
                  </div>
                </div>
              )}

              {generated && (
                <div className="p-12 md:p-20 text-center space-y-16">
                  <div className="space-y-10">
                    <div className="w-24 h-24 bg-accent-teal text-background flex items-center justify-center mx-auto rounded-full shadow-[0_0_50px_rgba(45,212,191,0.3)]"><Check size={48} /></div>
                    <h2 className="text-7xl font-black uppercase tracking-[-0.04em] leading-none italic text-foreground">Success.</h2>
                  </div>
                  <div className="space-y-8 border-y border-white/5 py-16">
                    <p className="text-[11px] font-black uppercase tracking-[0.6em] text-foreground/20 text-center">Ticket ID</p>
                    <p className="text-5xl md:text-7xl font-mono font-black tracking-widest text-foreground tabular-nums select-all">{generated.ticket_id}</p>
                    <button onClick={() => { navigator.clipboard.writeText(generated.ticket_id); setCopied(true); setTimeout(()=>setCopied(false), 2000); }} className="mt-10 text-[11px] font-black uppercase tracking-[0.4em] text-accent-blue hover:text-foreground transition-all flex items-center justify-center gap-3 mx-auto italic">
                      {copied ? <><Check size={14}/> Node Copied</> : <><Copy size={14}/> Copy Reference</>}
                    </button>
                  </div>
                  <AnimatedButton onClick={() => setGenerated(null)} className="w-full py-10 text-sm tracking-[0.6em] !rounded-none font-black uppercase">Close Interface</AnimatedButton>
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const InsightMetric = ({ label, value, noBorder }) => (
  <div className={cn("space-y-4 text-left", !noBorder && "border-b border-white/5 pb-8")}>
    <span className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] italic">{label}</span>
    <p className="text-2xl font-black uppercase tracking-tight text-foreground">{value || "Analyzing..."}</p>
  </div>
);

const DetailItem = ({ label, value, color = "text-foreground" }) => (
  <div className="space-y-2 text-left">
    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/20 italic">{label}</p>
    <p className={cn("text-lg font-black uppercase tracking-tighter", color)}>{value}</p>
  </div>
);
