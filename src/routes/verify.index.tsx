import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import React, { useState } from "react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  Search,
  Lock,
  Sparkles,
  QrCode,
  Award,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/verify/")({
  head: () => ({
    meta: [
      { title: "Certificate Verification Registry — Our Visible Universe Academy" },
      {
        name: "description",
        content:
          "Official online verification registry for Our Visible Universe Academy astronomy credentials.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: VerifyIndexPage,
});

function VerifyIndexPage() {
  const navigate = useNavigate();
  const [certInput, setCertInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = certInput.trim().toUpperCase();
    if (cleaned) {
      navigate({
        to: "/verify/$certificateId",
        params: { certificateId: cleaned },
      });
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono">
            <ShieldCheck className="size-3.5" />
            Official Credential Registry
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Verify Certificate of Achievement
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Verify the academic rigor, assessment authenticity, and cryptographic integrity of
            official Cosmic Journey credentials issued by Our Visible Universe Academy.
          </p>
        </div>

        {/* Verification Lookup Form */}
        <div className="max-w-xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-2.5 bg-slate-900/90 border border-white/10 p-2.5 rounded-2xl shadow-2xl"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                type="text"
                placeholder="e.g. OVU-CERT-2026-XXXX-XXXX-XXXX"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                className="pl-10 font-mono text-sm bg-transparent border-0 text-white placeholder:text-slate-500 uppercase focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Button
              type="submit"
              disabled={!certInput.trim()}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 shrink-0 rounded-xl"
            >
              <span>Verify Credential</span>
              <ArrowRight className="size-4 ml-1.5" />
            </Button>
          </form>
          <p className="text-[11px] font-mono text-slate-400 text-center mt-3">
            Enter the 28-character unique certificate ID or scan the QR code located on the official PDF.
          </p>
        </div>

        {/* Security & Registry Standards */}
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 space-y-2">
            <div className="size-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Lock className="size-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Cryptographic Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every certificate contains an immutable HMAC-SHA256 signature calculated from learner assessment records.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 space-y-2">
            <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="size-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Strict Child Privacy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Learner personal emails and minor identities are strictly protected; only verified pseudonyms appear publicly.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 space-y-2">
            <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Award className="size-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Immutable Audit Lineage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Historical reissuances and corrections are tracked with non-repudiable audit logs and supersession chains.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
