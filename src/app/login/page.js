"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Cpu, Lock, Mail, Moon, ShieldCheck, Sun } from "lucide-react";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = params.get("role") === "admin" ? "admin" : "user";
  const explicitNext = params.get("next");

  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDark, setIsDark] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
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

  const canSubmit = useMemo(() => {
    if (!email.trim()) return false;
    if (!isValidEmail(email.trim())) return false;
    if (role === "admin") return password.length > 0;
    return true;
  }, [email, password, role]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const nextPath = explicitNext || (role === "admin" ? "/admin" : "/dashboard");
    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      setError("Enter a valid email.");
      return;
    }
    if (role === "admin" && !password) {
      setError("Admin password required.");
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          email: cleanEmail,
          password: role === "admin" ? password : undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Login failed.");
        return;
      }
      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  };

  const shellBg = isDark
    ? "bg-slate-950 text-slate-100"
    : "bg-[#fcfdfe] text-slate-900";
  const panel = isDark
    ? "bg-slate-900/30 border border-slate-800/80 backdrop-blur-2xl shadow-2xl shadow-black/10"
    : "bg-white/70 border border-slate-200/80 backdrop-blur-2xl shadow-2xl shadow-slate-200/50";
  const input = isDark
    ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
    : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20";

  return (
    <div className={`min-h-screen ${shellBg} font-sans overflow-hidden relative`}>
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, ${
            isDark ? "rgba(37, 99, 235, 0.12)" : "rgba(37, 99, 235, 0.06)"
          }, transparent 45%), radial-gradient(600px circle at ${mousePos.x * 0.9}px ${mousePos.y * 1.1}px, ${
            isDark ? "rgba(16, 185, 129, 0.08)" : "rgba(16, 185, 129, 0.04)"
          }, transparent 40%)`,
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-50"
        style={{
          background: "radial-gradient(ellipse 100% 80% at 50% -20%, rgba(37, 99, 235, 0.1), transparent)",
        }}
      />

      <nav
        className={`relative z-10 border-b px-8 py-5 flex justify-between items-center backdrop-blur-2xl ${
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
              Citizen Portal • Secure Access
            </p>
          </div>
        </div>

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
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-14">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <div className="mb-10 animate-[fadeInUp_650ms_ease-out_both]">
              <h2 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9]">
                Log in.
                <br />
                <span className="text-blue-600">Report faster.</span>
              </h2>
              <p className="mt-5 text-slate-500 text-lg font-medium max-w-xl">
                Enter your email to submit issues. Admin access is a separate secure login.
              </p>
            </div>

            <div className={`rounded-[3rem] border p-10 backdrop-blur-2xl ${panel} animate-[fadeInUp_800ms_ease-out_both]`}>
              <div className="flex items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                    {role === "admin" ? <ShieldCheck className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] opacity-50">
                      {role === "admin" ? "Admin login" : "User login"}
                    </p>
                    <h3 className="text-2xl font-black tracking-tight">
                      {role === "admin" ? "Admin Interface" : "Submit a report"}
                    </h3>
                  </div>
                </div>

                <div className={`p-1 rounded-2xl border ${isDark ? "border-slate-800 bg-slate-950/60" : "border-slate-200 bg-white"}`}>
                  <button
                    type="button"
                    onClick={() => setRole("user")}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      role === "user"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                        : isDark
                          ? "text-slate-400 hover:text-white"
                          : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    User
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      role === "admin"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                        : isDark
                          ? "text-slate-400 hover:text-white"
                          : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">
                    Email
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="you@domain.com"
                    className={`w-full rounded-2xl px-6 py-5 outline-none border transition-all ring-0 focus:ring-4 ${input}`}
                  />
                </div>

                {role === "admin" && (
                  <div className="space-y-2 animate-[fadeInUp_350ms_ease-out_both]">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50">
                      Admin password
                    </label>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      placeholder="••••••••"
                      className={`w-full rounded-2xl px-6 py-5 outline-none border transition-all ring-0 focus:ring-4 ${input}`}
                    />
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 opacity-70" />
                      Admin uses a different password than user login.
                    </p>
                  </div>
                )}

                {error && (
                  <div
                    className={`rounded-2xl border px-5 py-4 text-[12px] font-bold ${
                      isDark
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : "bg-red-50 border-red-200 text-red-700"
                    } animate-[pop_250ms_ease-out_both]`}
                  >
                    {error}
                  </div>
                )}

                <button
                  disabled={!canSubmit || pending}
                  className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] transition-all active:scale-[0.98] ${
                    !canSubmit || pending
                      ? isDark
                        ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                        : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-600/30 hover:-translate-y-0.5"
                  }`}
                >
                  {pending ? "Authenticating..." : role === "admin" ? "Enter Admin" : "Continue"}
                </button>
              </form>
            </div>
          </div>

          <aside className="lg:col-span-5 space-y-6 animate-[fadeInUp_900ms_ease-out_both]">
            <div className={`rounded-[3rem] border p-8 backdrop-blur-2xl ${panel}`}>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-3">
                Quick note
              </p>
              <h4 className="text-2xl font-black tracking-tight mb-2">User vs Admin</h4>
              <ul className="text-sm text-slate-500 font-medium space-y-3">
                <li>
                  <span className="font-black text-slate-300">User login:</span>{" "}
                  email only. Use it to submit issues.
                </li>
                <li>
                  <span className="font-black text-slate-300">Admin login:</span>{" "}
                  email + password to access the admin interface.
                </li>
              </ul>
              <div className={`mt-6 rounded-2xl border p-4 ${isDark ? "border-slate-800 bg-slate-950/60" : "border-slate-200 bg-white"}`}>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">
                  Tip
                </p>
                <p className="text-sm font-medium text-slate-500">
                  If you came here for admin, switch to the{" "}
                  <span className="font-black text-blue-500">Admin</span> tab above.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
