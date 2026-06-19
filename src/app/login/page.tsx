"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Meteors } from "@/components/magicui/meteors";
import { BorderBeam } from "@/components/magicui/border-beam";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { ArrowLeft, Loader2 } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4">
      {/* bg orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-orb absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-blue-600/8 blur-[120px]" />
        <div className="animate-orb absolute bottom-0 right-1/4 h-[400px] w-[400px] translate-y-1/3 rounded-full bg-violet-600/6 blur-[100px]" style={{ animationDelay: "3s" }} />
      </div>

      {/* meteors */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Meteors number={10} />
      </div>

      {/* back link */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease }}
        className="absolute left-4 top-4 sm:left-6 sm:top-6"
      >
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-slate-500 transition-colors hover:border-white/10 hover:text-slate-300"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back
        </Link>
      </motion.div>

      {/* card */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-sm"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900/70 p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
          <BorderBeam size={80} duration={10} colorFrom="#3B82F6" colorTo="#8B5CF6" borderWidth={1} />

          {/* logo */}
          <motion.div variants={fadeUp} className="mb-6 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/30 glow-brand">
              <span className="text-lg font-bold text-white tracking-tighter">W</span>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-widest text-slate-600">
                <AnimatedShinyText shimmerWidth={100} className="text-slate-500">
                  WealthIQ
                </AnimatedShinyText>
              </p>
            </div>
          </motion.div>

          {/* heading */}
          <motion.div variants={fadeUp} className="mb-8 text-center">
            <h1 className="text-xl font-bold text-slate-100">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">
              Sign in to access your stock research
            </p>
          </motion.div>

          {/* Google button */}
          <motion.div variants={fadeUp}>
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="group relative flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 shadow-sm transition-all duration-200 hover:border-white/14 hover:bg-white/[0.07] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              ) : (
                <GoogleIcon />
              )}
              <span>{loading ? "Signing in…" : "Continue with Google"}</span>
            </button>
          </motion.div>

          {/* divider */}
          <motion.div variants={fadeUp} className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-[11px] text-slate-600">OR</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </motion.div>

          {/* email/password — placeholder until Supabase auth added */}
          <motion.div variants={fadeUp} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                disabled
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-slate-500 placeholder:text-slate-700 outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                disabled
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-slate-500 placeholder:text-slate-700 outline-none cursor-not-allowed"
              />
            </div>
            <p className="text-center text-[11px] text-slate-700">
              Email/password coming soon — use Google above
            </p>
          </motion.div>

          {/* footer */}
          <motion.p variants={fadeUp} className="mt-8 text-center text-[11px] leading-relaxed text-slate-700">
            By signing in you agree this is educational research only, not investment advice.
          </motion.p>
        </div>
      </motion.div>
    </main>
  );
}
