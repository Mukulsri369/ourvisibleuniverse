import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  type StudentProfile,
  type AgeBracket,
  type ProfileVisibility,
  SUPPORTED_LANGUAGES,
  sanitizeStudentName,
} from "@/lib/academy/student-types";
import { LEARNING_LEVELS } from "@/lib/academy/registry";
import type { LearningLevel } from "@/lib/academy/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Shield,
  Award,
  Globe,
  Sliders,
  Eye,
  Lock,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  LogOut,
  Info,
  Calendar,
  Key,
} from "lucide-react";
import { toast } from "sonner";

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  isLoggedIn: boolean;
  onSaveProfile: (updates: Partial<StudentProfile>) => Promise<any>;
  onSignOut?: () => void;
  onSelectLevel: (level: LearningLevel) => void;
}

type TabType = "identity" | "level" | "safety" | "preferences" | "accessibility";

export function StudentProfileModal({
  isOpen,
  onClose,
  profile,
  isLoggedIn,
  onSaveProfile,
  onSignOut,
  onSelectLevel,
}: StudentProfileModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("identity");
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [certificateName, setCertificateName] = useState(profile.certificate_name);
  const [selectedLevel, setSelectedLevel] = useState<LearningLevel>(profile.selected_level);
  const [preferredLanguage, setPreferredLanguage] = useState(profile.preferred_language);
  const [ageBracket, setAgeBracket] = useState<AgeBracket>(profile.age_bracket);
  const [guardianEmail, setGuardianEmail] = useState(profile.guardian_email || "");
  const [guardianConsentAcknowledged, setGuardianConsentAcknowledged] = useState(
    profile.guardian_consent_status === "guardian_consented" ||
      profile.guardian_consent_status === "verified_adult",
  );
  const [profileVisibility, setProfileVisibility] = useState<ProfileVisibility>(
    profile.profile_visibility,
  );

  // Settings states
  const [reducedMotion, setReducedMotion] = useState(profile.accessibility_settings.reducedMotion);
  const [highContrast, setHighContrast] = useState(profile.accessibility_settings.highContrast);
  const [soundEffects, setSoundEffects] = useState(profile.accessibility_settings.soundEffects);
  const [fontSize, setFontSize] = useState(profile.accessibility_settings.fontSize);
  const [dyslexiaFont, setDyslexiaFont] = useState(
    profile.accessibility_settings.dyslexiaFriendlyFont,
  );
  const [screenReaderFriendly, setScreenReaderFriendly] = useState(
    profile.accessibility_settings.screenReaderFriendly,
  );

  const [autoAdvanceAudio, setAutoAdvanceAudio] = useState(
    profile.learning_settings.autoAdvanceAudio,
  );
  const [hintMode, setHintMode] = useState(profile.learning_settings.hintMode);
  const [voiceGuide, setVoiceGuide] = useState(profile.learning_settings.voiceGuide);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(
    profile.learning_settings.dailyGoalMinutes,
  );

  if (!isOpen) return null;

  const isMinor = ageBracket === "under_13" || ageBracket === "13_to_17";
  const isUnder13 = ageBracket === "under_13";

  const handleLevelChange = (newLevel: LearningLevel) => {
    setSelectedLevel(newLevel);
    onSelectLevel(newLevel);
    toast.info(
      `Curriculum depth set to ${LEARNING_LEVELS[newLevel].name}. All module progress preserved.`,
    );
  };

  const handleAgeBracketChange = (bracket: AgeBracket) => {
    setAgeBracket(bracket);
    if (bracket === "under_13") {
      setProfileVisibility("private");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const sanitizedDisplay = sanitizeStudentName(displayName, "Cosmic Explorer");
      const sanitizedCert = sanitizeStudentName(certificateName, "Cosmic Explorer");

      // Verify email was not pasted into display name
      if (/@/.test(displayName)) {
        toast.error("Email addresses cannot be used as student call signs for privacy protection.");
        setIsSaving(false);
        return;
      }

      let consentStatus = profile.guardian_consent_status;
      if (ageBracket === "18_plus") {
        consentStatus = "verified_adult";
      } else if (ageBracket === "under_13") {
        consentStatus = guardianConsentAcknowledged ? "guardian_consented" : "pending_guardian";
      } else {
        consentStatus = "not_required";
      }

      const updates: Partial<StudentProfile> = {
        display_name: sanitizedDisplay,
        certificate_name: sanitizedCert,
        selected_level: selectedLevel,
        preferred_language: preferredLanguage,
        age_bracket: ageBracket,
        guardian_consent_status: consentStatus,
        guardian_email: guardianEmail ? guardianEmail.trim() : null,
        profile_visibility: isUnder13 ? "private" : profileVisibility,
        accessibility_settings: {
          reducedMotion,
          highContrast,
          soundEffects,
          fontSize,
          dyslexiaFriendlyFont: dyslexiaFont,
          screenReaderFriendly,
        },
        learning_settings: {
          autoAdvanceAudio,
          hintMode,
          voiceGuide,
          dailyGoalMinutes,
        },
      };

      await onSaveProfile(updates);
      onClose();
    } catch (err: any) {
      // Error handled in hook
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <User className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Student Account & Identity
                </h2>
                {isLoggedIn ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono">
                    Free Student Account
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono">
                    Guest Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Public Student ID:{" "}
                <span className="font-mono text-cyan-400 font-semibold">
                  {profile.student_public_id}
                </span>{" "}
                (Email is never used or exposed)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-slate-950/40 px-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("identity")}
            className={`px-3 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "identity"
                ? "border-cyan-400 text-cyan-300 bg-white/[0.02]"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="size-4" />
            <span>Profile & Identity</span>
          </button>

          <button
            onClick={() => setActiveTab("level")}
            className={`px-3 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "level"
                ? "border-cyan-400 text-cyan-300 bg-white/[0.02]"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Award className="size-4" />
            <span>Learning Level</span>
          </button>

          <button
            onClick={() => setActiveTab("safety")}
            className={`px-3 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "safety"
                ? "border-cyan-400 text-cyan-300 bg-white/[0.02]"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="size-4" />
            <span>Child Safety & Privacy</span>
          </button>

          <button
            onClick={() => setActiveTab("preferences")}
            className={`px-3 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "preferences"
                ? "border-cyan-400 text-cyan-300 bg-white/[0.02]"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe className="size-4" />
            <span>Language & Study</span>
          </button>

          <button
            onClick={() => setActiveTab("accessibility")}
            className={`px-3 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "accessibility"
                ? "border-cyan-400 text-cyan-300 bg-white/[0.02]"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="size-4" />
            <span>Accessibility</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* TAB 1: IDENTITY */}
          {activeTab === "identity" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-400">Permanent Student Public ID</span>
                  <p className="text-lg font-mono font-bold text-cyan-300">
                    {profile.student_public_id}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Assigned identifier for public certificate verification without exposing
                    personal info.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                  <Calendar className="size-3.5 text-cyan-400" />
                  <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                    Student Call Sign / Display Name
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. StarVoyager"
                    className="bg-slate-950/60 border-white/10 text-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Appears in learning modules and AI teacher interactions.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                    Certificate Display Name
                  </label>
                  <Input
                    value={certificateName}
                    onChange={(e) => setCertificateName(e.target.value)}
                    placeholder="e.g. Alex M. or Cosmic Explorer"
                    className="bg-slate-950/60 border-white/10 text-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Name printed on generated Cosmic Explorer graduation certificates.
                  </p>
                </div>
              </div>

              {!isLoggedIn && (
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                      Exploring in Guest Mode
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Progress is stored locally on this browser. Create a free account or sign in
                      with your existing account to sync progress across all your devices.
                    </p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="bg-cyan-600 hover:bg-cyan-500 text-white flex-shrink-0"
                  >
                    <Link to="/auth" search={{ next: "/learn" }}>
                      Sign In / Register Free
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LEARNING LEVEL */}
          {activeTab === "level" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-4">
                <div className="flex items-start gap-3">
                  <Info className="size-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300 space-y-1">
                    <p className="font-semibold text-white">
                      Flexibility Guarantee: Change Levels Anytime Without Losing Progress
                    </p>
                    <p>
                      Switching your learning level adapts scientific depth, mathematical rigor, and
                      quiz challenges to match your school grade. Your completed modules, earned
                      stage badges, and laboratory records are <strong>never erased</strong> when
                      changing levels.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {(
                  Object.entries(LEARNING_LEVELS) as [
                    LearningLevel,
                    (typeof LEARNING_LEVELS)[LearningLevel],
                  ][]
                ).map(([lvlKey, lvlInfo]) => {
                  const isCurrent = selectedLevel === lvlKey;
                  return (
                    <div
                      key={lvlKey}
                      onClick={() => handleLevelChange(lvlKey)}
                      className={`cursor-pointer rounded-2xl p-4 sm:p-5 border transition-all ${
                        isCurrent
                          ? "border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-950/30"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          <span className="text-2xl">{lvlInfo.badge}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-white">{lvlInfo.name}</h4>
                              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-cyan-300">
                                {lvlInfo.gradeRange}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1">{lvlInfo.description}</p>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Target: {lvlInfo.targetAudience}
                            </p>
                          </div>
                        </div>

                        {isCurrent && (
                          <div className="size-6 rounded-full bg-cyan-400 flex items-center justify-center text-slate-950 flex-shrink-0">
                            <CheckCircle2 className="size-4 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CHILD SAFETY & PRIVACY */}
          {activeTab === "safety" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4">
                <div className="flex items-start gap-3">
                  <Shield className="size-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300 space-y-1">
                    <p className="font-semibold text-white">
                      Strict Child Privacy & COPPA / GDPR-K Protection
                    </p>
                    <p>
                      Our Visible Universe Academy never collects personal tracking cookies, sells
                      student data, or publicly displays minors' email addresses. Profiles for
                      students under 13 are strictly locked to Private.
                    </p>
                  </div>
                </div>
              </div>

              {/* Age Bracket Selector */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-2">
                  Student Age Bracket
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      key: "under_13" as AgeBracket,
                      label: "Under 13 Years",
                      sub: "Parental consent required; strictly private",
                    },
                    {
                      key: "13_to_17" as AgeBracket,
                      label: "13 to 17 Years",
                      sub: "Teen student; default private profile",
                    },
                    {
                      key: "18_plus" as AgeBracket,
                      label: "18+ Adult",
                      sub: "Independent learner",
                    },
                  ].map((item) => {
                    const isSelected = ageBracket === item.key;
                    return (
                      <div
                        key={item.key}
                        onClick={() => handleAgeBracketChange(item.key)}
                        className={`cursor-pointer rounded-2xl p-3.5 border transition-all ${
                          isSelected
                            ? "border-cyan-400 bg-cyan-500/10 text-white"
                            : "border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/5"
                        }`}
                      >
                        <p className="text-xs font-bold">{item.label}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{item.sub}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Guardian Consent Workflow for Under 13 */}
              {isUnder13 && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="size-4" />
                    <span>Parent / Guardian Consent Acknowledgement</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Under the Children's Online Privacy Protection Act (COPPA), a parent or legal
                    guardian must review and approve educational registration for students under 13
                    years old.
                  </p>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Parent / Guardian Email (For verification & certificate notices)
                    </label>
                    <Input
                      type="email"
                      value={guardianEmail}
                      onChange={(e) => setGuardianEmail(e.target.value)}
                      placeholder="parent.guardian@example.com"
                      className="bg-slate-950/60 border-white/10 text-white"
                    />
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={guardianConsentAcknowledged}
                      onChange={(e) => setGuardianConsentAcknowledged(e.target.checked)}
                      className="size-4 mt-0.5 rounded border-white/20 bg-slate-950 text-cyan-500 focus:ring-cyan-400"
                    />
                    <span className="text-xs text-slate-300">
                      I confirm that I am the parent or legal guardian of this student, and I grant
                      permission for them to learn astronomy on Our Visible Universe Academy with
                      zero ads and private progress tracking.
                    </span>
                  </label>
                </div>
              )}

              {/* Profile Visibility */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-2">
                  Profile Visibility
                </label>
                {isUnder13 ? (
                  <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-2">
                      <Lock className="size-4 text-emerald-400" />
                      <span>Strictly Private (Enforced for students under 13)</span>
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono">Protected</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setProfileVisibility("private")}
                      className={`cursor-pointer rounded-2xl p-3.5 border transition-all ${
                        profileVisibility === "private"
                          ? "border-cyan-400 bg-cyan-500/10"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs text-white">
                        <Lock className="size-3.5 text-cyan-400" />
                        <span>Private (Recommended)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Only you can see your module progress and quiz scores.
                      </p>
                    </div>

                    <div
                      onClick={() => setProfileVisibility("students_only")}
                      className={`cursor-pointer rounded-2xl p-3.5 border transition-all ${
                        profileVisibility === "students_only"
                          ? "border-cyan-400 bg-cyan-500/10"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs text-white">
                        <Eye className="size-3.5 text-indigo-400" />
                        <span>Academy Community Only</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Display name and earned stage badges visible to other students.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: LANGUAGE & LEARNING SETTINGS */}
          {activeTab === "preferences" && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-2">
                  Preferred Language
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = preferredLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setPreferredLanguage(lang.code)}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                          isSelected
                            ? "border-cyan-400 bg-cyan-500/10 text-white font-bold"
                            : "border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/5"
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <div>
                          <p className="text-xs leading-none">{lang.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{lang.nativeName}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/10">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Learning Flow Options
                </h4>

                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Interactive Hint Assistant
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Show pedagogical physics hints before quiz question reveals.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hintMode}
                    onChange={(e) => setHintMode(e.target.checked)}
                    className="size-4 rounded border-white/20 bg-slate-950 text-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      COSMOS AI Voice Teacher Guidance
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Enable spoken voice explanations in 3D astronomical simulations.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={voiceGuide}
                    onChange={(e) => setVoiceGuide(e.target.checked)}
                    className="size-4 rounded border-white/20 bg-slate-950 text-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Auto-Advance Audio Transcripts
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Automatically highlight read-along text synchronously with narration.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoAdvanceAudio}
                    onChange={(e) => setAutoAdvanceAudio(e.target.checked)}
                    className="size-4 rounded border-white/20 bg-slate-950 text-cyan-500"
                  />
                </div>

                <div className="p-3.5 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Daily Exploration Goal
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Recommended astronomical study minutes per day.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[10, 15, 30, 45].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDailyGoalMinutes(m)}
                        className={`text-xs px-2.5 py-1 rounded-lg border ${
                          dailyGoalMinutes === m
                            ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold"
                            : "border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ACCESSIBILITY */}
          {activeTab === "accessibility" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <div>
                    <span className="text-xs font-bold text-white block">Reduced Motion</span>
                    <span className="text-[11px] text-slate-400">
                      Calm camera transitions & disable rapid orbital spins.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={(e) => setReducedMotion(e.target.checked)}
                    className="size-4 rounded border-white/20 bg-slate-950 text-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <div>
                    <span className="text-xs font-bold text-white block">High Contrast Mode</span>
                    <span className="text-[11px] text-slate-400">
                      Increase UI border luminescence and text clarity.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                    className="size-4 rounded border-white/20 bg-slate-950 text-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Dyslexia-Friendly Font
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Enhance letter spacing and character distinction.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={dyslexiaFont}
                    onChange={(e) => setDyslexiaFont(e.target.checked)}
                    className="size-4 rounded border-white/20 bg-slate-950 text-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Screen Reader Aria Hints
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Inject descriptive 3D scene coordinate alt text.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={screenReaderFriendly}
                    onChange={(e) => setScreenReaderFriendly(e.target.checked)}
                    className="size-4 rounded border-white/20 bg-slate-950 text-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-2">
                  Font Scale
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["normal", "large", "extra-large"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFontSize(s)}
                      className={`p-3 rounded-2xl border text-center capitalize transition-all ${
                        fontSize === s
                          ? "border-cyan-400 bg-cyan-500/10 text-white font-bold"
                          : "border-white/10 bg-white/[0.02] text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="text-xs block">{s.replace("-", " ")}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-white/10 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          {isLoggedIn && onSignOut ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            >
              <LogOut className="size-3.5 mr-1.5" />
              <span>Sign Out</span>
            </Button>
          ) : (
            <div className="text-[11px] text-slate-400">Settings persist on this browser.</div>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-white/10 text-slate-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isSaving}
              onClick={handleSave}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
