// @ts-nocheck
import React from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, Shield, UserCheck, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudentRegistrationBannerProps {
  onOpenGuestSettings?: () => void;
}

export function StudentRegistrationBanner({ onOpenGuestSettings }: StudentRegistrationBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-slate-900/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl shadow-cyan-950/20">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 size-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className="size-11 sm:size-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 text-cyan-300">
            <Sparkles className="size-5 sm:size-6 text-cyan-400" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                100% Free Forever
              </span>
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Shield className="size-3" />
                COPPA & Student Privacy Safe
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white">
              Exploring as a Guest Student
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              You can explore all 24 interactive astronomy modules, 3D labs, and experiments for
              free right now. Create a free student account or sign in with your existing account to
              unlock verified stage badges, save your progress across devices, and earn a verified
              Cosmic Explorer certificate.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
          {onOpenGuestSettings && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenGuestSettings}
              className="border-white/20 text-slate-300 hover:text-white hover:bg-white/10"
            >
              Guest Preferences
            </Button>
          )}

          <Button
            asChild
            size="sm"
            variant="outline"
            className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200"
          >
            <Link to="/auth" search={{ next: "/learn" }}>
              <UserCheck className="size-4 mr-1.5" />
              <span>Sign In</span>
            </Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-md shadow-cyan-500/20 border-none"
          >
            <Link to="/auth" search={{ next: "/learn" }}>
              <span>Create Free Student Account</span>
              <ArrowRight className="size-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
