"use client";
export const dynamic = "force-dynamic";

import React, { useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { cn } from "@/lib/utils";

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
        setError(data?.error || "Login failed. Please check your credentials.");
        return;
      }
      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bento-card p-8 md:p-10 space-y-8"
        >
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {role === "admin" ? "Admin Login" : "Welcome Back"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {role === "admin" ? "Access the city management dashboard." : "Sign in to report and track issues."}
            </p>
          </div>

          <div className="flex bg-muted p-1 rounded-md border border-transparent">
            <button
              onClick={() => setRole("user")}
              className={cn(
                "flex-1 py-2 rounded text-sm font-medium transition-all",
                role === "user" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Citizen
            </button>
            <button
              onClick={() => setRole("admin")}
              className={cn(
                "flex-1 py-2 rounded text-sm font-medium transition-all",
                role === "admin" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Admin
            </button>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">
                Email Address
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                className="w-full"
              />
            </div>

            {role === "admin" && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3"
              >
                <label className="text-sm font-semibold text-foreground">
                  Password
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="w-full"
                />
              </motion.div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium rounded-md">
                {error}
              </div>
            )}

            <AnimatedButton
              type="submit"
              disabled={!canSubmit || pending}
              className="w-full py-3"
            >
              {pending ? (
                <Loader2 className="animate-spin mx-auto" size={20} />
              ) : (
                "Sign In"
              )}
            </AnimatedButton>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
