import React, { useState, useRef } from "react";
import {
  Award,
  Sparkles,
  Download,
  Printer,
  CheckCircle2,
  X,
  ShieldCheck,
  Star,
  Globe,
  Compass,
  Rocket,
  Flame,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LearningLevel } from "@/lib/academy/types";

interface CosmicCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: LearningLevel;
  completedLabCount: number;
  finalChallengePassed: boolean;
}

const CALLSIGN_PRESETS = [
  "Cadet Nova",
  "Commander Orion",
  "Explorer Kepler",
  "Navigator Andromeda",
  "Captain Pulsar",
  "Voyager Phoenix",
  "Astronomer Zenith",
];

export const CosmicCertificateModal: React.FC<CosmicCertificateModalProps> = ({
  isOpen,
  onClose,
  level,
  completedLabCount,
  finalChallengePassed,
}) => {
  const [callsign, setCallsign] = useState<string>("Explorer Kepler");
  const [customCallsign, setCustomCallsign] = useState<string>("");
  const [isEditingCallsign, setIsEditingCallsign] = useState<boolean>(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const activeName = isEditingCallsign && customCallsign.trim() ? customCallsign.trim() : callsign;

  const issueDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const verificationCode = `CLA-${Math.abs(
    (activeName + level + issueDate)
      .split("")
      .reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0),
  )
    .toString(16)
    .toUpperCase()
    .padStart(8, "0")}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSVG = () => {
    const certSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1000" height="700" fill="url(#bgGrad)" />

  <!-- Outer Frame -->
  <rect x="25" y="25" width="950" height="650" rx="16" fill="none" stroke="url(#borderGrad)" stroke-width="3" stroke-opacity="0.8" />
  <rect x="35" y="35" width="930" height="630" rx="12" fill="none" stroke="#38bdf8" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="6,6" />

  <!-- Corner Ornaments -->
  <circle cx="50" cy="50" r="8" fill="#fbbf24" />
  <circle cx="950" cy="50" r="8" fill="#fbbf24" />
  <circle cx="50" cy="650" r="8" fill="#fbbf24" />
  <circle cx="950" cy="650" r="8" fill="#fbbf24" />

  <!-- Header -->
  <text x="500" y="100" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="#38bdf8" letter-spacing="4">
    COSMIC LEARNING ACADEMY
  </text>
  <text x="500" y="150" text-anchor="middle" font-family="serif" font-size="34" font-weight="bold" fill="url(#goldGrad)" letter-spacing="2">
    COSMIC EXPLORER CERTIFICATE
  </text>
  <text x="500" y="185" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#94a3b8" letter-spacing="2">
    HONORARY ASTROPHYSICS &amp; SPACE EXPLORATION ACCREDITATION
  </text>

  <!-- Body Text -->
  <text x="500" y="250" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" fill="#cbd5e1">
    This certifies that Space Explorer
  </text>

  <!-- Recipient Name -->
  <text x="500" y="310" text-anchor="middle" font-family="system-ui, sans-serif" font-size="36" font-weight="bold" fill="#ffffff" letter-spacing="1">
    ${activeName}
  </text>
  <line x1="300" y1="330" x2="700" y2="330" stroke="#f59e0b" stroke-width="2" stroke-opacity="0.6" />

  <!-- Accomplishment Paragraph -->
  <text x="500" y="375" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" fill="#cbd5e1">
    has successfully completed all 24 Modules of the Cosmic Learning Academy curriculum,
  </text>
  <text x="500" y="405" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" fill="#cbd5e1">
    demonstrating scientific mastery across Celestial Mechanics, Stellar Physics, Galactic Dynamics,
  </text>
  <text x="500" y="435" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" fill="#cbd5e1">
    Observational Telescopes, Astrobiology, and Physical Cosmology.
  </text>

  <!-- Learning Tier Badge -->
  <rect x="400" y="470" width="200" height="38" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
  <text x="500" y="495" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#38bdf8" letter-spacing="1">
    TIER: ${level.toUpperCase()} EXPLORER
  </text>

  <!-- Footer Info -->
  <text x="150" y="580" text-anchor="middle" font-family="monospace" font-size="12" fill="#64748b">VERIFICATION ID</text>
  <text x="150" y="605" text-anchor="middle" font-family="monospace" font-size="14" font-weight="bold" fill="#38bdf8">${verificationCode}</text>

  <!-- Seal in Center Bottom -->
  <circle cx="500" cy="590" r="42" fill="#0f172a" stroke="#f59e0b" stroke-width="2" />
  <circle cx="500" cy="590" r="36" fill="none" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,3" />
  <text x="500" y="585" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="bold" fill="#f59e0b">COSMIC ACADEMY</text>
  <text x="500" y="605" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#ffffff">★ 24/24 ★</text>

  <text x="850" y="580" text-anchor="middle" font-family="monospace" font-size="12" fill="#64748b">DATE OF ISSUANCE</text>
  <text x="850" y="605" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#ffffff">${issueDate}</text>
</svg>
    `.trim();

    const blob = new Blob([certSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cosmic_Academy_Certificate_${activeName.replace(/\s+/g, "_")}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="size-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Cosmic Explorer Completion Certificate
                <Sparkles className="size-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400">
                Celebrate your journey across all 24 Modules of Cosmic Learning Academy!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Callsign Selector Bar (Child Privacy Friendly) */}
        <div className="px-6 py-3 bg-slate-900/90 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-semibold text-amber-400">Explorer Callsign:</span>
            {!isEditingCallsign ? (
              <select
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                className="bg-slate-800 border border-white/10 rounded px-2.5 py-1 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                {CALLSIGN_PRESETS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Enter callsign / nickname"
                maxLength={30}
                value={customCallsign}
                onChange={(e) => setCustomCallsign(e.target.value)}
                className="bg-slate-800 border border-amber-500/50 rounded px-2.5 py-1 text-white text-xs w-48 focus:outline-none"
              />
            )}
            <button
              onClick={() => setIsEditingCallsign(!isEditingCallsign)}
              className="text-cyan-400 hover:text-cyan-300 underline text-[11px] ml-1"
            >
              {isEditingCallsign ? "Choose Preset" : "Custom Callsign"}
            </button>
          </div>

          <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
            <ShieldCheck className="size-3.5" />
            <span>Private: No real names collected or published</span>
          </div>
        </div>

        {/* Certificate Printable Canvas Preview */}
        <div className="p-6 md:p-8 bg-slate-950 flex justify-center">
          <div
            ref={certificateRef}
            className="w-full max-w-3xl aspect-[1.414/1] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-xl p-8 border-2 border-amber-500/40 shadow-2xl relative flex flex-col justify-between text-center select-none"
            style={{
              boxShadow: "0 0 50px -12px rgba(245, 158, 11, 0.25)",
            }}
          >
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
              <Globe className="size-96 text-white" />
            </div>

            {/* Inner Border */}
            <div className="absolute inset-3 border border-cyan-400/20 rounded-lg pointer-events-none border-dashed" />

            {/* Top Stars & Header */}
            <div>
              <div className="flex justify-center items-center gap-2 text-amber-400 mb-2">
                <Star className="size-4 fill-amber-400" />
                <span className="text-[11px] font-mono tracking-widest uppercase text-cyan-400">
                  Cosmic Learning Academy
                </span>
                <Star className="size-4 fill-amber-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 tracking-wider uppercase">
                Cosmic Explorer Certificate
              </h1>
              <p className="text-xs text-slate-400 font-mono tracking-wider mt-1">
                OF SCIENTIFIC CAPSTONE COMPLETION
              </p>
            </div>

            {/* Recipient Callsign */}
            <div className="my-auto py-4">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                This honor is hereby conferred upon
              </p>
              <div className="text-2xl sm:text-4xl font-extrabold text-white tracking-wide border-b-2 border-amber-400/50 inline-block px-8 pb-1">
                {activeName}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mt-4 leading-relaxed">
                for demonstrating exceptional scientific mastery across all{" "}
                <span className="text-amber-400 font-semibold">24 Modules</span>, including
                Celestial Mechanics, Stellar Evolution, Dark Matter, General Relativity,
                Observational Astrophysics, and the Search for Life Beyond Earth.
              </p>
            </div>

            {/* Bottom Credentials & Seal */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-left text-xs">
              <div>
                <div className="text-[10px] uppercase font-mono text-slate-400">
                  Accreditation Tier
                </div>
                <div className="text-cyan-400 font-bold uppercase tracking-wider">
                  {level.toUpperCase()} EXPLORER
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">
                  ID: <span className="text-slate-300">{verificationCode}</span>
                </div>
              </div>

              {/* Academy Seal */}
              <div className="flex flex-col items-center">
                <div className="size-16 rounded-full border-2 border-amber-400/60 bg-slate-900/80 flex flex-col items-center justify-center shadow-lg relative">
                  <div className="absolute inset-1 rounded-full border border-amber-400/30 border-dashed animate-spin-slow" />
                  <Award className="size-6 text-amber-400 mb-0.5" />
                  <span className="text-[8px] font-mono font-bold text-amber-300">ACADEMY</span>
                </div>
                <span className="text-[9px] text-slate-400 mt-1">OFFICIAL SEAL</span>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-mono text-slate-400">Date Issued</div>
                <div className="text-white font-semibold">{issueDate}</div>
                <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-400 mt-1">
                  <CheckCircle2 className="size-3" />
                  <span>24/24 Complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="size-4 text-amber-400" />
            <span>
              Labs Completed: <strong className="text-white">{completedLabCount}/10</strong> • Final
              Challenge:{" "}
              <strong className={finalChallengePassed ? "text-emerald-400" : "text-amber-400"}>
                {finalChallengePassed ? "Passed" : "Available"}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Printer className="size-4 mr-2" />
              Print
            </Button>
            <Button
              size="sm"
              onClick={handleDownloadSVG}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
            >
              <Download className="size-4 mr-2" />
              Download Certificate (SVG)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
