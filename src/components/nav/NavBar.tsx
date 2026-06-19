"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User } from "lucide-react";

export function NavBar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="sticky top-0 z-40 border-b border-white/[0.06] bg-slate-950/80 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500 shadow-lg shadow-blue-500/30">
            <span className="text-[11px] font-bold text-white tracking-tight">W</span>
          </div>
          <span className="text-sm font-semibold text-slate-100 tracking-tight">WealthIQ</span>
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-xs text-slate-600 sm:block">NSE/BSE</span>
          <span className="hidden h-3 w-px bg-white/10 sm:block" />
          <span className="hidden text-xs text-slate-600 sm:block">Fundamentals only</span>

          {/* Auth area */}
          {status === "loading" ? (
            <div className="h-7 w-7 animate-pulse rounded-full bg-slate-800" />
          ) : session ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-white/10 transition-all hover:border-blue-500/40 hover:shadow-md hover:shadow-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                aria-label="User menu"
              >
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? "User"}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-slate-400" />
                )}
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-10 z-50 min-w-[200px] overflow-hidden rounded-xl border border-white/[0.08] bg-slate-900/95 shadow-2xl shadow-black/50 backdrop-blur-xl"
                  >
                    {/* User info */}
                    <div className="border-b border-white/[0.06] px-4 py-3">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {session.user?.name ?? "User"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {session.user?.email}
                      </p>
                    </div>

                    {/* Sign out */}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-3 text-sm text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-200"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-400 hover:shadow-lg hover:shadow-blue-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
