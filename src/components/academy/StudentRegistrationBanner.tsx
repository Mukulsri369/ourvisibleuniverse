// @ts-nocheck
import React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Shield } from "lucide-react";

interface StudentRegistrationBannerProps {
  onOpenGuestSettings?: () => void;
}

export function StudentRegistrationBanner({ onOpenGuestSettings }: StudentRegistrationBannerProps) {
  return (
    <div className="flex flex-col justify-between gap-6 border border-white/[0.08] bg-[#05060a] p-7 sm:p-9 lg:flex-row lg:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#f5d08a]">
            SCHOLAR SANCTUARY · 100% FREE FOREVER
          </span>
          <span className="text-white/20">•</span>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-400">
            <Shield className="size-3" />
            PRIVACY SAFE
          </span>
        </div>

        <h3
          className="mt-2 text-xl font-normal uppercase tracking-tight text-white sm:text-2xl"
          style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
        >
          Guest Observatory Session
        </h3>

        <p className="mt-1.5 max-w-2xl text-xs font-light leading-relaxed text-white/60 sm:text-sm">
          All 24 interactive modules and 3D physics labs are open immediately. Sign in to sync
          verified stage badges and claim your official Cosmic Explorer credential.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0">
        {onOpenGuestSettings && (
          <button
            type="button"
            onClick={onOpenGuestSettings}
            className="inline-flex h-10 items-center rounded-full border border-white/15 px-5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/75 transition-colors hover:border-white/40 hover:text-white"
          >
            Guest ID
          </button>
        )}

        <Link
          to="/auth"
          search={{ next: "/learn" }}
          className="inline-flex h-10 items-center rounded-full border border-white/15 px-5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/85 transition-colors hover:border-[#f5d08a]/50 hover:text-white"
        >
          Sign In
        </Link>

        <Link
          to="/auth"
          search={{ next: "/learn" }}
          className="group inline-flex h-10 items-center gap-2.5 rounded-full bg-[#f5d08a] pl-5 pr-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#05060a] transition-all hover:bg-white"
        >
          <span>Create Scholar Account</span>
          <span className="flex size-7 items-center justify-center rounded-full bg-[#05060a] text-[#f5d08a]">
            <ArrowUpRight className="size-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}
