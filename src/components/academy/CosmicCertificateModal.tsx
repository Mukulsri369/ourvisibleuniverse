import React, { useState, useRef, useEffect } from "react";
import {
  Award,
  Sparkles,
  Download,
  Printer,
  CheckCircle2,
  X,
  ShieldCheck,
  Star,
  ExternalLink,
  Share2,
  Eye,
  Maximize2,
  Palette,
  Sun,
  Moon,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LearningLevel } from "@/lib/academy/types";
import { useStudentAuth } from "@/lib/academy/useStudentAuth";
import {
  issueOfficialCertificate,
  generateCertificatePdfPayload,
} from "@/lib/academy/certificate.functions";
import type { CanonicalCertificate, CertificateTheme } from "@/lib/academy/certificate-types";
import { CERTIFICATE_CONSTANTS, LEARNING_LEVEL_LABELS } from "@/lib/academy/certificate-types";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

interface CosmicCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: LearningLevel;
  completedLabCount?: number;
  finalChallengePassed?: boolean;
  examScore?: number;
  existingCertificate?: CanonicalCertificate;
}

export const CosmicCertificateModal: React.FC<CosmicCertificateModalProps> = ({
  isOpen,
  onClose,
  level = "explorer",
  completedLabCount = 24,
  finalChallengePassed = true,
  examScore = 85.0,
  existingCertificate,
}) => {
  const { user, profile } = useStudentAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(!existingCertificate);
  const [certificate, setCertificate] = useState<CanonicalCertificate | null>(
    existingCertificate || null,
  );
  const [theme, setTheme] = useState<CertificateTheme>("cosmic_dark");
  const [isFullScreenView, setIsFullScreenView] = useState<boolean>(false);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isReducedMotion = profile?.accessibility_settings?.reducedMotion ?? false;

  // Fetch or issue certificate when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (existingCertificate) {
      setCertificate(existingCertificate);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchOrIssue = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await issueOfficialCertificate({
          data: { userId: user?.id, level },
        });
        if (isMounted) {
          setCertificate(res.certificate);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(
            err?.message ||
              "Could not issue certificate. Please ensure all 24 modules and the final exam are complete.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrIssue();

    return () => {
      isMounted = false;
    };
  }, [isOpen, user?.id, level, existingCertificate]);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    if (!certificate) return;
    setDownloadingPdf(true);
    try {
      const res = await generateCertificatePdfPayload({
        data: {
          certificateNumber: certificate.certificateNumber,
          theme,
        },
      });

      // Decode base64 to binary blob and trigger browser download
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
      toast.error(err?.message || "Failed to download PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleVerify = () => {
    if (!certificate) return;
    const verifyPath = `/verify-certificate?id=${encodeURIComponent(certificate.certificateNumber)}`;
    if (typeof window !== "undefined") {
      window.open(verifyPath, "_blank");
    } else {
      navigate({ to: "/verify-certificate", search: { id: certificate.certificateNumber } });
    }
  };

  const handleShare = async () => {
    if (!certificate) return;
    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : "https://ourvisibleuniverse.in"}/verify-certificate?id=${encodeURIComponent(certificate.certificateNumber)}`;
    const shareData = {
      title: "Certified Cosmic Explorer — Our Visible Universe Academy",
      text: `I've successfully achieved the Certified Cosmic Explorer credential in the Cosmic Journey astronomy curriculum (${certificate.finalScorePercentage.toFixed(1)}% on the final assessment)!`,
      url: shareUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
        return;
      } catch (err) {
        // User cancelled or fallback to clipboard
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Official certificate verification link copied to clipboard!");
    }
  };

  const recipientName =
    certificate?.certificateName ||
    profile?.certificate_name ||
    profile?.display_name ||
    "Cosmic Explorer";

  const isDark = theme === "cosmic_dark";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div
        className={`relative w-full max-w-5xl rounded-3xl border border-white/10 bg-slate-950 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh] ${
          isReducedMotion ? "" : "animate-in fade-in zoom-in-95 duration-300"
        }`}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="size-5" />
            </div>
            <div>
              <h3
                id="cert-dialog-title"
                className="text-sm font-bold text-white flex items-center gap-2"
              >
                Congratulations, Cosmic Explorer!
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Verified
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Official Certificate of Achievement • Our Visible Universe Academy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTheme(isDark ? "print_light" : "cosmic_dark")}
              className="border-white/10 text-xs text-slate-300 hover:text-white hidden sm:flex items-center gap-1.5"
              title="Toggle preview theme"
            >
              {isDark ? (
                <Sun className="size-3.5 text-amber-400" />
              ) : (
                <Moon className="size-3.5 text-cyan-400" />
              )}
              {isDark ? "Light Print Mode" : "Celestial Dark Mode"}
            </Button>

            <button
              onClick={onClose}
              aria-label="Close certificate modal"
              className="size-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {loading && (
            <div className="py-20 text-center space-y-3">
              <div className="animate-spin size-10 border-2 border-amber-400 border-t-transparent rounded-full mx-auto" />
              <p className="text-sm text-slate-300 font-mono">
                Issuing authoritative certificate transaction...
              </p>
            </div>
          )}

          {error && (
            <div className="p-8 text-center space-y-4 rounded-2xl border border-rose-500/30 bg-rose-950/20">
              <p className="text-sm text-rose-300 max-w-md mx-auto">{error}</p>
              <Button onClick={onClose} variant="outline" className="border-white/10 text-white">
                Return to Academy
              </Button>
            </div>
          )}

          {!loading && !error && certificate && (
            <>
              {/* Congratulations Banner */}
              <div
                className={`p-4 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-cyan-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isReducedMotion ? "" : "animate-pulse"
                }`}
              >
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <Sparkles className="size-6 text-amber-400 shrink-0 hidden sm:block" />
                  <div>
                    <h4 className="text-base font-bold text-white">
                      Curriculum Standard Mastered: Certified Cosmic Explorer
                    </h4>
                    <p className="text-xs text-slate-300">
                      All 24 curriculum modules verified complete and final examination passed with{" "}
                      <strong className="text-emerald-400">
                        {certificate.finalScorePercentage.toFixed(1)}%
                      </strong>
                      .
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-xs text-amber-300 font-bold bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/40">
                    ID: {certificate.certificateNumber}
                  </span>
                </div>
              </div>

              {/* LIVE CERTIFICATE PREVIEW CARD (A4 Aspect Ratio: ~1.414 : 1) */}
              <div
                className={`relative mx-auto rounded-2xl border p-6 sm:p-10 transition-colors shadow-2xl overflow-hidden aspect-[1.414/1] max-w-[850px] flex flex-col justify-between ${
                  isDark
                    ? "bg-[#060b18] border-amber-500/40 text-slate-100 shadow-amber-950/20"
                    : "bg-[#fcfbf7] border-amber-600/30 text-slate-900 shadow-slate-300"
                }`}
              >
                {/* Decorative Inset Border */}
                <div
                  className={`absolute inset-3 sm:inset-5 rounded-xl border pointer-events-none ${
                    isDark ? "border-amber-500/30" : "border-amber-700/20"
                  }`}
                />
                <div
                  className={`absolute inset-4 sm:inset-6 rounded-lg border pointer-events-none ${
                    isDark ? "border-amber-500/15" : "border-amber-700/10"
                  }`}
                />

                {/* Background Celestial Graphics (Dark Mode) */}
                {isDark && (
                  <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full border border-cyan-400/20" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[32rem] rounded-full border border-dashed border-amber-400/20" />
                  </div>
                )}

                {/* Header Section */}
                <div className="relative text-center space-y-1 pt-1 sm:pt-3">
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={`text-[9px] sm:text-xs font-mono tracking-[0.25em] uppercase font-bold ${
                        isDark ? "text-amber-400" : "text-amber-700"
                      }`}
                    >
                      OUR VISIBLE UNIVERSE ACADEMY
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <div
                      className={`h-px w-16 sm:w-28 ${isDark ? "bg-amber-500/30" : "bg-amber-600/30"}`}
                    />
                    <span className="text-xs text-amber-400">✦</span>
                    <div
                      className={`h-px w-16 sm:w-28 ${isDark ? "bg-amber-500/30" : "bg-amber-600/30"}`}
                    />
                  </div>
                  <h2
                    className={`text-xl sm:text-3xl font-serif font-bold tracking-wide uppercase pt-1 ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Certificate of Achievement
                  </h2>
                  <p
                    className={`text-[9px] sm:text-[11px] font-sans tracking-widest uppercase ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    THIS IS PROUDLY PRESENTED TO
                  </p>
                </div>

                {/* Recipient Display Name */}
                <div className="relative text-center my-auto py-2 sm:py-4">
                  <h3
                    className={`text-2xl sm:text-4xl font-serif font-extrabold tracking-tight pb-1.5 ${
                      isDark
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200"
                        : "text-amber-900"
                    }`}
                  >
                    {recipientName}
                  </h3>
                  <div
                    className={`h-0.5 max-w-[280px] sm:max-w-[400px] mx-auto ${
                      isDark ? "bg-amber-500/50" : "bg-amber-600/40"
                    }`}
                  />
                  <span className="inline-block mt-2 text-[10px] sm:text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
                    CERTIFIED COSMIC EXPLORER
                  </span>
                  <p
                    className={`text-[10px] sm:text-xs max-w-xl mx-auto mt-2 leading-relaxed font-serif ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    {CERTIFICATE_CONSTANTS.CERTIFICATE_TEXT}
                  </p>
                </div>

                {/* Bottom Metadata & Verification Row */}
                <div
                  className={`relative pt-3 sm:pt-4 border-t text-[9px] sm:text-xs flex items-end justify-between gap-4 ${
                    isDark ? "border-white/10" : "border-slate-300"
                  }`}
                >
                  {/* Left Column: Academic Record */}
                  <div className="space-y-0.5">
                    <span className="font-mono text-[9px] text-amber-500 font-bold uppercase block">
                      Program Record
                    </span>
                    <p className={isDark ? "text-slate-300" : "text-slate-700"}>
                      <strong>Curriculum:</strong> Cosmic Journey (24 Modules)
                    </p>
                    <p className={isDark ? "text-slate-300" : "text-slate-700"}>
                      <strong>Level:</strong> {certificate.learningLevelLabel}
                    </p>
                    <p className={isDark ? "text-slate-300" : "text-slate-700"}>
                      <strong>Assessment:</strong> {certificate.finalScorePercentage.toFixed(1)}%
                      Score
                    </p>
                    <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                      <strong>Issued:</strong> {certificate.issueDateFormatted}
                    </p>
                  </div>

                  {/* Center: Authoritative Seal Emblem */}
                  <div className="hidden sm:flex flex-col items-center justify-center text-center">
                    <div
                      className={`size-14 rounded-full border-2 flex items-center justify-center ${
                        isDark
                          ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                          : "border-amber-600/50 bg-amber-600/10 text-amber-700"
                      }`}
                    >
                      <Compass className="size-7 animate-pulse" />
                    </div>
                    <span className="text-[8px] font-mono tracking-widest uppercase mt-1 text-slate-400">
                      OFFICIAL SEAL
                    </span>
                  </div>

                  {/* Right Column: Unique Certificate ID & Verification */}
                  <div className="text-right space-y-0.5">
                    <span className="font-mono text-[9px] text-amber-500 font-bold uppercase block">
                      Verification
                    </span>
                    <p className="font-mono font-bold text-amber-400 text-[10px] sm:text-xs">
                      {certificate.certificateNumber}
                    </p>
                    <p className="font-mono text-[9px] text-slate-400">
                      ID: {certificate.studentPublicId}
                    </p>
                    <p className="text-[8px] font-mono text-slate-500 truncate max-w-[140px] sm:max-w-[200px]">
                      Hash: {certificate.verificationHash.slice(0, 16)}...
                    </p>
                  </div>
                </div>

                {/* Sub-disclaimer line */}
                <div className="relative text-center pt-2">
                  <p className="text-[7.5px] sm:text-[8.5px] text-slate-500 font-sans max-w-2xl mx-auto leading-tight">
                    {CERTIFICATE_CONSTANTS.DISCLAIMER}
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS (The 4 Required Experience Buttons) */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  onClick={handleDownloadPDF}
                  disabled={downloadingPdf}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-5 py-2.5 shadow-lg shadow-amber-500/20"
                >
                  <Download className="size-4 mr-2" />
                  {downloadingPdf ? "Generating PDF..." : "DOWNLOAD PDF"}
                </Button>

                <Button
                  onClick={handleVerify}
                  variant="outline"
                  className="border-white/20 bg-slate-900/80 hover:bg-slate-800 text-white font-medium px-5"
                >
                  <ShieldCheck className="size-4 mr-2 text-cyan-400" />
                  VERIFY CERTIFICATE
                </Button>

                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="border-white/20 bg-slate-900/80 hover:bg-slate-800 text-white font-medium px-5"
                >
                  <Share2 className="size-4 mr-2 text-amber-400" />
                  SHARE ACHIEVEMENT
                </Button>

                <Button
                  onClick={handlePrint}
                  variant="ghost"
                  className="text-slate-300 hover:text-white"
                  title="Print certificate"
                >
                  <Printer className="size-4 mr-1.5" />
                  Print
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
