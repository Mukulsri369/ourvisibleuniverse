import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileQuestion,
  Download,
  Share2,
  ExternalLink,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  Lock,
  ArrowRight,
  QrCode,
  Code2,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import {
  verifyCertificatePublic,
  generateCertificatePdfPayload,
  getCertificateOpenBadgePayload,
} from "@/lib/academy/certificate.functions";
import type { CertificateVerificationResult } from "@/lib/academy/certificate-types";
import { CosmicCertificateModal } from "@/components/academy/CosmicCertificateModal";

export const Route = createFileRoute("/verify/$certificateId")({
  head: () => ({
    meta: [
      { title: "Official Certificate Verification — Our Visible Universe Academy" },
      {
        name: "description",
        content:
          "Official online verification registry for Our Visible Universe Academy credentials.",
      },
      // Strict privacy protection: Avoid search engine indexing of personal verification pages
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: VerifyCertificateParamPage,
});

function VerifyCertificateParamPage() {
  const { certificateId } = useParams({ from: "/verify/$certificateId" });
  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<CertificateVerificationResult | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [openBadgeJson, setOpenBadgeJson] = useState<string | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  const performVerification = async (certId: string) => {
    const cleaned = certId.trim().toUpperCase();
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
    if (certificateId) {
      performVerification(certificateId);
    }
  }, [certificateId]);

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
      const url = `${window.location.origin}/verify/${encodeURIComponent(result.certificateNumber)}`;
      navigator.clipboard.writeText(url);
      toast.success("Official verification link copied to clipboard!");
    }
  };

  const handleShare = async () => {
    if (typeof window !== "undefined" && result) {
      const shareUrl = `${window.location.origin}/verify/${encodeURIComponent(result.certificateNumber)}`;
      const title = `${result.studentName} — ${result.achievementTitle}`;
      const text = `Verified ${result.achievementTitle} certificate for ${result.courseTitle} on Our Visible Universe Academy.`;

      if (navigator.share) {
        try {
          await navigator.share({ title, text, url: shareUrl });
          toast.success("Achievement shared successfully!");
          return;
        } catch {
          // Fallback to copy link
        }
      }
      navigator.clipboard.writeText(shareUrl);
      toast.success("Achievement verification link copied to clipboard!");
    }
  };

  const handleViewOpenBadges = async () => {
    if (!result?.certificateNumber) return;
    try {
      const payload = await getCertificateOpenBadgePayload({
        data: { certificateNumber: result.certificateNumber },
      });
      setOpenBadgeJson(JSON.stringify(payload, null, 2));
      setShowBadgeModal(true);
    } catch (err: any) {
      toast.error(err?.message || "Could not retrieve badge metadata.");
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            to="/verify-certificate"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
          >
            ← Certificate Registry Lookup
          </Link>
          <span className="text-xs font-mono text-slate-500">
            ID: {certificateId?.toUpperCase()}
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="max-w-2xl mx-auto rounded-2xl border border-white/10 bg-slate-900/60 p-12 text-center space-y-4">
            <div className="animate-spin size-10 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto" />
            <h3 className="text-base font-medium text-white">Verifying Official Credential...</h3>
            <p className="text-xs text-slate-400 font-mono">
              Querying immutable database registry & validating cryptographic HMAC signature...
            </p>
          </div>
        )}

        {/* Verification Result Views */}
        {!loading && result && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* STATUS 1: VALID & ACTIVE */}
            {result.status === "active" && result.isValid && (
              <div className="rounded-2xl border border-emerald-500/40 bg-slate-900/90 shadow-2xl shadow-emerald-950/30 overflow-hidden">
                {/* Verified Header Banner */}
                <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/60 border-b border-emerald-500/30 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
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
                          VALID & AUTHENTIC
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">
                        HMAC-SHA256 signature verified against immutable database registry
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

                {/* Certificate Details */}
                <div className="p-6 space-y-6">
                  {/* Recipient Display */}
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-5 text-center space-y-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-400/80">
                      Certificate of Achievement Awarded To
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {result.studentName}
                    </h2>
                    {result.isMinorProtected && (
                      <span className="text-[11px] font-mono text-emerald-400/90 block">
                        🛡️ Privacy-protected learner call sign (minor protection active)
                      </span>
                    )}
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
                        24 Verified Modules across 6 Stages
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
                        {result.finalScorePercentage?.toFixed(1)}% (Pass Standard: &ge; 80%)
                      </span>
                      <span className="text-slate-400 block text-[11px]">
                        20-question randomized comprehensive exam
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
                        Non-identifying student call ID
                      </span>
                    </div>
                  </div>

                  {/* Technical & Verification Details */}
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

                  {/* Disclaimer */}
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] text-[11px] text-slate-400 leading-relaxed">
                    <p className="font-medium text-slate-300 mb-1">Notice of Credential Scope:</p>
                    {result.disclaimer}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    <Button
                      onClick={() => handleDownloadPdf("cosmic_dark")}
                      disabled={downloadingPdf}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex-1"
                    >
                      <Download className="size-4 mr-2" />
                      {downloadingPdf ? "Generating..." : "Download PDF"}
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
                      onClick={handleShare}
                      className="border-white/10 text-slate-200 hover:text-white shrink-0"
                    >
                      <Share2 className="size-4 mr-1.5" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCopyLink}
                      className="border-white/10 text-slate-200 hover:text-white shrink-0"
                    >
                      <Copy className="size-4 mr-1.5" />
                      Copy URL
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleViewOpenBadges}
                      className="border-white/10 text-slate-300 hover:text-white shrink-0"
                      title="Inspect Open Badges 3.0 / W3C Verifiable Credential standard metadata"
                    >
                      <Code2 className="size-4 mr-1.5 text-cyan-400" />
                      Open Badges 3.0
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STATUS 2: REVOKED */}
            {result.status === "revoked" && (
              <div className="rounded-2xl border border-rose-500/50 bg-slate-900/90 shadow-2xl shadow-rose-950/30 overflow-hidden">
                <div className="bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/70 border-b border-rose-500/40 px-6 py-4 flex items-center gap-3">
                  <div className="size-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                    <ShieldAlert className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-rose-300 uppercase tracking-wider">
                        Credential Status: REVOKED
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        REVOKED
                      </span>
                    </div>
                    <p className="text-xs text-rose-200/80">
                      This certificate is no longer recognized as valid by Our Visible Universe Academy.
                    </p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 space-y-2">
                    <span className="text-xs font-mono uppercase text-rose-300 font-semibold block">
                      Official Revocation Notice:
                    </span>
                    <p className="text-sm text-slate-200">
                      {result.reason || "This certificate has been administratively revoked."}
                    </p>
                    {result.revocationReason && (
                      <p className="text-xs text-rose-300/90 font-mono">
                        Reason: {result.revocationReason}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-white/5 bg-slate-950/40 p-4 space-y-2 text-xs text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="font-mono uppercase text-[10px]">Certificate Number:</span>
                      <span className="font-mono text-slate-200">{result.certificateNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono uppercase text-[10px]">Course:</span>
                      <span className="text-slate-200">{result.courseTitle}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono uppercase text-[10px]">Original Issue Date:</span>
                      <span className="text-slate-200">{result.issueDateFormatted}</span>
                    </div>
                  </div>

                  <div className="pt-2 text-center">
                    <Button asChild variant="outline" className="border-white/10 text-white">
                      <Link to="/learn">Return to Academy Home</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STATUS 3: SUPERSEDED */}
            {result.status === "superseded" && (
              <div className="rounded-2xl border border-amber-500/40 bg-slate-900/90 shadow-2xl shadow-amber-950/30 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/60 border-b border-amber-500/30 px-6 py-4 flex items-center gap-3">
                  <div className="size-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <AlertTriangle className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-amber-300 uppercase tracking-wider">
                        Credential Status: SUPERSEDED
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        REISSUED
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      This certificate record was superseded by an updated reissuance. Historical record preserved for auditing.
                    </p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.03] space-y-2 text-xs">
                    <p className="text-sm text-slate-200">{result.reason}</p>
                    {result.supersededBy && (
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-slate-400">Superseding Reissued Certificate:</span>
                        <Link
                          to="/verify/$certificateId"
                          params={{ certificateId: result.supersededBy }}
                          className="font-mono text-cyan-400 hover:text-cyan-300 underline font-bold"
                        >
                          {result.supersededBy} →
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-white/5 bg-slate-950/40 p-4 space-y-2 text-xs text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="font-mono uppercase text-[10px]">Archived Certificate ID:</span>
                      <span className="font-mono text-slate-200">{result.certificateNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono uppercase text-[10px]">Original Issue Date:</span>
                      <span className="text-slate-200">{result.issueDateFormatted}</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    {result.supersededBy && (
                      <Button asChild className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium">
                        <Link to="/verify/$certificateId" params={{ certificateId: result.supersededBy }}>
                          View Active Reissued Certificate
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STATUS 4: NOT FOUND */}
            {result.status === "not_found" && (
              <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-8 text-center space-y-4 shadow-xl">
                <div className="size-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
                  <FileQuestion className="size-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Certificate Record Not Found</h3>
                  <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                    {result.reason ||
                      "No credential matching this identifier exists in the official registry. Please confirm the certificate ID was entered accurately without typos."}
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <Button asChild variant="outline" className="border-white/10 text-white">
                    <Link to="/verify-certificate">Try Another Certificate ID</Link>
                  </Button>
                  <Button asChild className="bg-cyan-600 hover:bg-cyan-500 text-white">
                    <Link to="/learn">Explore Curriculum</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Open Badges 3.0 Modal */}
        {showBadgeModal && openBadgeJson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="max-w-2xl w-full bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Code2 className="size-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">
                    Open Badges 3.0 / W3C Verifiable Credential Metadata
                  </h3>
                </div>
                <button
                  onClick={() => setShowBadgeModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-mono"
                >
                  Close [✕]
                </button>
              </div>
              <p className="text-xs text-slate-400">
                This schema aligns with 1EdTech Open Badges v3.0 standard for interoperable digital credentials and educational portfolios.
              </p>
              <pre className="flex-1 overflow-auto bg-black/60 p-4 rounded-xl text-[11px] font-mono text-cyan-300 border border-white/5">
                {openBadgeJson}
              </pre>
              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(openBadgeJson);
                    toast.success("Open Badges metadata copied to clipboard!");
                  }}
                  className="border-white/10 text-white"
                >
                  <Copy className="size-3.5 mr-1.5" />
                  Copy JSON
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowBadgeModal(false)}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
