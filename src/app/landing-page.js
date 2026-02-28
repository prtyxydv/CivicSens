"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Cpu,
  Moon,
  ShieldCheck,
  Sun,
  Zap,
  MapPin,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  const [isDark, setIsDark] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const saved = localStorage.getItem("civicsens_theme");
    if (saved) setIsDark(saved === "dark");
  }, []);

  useEffect(() => {
    const onMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("civicsens_theme", next ? "dark" : "light");
  };

  const bg = isDark ? "bg-slate-950 text-slate-100" : "bg-[#fcfdfe] text-slate-900";
  const glass = isDark
    ? "bg-slate-900/30 border border-slate-800/80 backdrop-blur-2xl shadow-2xl shadow-black/10"
    : "bg-white/60 border border-slate-200/80 backdrop-blur-2xl shadow-2xl shadow-slate-200/50";
  const card = `${glass} transition-all duration-300 hover:translate-y-[-2px] hover:shadow-blue-500/5`;

  return (
    <div className={`min-h-screen font-sans ${bg} transition-colors duration-500 overflow-hidden`}>
      {/* Cursor-following glow (interactive background) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(900px circle at ${mousePos.x}px ${mousePos.y}px, ${
            isDark ? "rgba(37, 99, 235, 0.15)" : "rgba(37, 99, 235, 0.08)"
          }, transparent 45%), radial-gradient(700px circle at ${mousePos.x * 0.9}px ${mousePos.y * 1.1}px, ${
            isDark ? "rgba(16, 185, 129, 0.08)" : "rgba(16, 185, 129, 0.05)"
          }, transparent 40%)`,
        }}
      />
      {/* Static ambient gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-60"
        style={{
          background: "radial-gradient(ellipse 120% 80% at 50% -20%, rgba(37, 99, 235, 0.12), transparent), radial-gradient(ellipse 80% 50% at 100% 50%, rgba(16, 185, 129, 0.06), transparent)",
        }}
      />

      <nav className={`relative z-10 border-b backdrop-blur-xl px-6 py-4 flex justify-between items-center transition-all duration-300 ${
        isDark ? "border-slate-800/60 bg-slate-950/50" : "border-slate-200/80 bg-white/70"
      }`}>
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <span className={`text-xl font-black tracking-tighter ${isDark ? "text-slate-100" : "text-slate-900"}`}>CivicSens</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all ${
              isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-600"
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link
            href="/login?role=admin"
            className={`text-sm font-bold transition-colors ${isDark ? "text-slate-400 hover:text-blue-400" : "text-slate-600 hover:text-blue-600"}`}
          >
            Admin
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Get started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24">
        {/* Hero — one-line value proposition */}
        <section className="text-center mb-20 md:mb-28 animate-[fadeInUp_600ms_ease-out_both]">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.05] mb-6">
            Report civic issues.
            <br />
            <span className="text-blue-500">AI prioritizes. City acts.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-10">
            One place for citizens to log infrastructure problems. AI classifies and scores urgency so municipalities can respond faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-200 shadow-xl shadow-blue-600/25 hover:-translate-y-0.5 hover:shadow-blue-500/30 active:scale-[0.98]"
            >
              Report an issue <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login?role=admin"
              className="inline-flex items-center justify-center gap-2 border border-slate-600 text-slate-300 hover:bg-slate-800/50 hover:border-slate-500 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-200 active:scale-[0.98]"
            >
              <ShieldCheck className="w-4 h-4" /> Admin login
            </Link>
          </div>
        </section>

        {/* Problem & Who it's for */}
        <section className="grid md:grid-cols-2 gap-8 mb-20 animate-[fadeInUp_700ms_ease-out_both]">
          <div className={`p-8 rounded-[2rem] ${card}`}>
            <h2 className="text-2xl font-black tracking-tight mb-3">The problem</h2>
            <p className="text-slate-500 font-medium">
              Citizens report potholes, leaks, and hazards through scattered channels. Tickets sit in queues with no clear priority, so urgent issues get the same treatment as routine ones.
            </p>
          </div>
          <div className={`p-8 rounded-[2rem] ${card}`}>
            <h2 className="text-2xl font-black tracking-tight mb-3">Who it&apos;s for</h2>
            <p className="text-slate-500 font-medium">
              <strong className="text-slate-300">Citizens</strong> who want to submit a report in one place and track status. <strong className="text-slate-300">Municipal staff</strong> who need a single dashboard to triage and act on AI-prioritized tickets.
            </p>
          </div>
        </section>

        {/* One strong differentiator: AI classification + priority scoring */}
        <section className={`p-10 md:p-12 rounded-[2.5rem] ${card} mb-20 animate-[fadeInUp_800ms_ease-out_both]`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Differentiator</p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">AI classification & priority scoring</h2>
            </div>
          </div>
          <p className="text-slate-500 font-medium mb-8 max-w-2xl">
            Every report is analyzed in real time. Keywords trigger category (Infrastructure, Utilities, Emergency, Sanitation) and a priority level (P1–P3). Critical issues get an estimated response time so dispatchers know what to act on first.
          </p>
          <ul className="grid sm:grid-cols-2 gap-4">
            {[
              "Category from description (e.g. pothole → Infrastructure)",
              "Priority level (P1–P3) for triage",
              "Estimated response time (e.g. Under 1 hour for emergencies)",
              "Risk assessment text for operator context",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-400 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Why useful — quick features */}
        <section className="mb-20 animate-[fadeInUp_900ms_ease-out_both]">
          <h2 className="text-2xl font-black tracking-tight mb-8 text-center">Why it&apos;s useful</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl text-center group ${card}`}>
              <MapPin className="w-10 h-10 text-blue-500 mx-auto mb-3 transition-transform duration-300 group-hover:scale-110" />
              <h3 className="font-black text-lg mb-2">Location attached</h3>
              <p className="text-sm text-slate-500">Reports include coordinates so teams know exactly where to go.</p>
            </div>
            <div className={`p-6 rounded-2xl text-center group ${card}`}>
              <BarChart3 className="w-10 h-10 text-blue-500 mx-auto mb-3 transition-transform duration-300 group-hover:scale-110" />
              <h3 className="font-black text-lg mb-2">Admin dashboard</h3>
              <p className="text-sm text-slate-500">Live ledger, status updates, and hotspot view for operators.</p>
            </div>
            <div className={`p-6 rounded-2xl text-center group ${card}`}>
              <CheckCircle2 className="w-10 h-10 text-blue-500 mx-auto mb-3 transition-transform duration-300 group-hover:scale-110" />
              <h3 className="font-black text-lg mb-2">Track by ticket ID</h3>
              <p className="text-sm text-slate-500">Citizens can check status (Submitted → Verified → Resolved) anytime.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 animate-[fadeInUp_1000ms_ease-out_both]">
          <p className="text-slate-500 font-medium mb-6">Ready to report or manage tickets?</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-600/25"
          >
            Get started <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <footer className={`relative z-10 border-t py-6 px-6 text-center text-sm ${
        isDark ? "border-slate-800/60 text-slate-500" : "border-slate-200 text-slate-500"
      }`}>
        CivicSens — AI-driven civic triage. Built with Next.js, Supabase, Tailwind.
      </footer>
    </div>
  );
}
