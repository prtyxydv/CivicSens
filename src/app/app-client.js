"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock,
  Copy,
  Cpu,
  Loader2,
  LogOut,
  MapPin,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { analyzeInput } from "@/lib/analyze";

export default function AppClient({ session }) {
  const router = useRouter();

  const [isDark, setIsDark] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [locationName, setLocationName] = useState("Detecting Sector...");
  const [coords, setCoords] = useState({ lat: null, lng: null });

  const [complaint, setComplaint] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [generated, setGenerated] = useState(null);
  const [copied, setCopied] = useState(false);

  const [searchID, setSearchID] = useState("");
  const [tracked, setTracked] = useState(null);
  const [trackError, setTrackError] = useState("");
  const [tracking, setTracking] = useState(false);

  const [toast, setToast] = useState(null);
  const [descriptionTouched, setDescriptionTouched] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const saved = localStorage.getItem("civicsens_theme");
    if (saved) setIsDark(saved === "dark");
  }, []);

  useEffect(() => {
    const onMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude.toFixed(4), lng: longitude.toFixed(4) });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const data = await res.json();
          setLocationName(
            data?.address?.suburb ||
              data?.address?.neighbourhood ||
              data?.address?.city ||
              "Metropolitan District",
          );
        } catch {
          setLocationName("Metropolitan District");
        }
      },
      () => setLocationName("Metropolitan District"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("civicsens_theme", next ? "dark" : "light");
  };

  const removeImage = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  };

  const canSubmit = useMemo(() => complaint.trim().length > 0 && !submitting, [
    complaint,
    submitting,
  ]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
    router.refresh();
  };

  const copyTicket = async () => {
    if (!generated?.ticket_id) return;
    try {
      await navigator.clipboard.writeText(generated.ticket_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
      showToast("Ticket ID copied to clipboard.");
    } catch {}
  };

  const submitReport = async () => {
    setSubmitError("");
    setTracked(null);
    setDescriptionTouched(true);
    if (!complaint.trim()) {
      setSubmitError("Please enter a description of the issue.");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = "";

      if (file) {
        setUploading(true);
        const form = new FormData();
        form.append("file", file);
        const upRes = await fetch("/api/uploads", { method: "POST", body: form });
        const upJson = await upRes.json().catch(() => null);
        if (!upRes.ok || !upJson?.ok) {
          throw new Error(upJson?.error || "Image upload failed");
        }
        imageUrl = upJson.publicUrl;
      }

      const ai = analyzeInput(complaint);
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: complaint.trim(),
          latitude: coords.lat,
          longitude: coords.lng,
          imageUrl,
          email: session?.email,
          ai,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Submit failed");
      }

      setGenerated({ ...json.report, ai: json.ai });
      setComplaint("");
      removeImage();
      showToast("Report submitted successfully.");
    } catch (e) {
      setSubmitError(e?.message || "Something went wrong");
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  const checkStatus = async () => {
    setTrackError("");
    setTracked(null);
    const id = searchID.trim().toUpperCase();
    if (!id) return;

    setTracking(true);
    try {
      const res = await fetch(`/api/reports?ticket_id=${encodeURIComponent(id)}`);
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Not found");
      }
      const st = json.report?.status || "Submitted";
      const stages = { Submitted: 0, Verified: 1, Dispatched: 2, Resolved: 3 };
      setTracked({ id: json.report.ticket_id, stage: stages[st] ?? 0, status: st });
    } catch (e) {
      setTrackError(e?.message || "Not found");
    } finally {
      setTracking(false);
    }
  };

  const shellBg = isDark
    ? "bg-slate-950 text-slate-100"
    : "bg-[#fcfdfe] text-slate-900";
  const panel = isDark
    ? "bg-slate-900/40 border-slate-800"
    : "bg-white/80 border-slate-200 shadow-2xl shadow-slate-200/60";
  const input = isDark
    ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
    : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20";

  return (
    <div className={`min-h-screen transition-colors duration-700 ease-out font-sans relative overflow-hidden ${shellBg}`}>
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, ${
            isDark ? "rgba(37, 99, 235, 0.12)" : "rgba(37, 99, 235, 0.05)"
          }, transparent 80%)`,
        }}
      />

      <nav
        className={`relative z-50 border-b px-8 py-5 flex justify-between items-center backdrop-blur-xl transition-all ${
          isDark ? "border-slate-800 bg-slate-950/60" : "border-slate-200/60 bg-white/60"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
            <Cpu className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none">CivicSens</h1>
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase opacity-50 mt-1">
              {locationName} • {session?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all active:scale-[0.97] hover:-translate-y-0.5 ${
              isDark
                ? "border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-900"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={logout}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-[0.97] hover:-translate-y-0.5 ${
              isDark
                ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/15"
                : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto py-12 px-6">
        <div className="grid lg:grid-cols-12 gap-10">
          <section className="lg:col-span-7 animate-[fadeInUp_650ms_ease-out_both]">
            <h2 className="text-6xl font-black tracking-tighter leading-[0.9] mb-4">
              Report. <span className="text-blue-600">Resolve.</span>
            </h2>
            <p className="text-slate-500 text-lg font-medium max-w-lg mb-10">
              Submit an issue with optional photo evidence. Our system classifies it and generates a ticket instantly.
            </p>

            <div className={`p-10 rounded-[3rem] border backdrop-blur-2xl ${panel}`}>
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-4 block">
                    Visual evidence (optional)
                  </label>
                  <div
                    className={`relative h-52 rounded-[2rem] border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${
                      isDark
                        ? "border-slate-800 hover:border-blue-500 bg-slate-950/50"
                        : "border-slate-200 hover:border-blue-400 bg-slate-50"
                    }`}
                  >
                    {previewUrl ? (
                      <div className="relative w-full h-full group">
                        <img
                          src={previewUrl}
                          className="w-full h-full object-cover"
                          alt="Preview"
                        />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <button
                            onClick={removeImage}
                            type="button"
                            className="bg-red-500 text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all active:scale-[0.98]"
                          >
                            Remove image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          onChange={onFileChange}
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="text-center">
                          <Camera className="w-10 h-10 opacity-40 text-blue-500 mx-auto mb-2 transition-all" />
                          <p className="text-xs font-bold text-slate-400">
                            Click to upload photo
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-4 block">
                    Issue description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    onBlur={() => setDescriptionTouched(true)}
                    placeholder="Describe the issue. Include landmarks if possible..."
                    aria-invalid={descriptionTouched && !complaint.trim()}
                    className={`w-full rounded-[2rem] p-6 min-h-[170px] outline-none border transition-all ring-0 focus:ring-4 text-sm font-medium ${input} ${
                      descriptionTouched && !complaint.trim()
                        ? "border-red-500/50 focus:border-red-500"
                        : ""
                    }`}
                  />
                  {descriptionTouched && !complaint.trim() && (
                    <p className="mt-2 text-xs font-bold text-red-500">Description is required.</p>
                  )}
                </div>

                {submitError && (
                  <div
                    className={`rounded-2xl border px-5 py-4 text-[12px] font-bold ${
                      isDark
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : "bg-red-50 border-red-200 text-red-700"
                    } animate-[pop_250ms_ease-out_both]`}
                  >
                    {submitError}
                  </div>
                )}

                <button
                  onClick={submitReport}
                  disabled={!canSubmit || uploading}
                  className={`w-full py-6 rounded-[2rem] flex items-center justify-center gap-3 font-black uppercase tracking-[0.3em] text-[11px] transition-all active:scale-[0.98] ${
                    !canSubmit || uploading
                      ? isDark
                        ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                        : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-600/30 hover:-translate-y-0.5"
                  }`}
                >
                  {submitting || uploading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      {uploading ? "Uploading..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      Submit report <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-50">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      {coords.lat && coords.lng ? `${coords.lat}, ${coords.lng}` : "Location not available"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Session: {session?.role}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-5 pt-2 lg:pt-24 animate-[fadeInUp_800ms_ease-out_both]">
            <div className={`p-10 rounded-[3rem] border backdrop-blur-2xl ${panel}`}>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-slate-900 rounded-2xl shadow-lg">
                  <Search className="text-white w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Audit Tracker</h3>
                  <p className="text-[11px] font-medium text-slate-500">
                    Check the current status of any ticket.
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  placeholder="Enter Ticket ID (e.g. CS-12345)"
                  value={searchID}
                  onChange={(e) => setSearchID(e.target.value)}
                  className={`w-full rounded-2xl px-6 py-5 outline-none font-mono text-sm border transition-all ring-0 focus:ring-4 ${input}`}
                />
                <button
                  onClick={checkStatus}
                  disabled={tracking}
                  className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] ${
                    tracking
                      ? isDark
                        ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                        : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                      : isDark
                        ? "bg-slate-900 text-white hover:bg-blue-600 shadow-lg shadow-blue-950/30"
                        : "bg-slate-900 text-white hover:bg-blue-600 shadow-lg shadow-slate-900/20"
                  }`}
                >
                  {tracking ? "Querying..." : "Query ledger"}
                </button>
              </div>

              {trackError && (
                <div
                  className={`rounded-2xl border px-5 py-4 text-[12px] font-bold mb-6 ${
                    isDark
                      ? "bg-red-500/10 border-red-500/20 text-red-400"
                      : "bg-red-50 border-red-200 text-red-700"
                  } animate-[pop_250ms_ease-out_both]`}
                  role="alert"
                >
                  {trackError}
                </div>
              )}

              {!tracked && !trackError && !tracking && searchID.trim() === "" && (
                <p className="text-sm text-slate-500 font-medium mb-6">
                  Enter a ticket ID above and click &quot;Query ledger&quot; to see its status.
                </p>
              )}

              {tracked && (
                <div className="pt-8 border-t border-slate-500/20 animate-[fadeInUp_450ms_ease-out_both]">
                  <div className="flex justify-between items-center mb-8 text-[10px] font-black opacity-60 tracking-widest uppercase">
                    <span>Ticket: {tracked.id}</span>
                    <span className="text-blue-500">{tracked.status}</span>
                  </div>
                  <div className="flex justify-between relative px-2">
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-500/20 -translate-y-1/2" />
                    {["Submitted", "Verified", "Dispatched", "Resolved"].map((label, step) => (
                      <div key={step} className="relative flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-xl z-10 flex items-center justify-center border-2 transition-all ${
                            tracked.stage >= step
                              ? "bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.35)]"
                              : isDark
                                ? "bg-slate-950 border-slate-800 text-slate-600"
                                : "bg-white border-slate-200 text-slate-400"
                          }`}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span
                          className={`absolute -bottom-6 text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${
                            tracked.stage >= step ? "text-blue-500" : "opacity-30"
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {generated && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[101] flex items-center justify-center p-6">
          <div
            className={`w-full max-w-md rounded-[3rem] p-10 text-center border animate-[pop_240ms_ease-out_both] ${
              isDark
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-200 shadow-2xl"
            }`}
          >
            <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.35)]">
              <CheckCircle2 className="text-white w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black tracking-tighter mb-2">Network Synced</h2>
            <p className="text-sm opacity-60 mb-8 font-medium">
              Your report is secured. Save your ticket ID to track progress.
            </p>

            <div
              className={`py-7 rounded-[2.5rem] border mb-6 ${
                isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
              }`}
            >
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
                Official ticket ID
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl font-mono font-black text-blue-500 tracking-widest">
                  {generated.ticket_id}
                </span>
                <button
                  onClick={copyTicket}
                  className={`p-2 rounded-xl border transition-all active:scale-[0.97] ${
                    copied
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                      : isDark
                        ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                  aria-label="Copy ticket id"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied && (
                <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  Copied
                </p>
              )}
            </div>

            {generated.ai && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">
                    Category
                  </p>
                  <p className="text-xs font-bold">{generated.ai.cat}</p>
                </div>
                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">
                    Priority
                  </p>
                  <p className="text-xs font-bold">Level {generated.ai.prio}</p>
                </div>
              </div>
            )}

            {generated.ai?.time && (
              <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-3xl mb-8 text-left flex items-center gap-4">
                <Clock className="w-8 h-8 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
                    Est. response time
                  </p>
                  <p className="text-sm font-bold">{generated.ai.time}</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setGenerated(null)}
              className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-[0.98] ${
                isDark ? "bg-slate-100 text-slate-900 hover:bg-white" : "bg-slate-900 text-white hover:bg-blue-600"
              }`}
            >
              Acknowledge
            </button>

            <button
              type="button"
              onClick={() => setGenerated(null)}
              className="mt-4 w-full text-center text-[10px] font-black opacity-40 uppercase tracking-widest hover:opacity-100 transition-opacity"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => setGenerated(null)}
              className="absolute top-6 right-6 p-3 rounded-2xl bg-slate-500/10 hover:bg-slate-500/20 transition-all active:scale-[0.98]"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Success toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[102] px-6 py-4 rounded-2xl border shadow-2xl animate-[fadeInUp_200ms_ease-out_both] bg-emerald-500/95 border-emerald-400/30 text-white font-bold text-sm backdrop-blur-md"
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

