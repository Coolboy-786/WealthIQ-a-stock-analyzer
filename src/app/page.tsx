"use client";

import { motion } from "framer-motion";
import { SearchBar } from "@/components/search/SearchBar";
import { NavBar } from "@/components/nav/NavBar";
import Link from "next/link";
import { TrendingUp, ShieldCheck, Eye, BookOpen, ArrowRight } from "lucide-react";
import { Meteors } from "@/components/magicui/meteors";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { BorderBeam } from "@/components/magicui/border-beam";
import { MagicCard } from "@/components/magicui/magic-card";

const FEATURED = [
  {
    ticker:  "RELIANCE",
    name:    "Reliance Industries",
    label:   "Energy · Retail · Telecom",
    verdict: "Medium Quality",
    badge:   "text-amber-400 bg-amber-500/10 border-amber-500/25",
    dot:     "bg-amber-400",
    beamFrom: "#F59E0B",
    beamTo:   "#EF4444",
  },
  {
    ticker:  "INFY",
    name:    "Infosys",
    label:   "IT Services",
    verdict: "High Quality",
    badge:   "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    dot:     "bg-emerald-400",
    beamFrom: "#10B981",
    beamTo:   "#3B82F6",
  },
  {
    ticker:  "HDFCBANK",
    name:    "HDFC Bank",
    label:   "Private Banking",
    verdict: "High Quality",
    badge:   "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    dot:     "bg-emerald-400",
    beamFrom: "#8B5CF6",
    beamTo:   "#3B82F6",
  },
];

const PRINCIPLES = [
  { icon: ShieldCheck, title: "No tips. Ever.",     body: "No buy/sell/hold calls. No price targets. Educational analysis only." },
  { icon: Eye,         title: "Radical honesty.",   body: "Missing data is flagged clearly, never hidden or estimated."          },
  { icon: BookOpen,    title: "Plain English.",      body: "Every metric explained in one line a beginner can follow."            },
  { icon: TrendingUp,  title: "Fundamentals only.", body: "P&L, balance sheet, cash flow, ownership. No chart noise."           },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950">

      <NavBar />

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center overflow-hidden px-4 pb-24 pt-24 text-center">
        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-orb absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-blue-600/10 blur-[130px]" />
          <div className="animate-orb absolute left-1/4 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-violet-600/6 blur-[100px]" style={{ animationDelay: "2.5s" }} />
        </div>

        {/* Meteors */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Meteors number={14} />
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative z-10 flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="mb-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/8 px-4 py-1.5 text-xs font-medium text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              <AnimatedShinyText shimmerWidth={120} className="text-blue-300">
                AI-powered fundamentals research for Indian stocks
              </AnimatedShinyText>
            </span>
          </motion.div>

          {/* Logo mark */}
          <motion.div variants={fadeUp} className="mb-7">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500 shadow-xl shadow-blue-500/30 glow-brand">
              <span className="text-2xl font-bold text-white tracking-tighter">W</span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1 variants={fadeUp} className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="gradient-text">WealthIQ</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mb-2 text-lg font-medium text-slate-300">
            Fundamentals research for Indian stocks.
          </motion.p>

          <motion.p variants={fadeUp} className="mb-12 max-w-md text-sm text-slate-500 leading-relaxed">
            Plain-English deep dives into NSE/BSE companies — valuation, growth,
            health, returns, and ownership. No tips. No targets. Just honest analysis.
          </motion.p>

          {/* Search */}
          <motion.div variants={fadeUp} className="w-full max-w-2xl">
            <SearchBar />
          </motion.div>

          <motion.p variants={fadeUp} className="mt-4 text-xs text-slate-600">
            50 NSE/BSE stocks · Try RELIANCE, INFY, TCS, HDFC…
          </motion.p>
        </motion.div>
      </section>

      {/* ── Featured deep dives ─────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.04] px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-8 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-600">
            Sample deep dives
          </p>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {FEATURED.map((s) => (
              <motion.div key={s.ticker} variants={fadeUp}>
                <Link href={`/stock/${s.ticker}`} className="block cursor-pointer">
                  <MagicCard
                    gradientColor="#1E293B"
                    gradientOpacity={0.9}
                    className="rounded-2xl border border-white/[0.06] bg-slate-900/60 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/5"
                  >
                    <BorderBeam
                      size={60}
                      duration={8}
                      colorFrom={s.beamFrom}
                      colorTo={s.beamTo}
                      borderWidth={1}
                    />
                    <div className="group relative z-10 flex flex-col p-5">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/12 text-xs font-bold text-blue-400">
                          {s.ticker.slice(0, 2)}
                        </div>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${s.badge}`}>
                          <span className={`h-1 w-1 rounded-full ${s.dot}`} />
                          {s.verdict}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-300 transition-colors group-hover:text-white">
                        {s.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">{s.ticker} · {s.label}</p>
                      <div className="mt-4 flex translate-x-0 items-center gap-1 text-xs font-medium text-blue-400 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5">
                        View deep dive
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </MagicCard>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Principles ──────────────────────────────────────────────────────── */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-8 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-600">
            How WealthIQ is different
          </p>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {PRINCIPLES.map(({ icon: Icon, title, body }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="flex flex-col gap-2.5 rounded-2xl border border-white/[0.06] bg-slate-900/60 p-5 backdrop-blur-sm transition-colors duration-200 hover:border-white/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <Icon className="h-4 w-4 text-blue-400" strokeWidth={1.75} />
                </div>
                <p className="text-sm font-semibold text-slate-200">{title}</p>
                <p className="text-xs leading-relaxed text-slate-500">{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-white/[0.04] px-4 py-6 text-center text-xs text-slate-600">
        WealthIQ is educational only — not investment advice. Verify all figures independently. The decision is always yours.
      </footer>
    </main>
  );
}
