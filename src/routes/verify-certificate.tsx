import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  Download,
  Share2,
  ExternalLink,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  Lock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  verifyCertificatePublic,
  generateCertificatePdfPayload,
} from "@/lib/academy/certificate.functions";
import type { CertificateVerificationResult } from "@/lib/academy/certificate-types";

interface VerifySearchParams {
  id?: string;
}

export const Route = createFileRoute("/verify-certificate")({
  validateSearch: (search: Record<string, unknown>): VerifySearchParams => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Certificate Verification — Our Visible Universe Academy" },
      {
        name: "description",
        content:
          "Official online verification registry for Our Visible Universe Academy certificates of achievement.",
      },
    ],
  }),
  component: VerifyCertificatePage,
});

function VerifyCertificatePage() {
  const { id: initialId } = Route.useSearch();
  const [searchId, setSearchId] = useState<string>(initialId || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CertificateVerificationResult | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);

  const performVerification = async (certId: string) => {
    const cleaned = certId.trim();
    if (!cleaned) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await verifyCertificatePublic({ data: { certificateId: cleaned } });
      setResult(res);
    } catch (err: any) {
      setResult({
        isValid: false,
        certificateNumber: cleaned,
        status: "not_found",
        reason: err?.message || "Could not connect to certificate verification service.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      performVerification(initialId);
    }
  }, [initialId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(searchId);
  };

  const handleDownloadPdf = async (theme: "cosmic_dark" | "print_light" = "cosmic_dark") => {
    if (!result?.certificateNumber) return;
    setDownloadingPdf(true);
    try {
      const res = await generateCertificatePdfPayload({
        data: { certificateNumber: result.certificateNumber, theme },
      });
      const byteCharacters = atob(res.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PDF Certificate downloaded successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate PDF");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined" && result?.certificateNumber) {
      const url = `${window.location.origin}/verify-certificate?id=${encodeURIComponent(result.certificateNumber)}`;
      navigator.clipboard.writeText(url);
      toast.success("Verification link copied to clipboard!");
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono">
            <ShieldCheck className="size-3.5" />
            Official Certificate Registry
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Certificate of Achievement Verification
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Verify the authenticity, academic evaluation, and cryptographic integrity of official
            Cosmic Journey certificates issued by Our Visible Universe Academy.
          </p>
        </div>

        {/* Verification Lookup Input */}
        <form
          onSubmit={handleSearchSubmit}
          className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Enter Certificate ID (e.g. OVU-CERT-2026-XXXX-...)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="pl-10 font-mono text-sm bg-slate-900/80 border-white/10 text-white placeholder:text-slate-500 uppercase"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !searchId.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium shrink-0"
          >
            {loading ? "Verifying..." : "Verify Credential"}
          </Button>
        </form>

        {/* Verification Status Card */}
        {loading && (
          <div className="max-w-2xl mx-auto rounded-2xl border border-white/10 bg-slate-900/60 p-8 text-center space-y-3">
            <div className="animate-spin size-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-slate-300 font-mono">
              Verifying cryptographic signature in official registry...
            </p>
          </div>
        )}

        {!loading && result && (
          <div className="max-w-2xl mx-auto space-y-6">
            {result.isValid ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/90 shadow-2xl shadow-emerald-950/30 overflow-hidden">
                {/* Verified Header Banner */}
                <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border-b border-emerald-500/30 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <ShieldCheck className="size-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white uppercase tracking-wider">
                          Official Verified Credential
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Active & Authentic
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">
                        Cryptographic signature verified against immutable database record
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono text-slate-400 block">Issued</span>
                    <span className="text-xs font-semibold text-slate-200">
                      {result.issueDateFormatted}
                    </span>
                  </div>
                </div>

                {/* Certificate Details Body */}
                <div className="p-6 space-y-6">
                  {/* Recipient Highlight */}
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-5 text-center space-y-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-400/80">
                      Certificate Awarded To
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {result.studentName}
                    </h2>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium">
                      <Award className="size-3.5" />
                      {result.achievementTitle}
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] space-y-1">
                      <span className="text-slate-400 font-mono uppercase text-[10px] block">
                        Course Curriculum
                      </span>
                      <span className="font-semibold text-white text-sm">{result.courseTitle}</span>
                      <span className="text-slate-400 block text-[11px]">
                        24 Interactive Modules across 6 Stages
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] space-y-1">
                      <span className="text-slate-400 font-mono uppercase text-[10px] block">
                        Learning Tier
                      </span>
                      <span className="font-semibold text-cyan-300 text-sm">
                        {result.learningLevelLabel}
                      </span>
                      <span className="text-slate-400 block text-[11px]">
                        Age-adaptive curriculum tier
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] space-y-1">
                      <span className="text-slate-400 font-mono uppercase text-[10px] block">
                        Final Assessment Score
                      </span>
                      <span className="font-semibold text-emerald-400 text-sm font-mono">
                        {result.finalScorePercentage?.toFixed(1)}% (Pass Standard: &gt;= 80%)
                      </span>
                      <span className="text-slate-400 block text-[11px]">
                        20-question comprehensive evaluation
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] space-y-1">
                      <span className="text-slate-400 font-mono uppercase text-[10px] block">
                        Student Identifier
                      </span>
                      <span className="font-mono text-slate-200 text-sm">
                        {result.studentPublicId}
                      </span>
                      <span className="text-slate-400 block text-[11px]">
                        Privacy-preserving student ID
                      </span>
                    </div>
                  </div>

                  {/* Technical & Security Verification Details */}
                  <div className="rounded-xl border border-white/5 bg-slate-950/40 p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-mono uppercase text-[10px]">Certificate ID:</span>
                      <span className="font-mono font-bold text-amber-300">
                        {result.certificateNumber}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-mono uppercase text-[10px]">Issuing Body:</span>
                      <span className="text-slate-200">{result.organization}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-mono uppercase text-[10px]">Curriculum Version:</span>
                      <span className="font-mono text-slate-200">v{result.courseVersion}</span>
                    </div>
                    {result.verificationHash && (
                      <div className="pt-2 border-t border-white/5 space-y-1">
                        <span className="font-mono uppercase text-[10px] text-slate-500 block">
                          Cryptographic SHA-256 Digest:
                        </span>
                        <code className="font-mono text-[10px] text-slate-400 break-all block bg-black/40 p-1.5 rounded">
                          {result.verificationHash}
                        </code>
                      </div>
                    )}
                  </div>

                  {/* Non-Accreditation Educational Disclaimer */}
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] text-[11px] text-slate-400 leading-relaxed">
                    <p className="font-medium text-slate-300 mb-1">Notice of Credential Scope:</p>
                    {result.disclaimer}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button
                      onClick={() => handleDownloadPdf("cosmic_dark")}
                      disabled={downloadingPdf}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex-1"
                    >
                      <Download className="size-4 mr-2" />
                      {downloadingPdf ? "Generating PDF..." : "Download Official PDF"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadPdf("print_light")}
                      disabled={downloadingPdf}
                      className="border-white/10 text-slate-200 hover:text-white"
                      title="Download clean white print-friendly PDF"
                    >
                      Print-Friendly PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCopyLink}
                      className="border-white/10 text-slate-200 hover:text-white shrink-0"
                    >
                      <Share2 className="size-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-rose-500/30 bg-slate-900/90 p-8 text-center space-y-4">
                <div className="size-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
                  <ShieldAlert className="size-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Verification Failed</h3>
                  <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                    {result.reason ||
                      "The requested certificate could not be authenticated. Ensure the certificate ID was entered accurately."}
                  </p>
                </div>
                <div className="pt-2">
                  <Button asChild variant="outline" className="border-white/10 text-white">
                    <Link to="/learn">Explore Cosmic Journey Curriculum</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informational Guidance */}
        {!result && !loading && (
          <div className="max-w-2xl mx-auto rounded-2xl border border-white/5 bg-slate-900/40 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Lock className="size-4 text-cyan-400" />
              How Verification Works
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
              <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] space-y-1">
                <span className="font-bold text-slate-200 block">1. QR Code / ID Scan</span>
                <span>Each certificate has a high-entropy cryptographically generated ID.</span>
              </div>
              <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] space-y-1">
                <span className="font-bold text-slate-200 block">2. Server Signature</span>
                <span>
                  The system checks HMAC signatures against the official database registry.
                </span>
              </div>
              <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] space-y-1">
                <span className="font-bold text-slate-200 block">3. Authentic Record</span>
                <span>Returns verified student name, score, completion date, and tier.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
