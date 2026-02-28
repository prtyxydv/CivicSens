"use client";
export const dynamic = "force-dynamic";

import React, { useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { GlowBorder } from "@/components/ui/GlowBorder";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

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
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

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
        setError(data?.error || "Authentication failed.");
        return;
      }
      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Network protocol error.");
    } finally {
      setPending(false);
    }
  };

  return (
    <SectionWrapper className="min-h-[80vh] flex items-center justify-center">
      <div className="grid lg:grid-cols-2 gap-16 items-center w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-8">
            Access <br />
            <span className="text-primary">Intelligence.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-md leading-relaxed">
            Secure portal for citizens and administrators. Your data is encrypted and committed to the civic ledger.
          </p>
          
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-primary/60">
              <ShieldCheck size={20} />
              End-to-end encrypted
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <GlowBorder glowColor={role === "admin" ? "rgba(139, 92, 246, 0.5)" : "rgba(14, 165, 233, 0.5)"}>
            <div className="p-8 md:p-12 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-primary">
                    {role === "admin" ? <Lock size={20} /> : <Mail size={20} />}
                  </div>
                  <h3 className="text-2xl font-bold">{role === "admin" ? "Admin Access" : "Citizen Entry"}</h3>
                </div>

                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setRole("user")}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      role === "user" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    User
                  </button>
                  <button
                    onClick={() => setRole("admin")}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      role === "admin" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <form onSubmit={submit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Identification Email
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="name@domain.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                {role === "admin" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Secure Password
                    </label>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary/50 transition-all"
                    />
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold"
                  >
                    {error}
                  </motion.div>
                )}

                <AnimatedButton
                  disabled={!canSubmit || pending}
                  className="w-full py-5 text-sm tracking-[0.2em] font-black uppercase"
                >
                  {pending ? (
                    <Loader2 className="animate-spin mx-auto" size={20} />
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      Initialize Session <ArrowRight size={18} />
                    </div>
                  )}
                </AnimatedButton>
              </form>
            </div>
          </GlowBorder>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
