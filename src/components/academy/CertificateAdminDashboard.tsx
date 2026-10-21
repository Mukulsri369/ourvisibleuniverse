// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Search,
  RefreshCw,
  ExternalLink,
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  History,
  Lock,
  Layers,
  ArrowRight,
  TrendingUp,
  Percent,
} from "lucide-react";
import { toast } from "sonner";
import {
  adminListCertificates,
  adminGetCertificateDetails,
  adminRevokeCertificate,
  adminCorrectCertificate,
  adminReissueCertificate,
  adminGetCertificateStats,
} from "@/lib/academy/certificate.functions";
import type {
  AdminCertificateRecord,
  AdminCertificateStats,
  LearningLevel,
} from "@/lib/academy/certificate-types";
import { supabase } from "@/integrations/supabase/client";

export function CertificateAdminDashboard() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authToken, setAuthToken] = useState<string>("");
  const [stats, setStats] = useState<AdminCertificateStats | null>(null);
  const [certificates, setCertificates] = useState<AdminCertificateRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "revoked" | "superseded">(
    "all",
  );
  const [levelFilter, setLevelFilter] = useState<"all" | LearningLevel>("all");

  // Inspection modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectingCert, setInspectingCert] = useState<any>(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  // Revocation modal
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [targetCert, setTargetCert] = useState<AdminCertificateRecord | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  // Correction / Reissue modal
  const [reissueModalOpen, setReissueModalOpen] = useState(false);
  const [reissueReason, setReissueReason] = useState("");
  const [updatedName, setUpdatedName] = useState("");
  const [updatedLevel, setUpdatedLevel] = useState<LearningLevel>("explorer");

  // Check auth and initial load
  useEffect(() => {
    async function initAdmin() {
      setLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token || "";
        setAuthToken(token);

        // Fetch stats first (server evaluates real admin credentials)
        const statsRes = await adminGetCertificateStats({ data: { adminToken: token } });
        setStats(statsRes);
        setIsAdmin(true);
        const certsRes = await adminListCertificates({
          data: {
            page: 1,
            pageSize: 15,
            search: "",
            status: "all",
            level: "all",
            adminToken: token,
          },
        });
        setCertificates(certsRes.records as AdminCertificateRecord[]);
        setTotalCount(certsRes.totalCount);
        setPage(certsRes.page);
      } catch (err: any) {
        setIsAdmin(false);
        console.warn("User is not an authorized administrator:", err?.message || err);
      } finally {
        setLoading(false);
      }
    }
    void initAdmin();
  }, []);

  const loadCertificates = async (
    p = page,
    s = search,
    st = statusFilter,
    lvl = levelFilter,
    token = authToken,
  ) => {
    setLoading(true);
    try {
      const res = await adminListCertificates({
        data: {
          page: p,
          pageSize: 15,
          search: s,
          status: st,
          level: lvl,
          adminToken: token,
        },
      });
      setCertificates(res.records as AdminCertificateRecord[]);
      setTotalCount(res.totalCount);
      setPage(res.page);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load certificates.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCertificates(1, search, statusFilter, levelFilter);
  };

  const handleInspect = async (certNumber: string) => {
    setInspectLoading(true);
    setInspectModalOpen(true);
    try {
      const details = await adminGetCertificateDetails({
        data: { certificateNumber: certNumber, adminToken: authToken },
      });
      setInspectingCert(details);
    } catch (err: any) {
      toast.error(err?.message || "Could not load certificate evidence.");
      setInspectModalOpen(false);
    } finally {
      setInspectLoading(false);
    }
  };

  const handleOpenRevoke = (cert: AdminCertificateRecord) => {
    setTargetCert(cert);
    setRevokeReason("");
    setRevokeModalOpen(true);
  };

  const handleConfirmRevoke = async () => {
    if (!targetCert || !revokeReason.trim()) {
      toast.error("Please supply a clear justification reason for revocation.");
      return;
    }
    setSubmittingAction(true);
    try {
      await adminRevokeCertificate({
        data: {
          certificateNumber: targetCert.certificateNumber,
          reason: revokeReason.trim(),
          adminToken: authToken,
        },
      });
      toast.success(`Certificate ${targetCert.certificateNumber} revoked.`);
      setRevokeModalOpen(false);
      await loadCertificates();
      const updatedStats = await adminGetCertificateStats({ data: { adminToken: authToken } });
      setStats(updatedStats);
    } catch (err: any) {
      toast.error(err?.message || "Revocation failed.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleOpenReissue = (cert: AdminCertificateRecord) => {
    setTargetCert(cert);
    setReissueReason("");
    setUpdatedName(cert.certificateName || cert.displayName);
    setUpdatedLevel(cert.learningLevel);
    setReissueModalOpen(true);
  };

  const handleConfirmReissue = async () => {
    if (!targetCert || !reissueReason.trim()) {
      toast.error("Please provide a reason for reissuing this certificate.");
      return;
    }
    setSubmittingAction(true);
    try {
      const res = await adminReissueCertificate({
        data: {
          certificateNumber: targetCert.certificateNumber,
          reason: reissueReason.trim(),
          updatedCertificateName: updatedName.trim() || undefined,
          updatedLearningLevel: updatedLevel,
          adminToken: authToken,
        },
      });
      toast.success(res.message);
      setReissueModalOpen(false);
      await loadCertificates();
      const updatedStats = await adminGetCertificateStats({ data: { adminToken: authToken } });
      setStats(updatedStats);
    } catch (err: any) {
      toast.error(err?.message || "Reissuance failed.");
    } finally {
      setSubmittingAction(false);
    }
  };

  if (isAdmin === false) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-slate-900/80 p-8 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="size-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
          <Lock className="size-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Administrator Access Restricted</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Access to certificate registry administration requires verified server-side administrator
          credentials. Supplying unauthenticated email addresses or parameters does not grant admin
          access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <ShieldCheck className="size-3.5" />
            Academy Credential Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Certificate Registry & Verification Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Authoritative administration, cryptographic audit tracking, and lineage supersession
            controls.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            loadCertificates();
            adminGetCertificateStats({ data: { adminToken: authToken } }).then(setStats);
          }}
          className="border-white/20 text-slate-200 hover:text-white"
        >
          <RefreshCw className="size-3.5 mr-1.5" />
          Refresh Registry
        </Button>
      </div>

      {/* Aggregate Statistics */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl border border-white/10 bg-slate-900/60 space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400">Total Issued</span>
            <p className="text-2xl font-bold text-white">{stats.totalIssued}</p>
          </div>
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 space-y-1">
            <span className="text-[10px] uppercase font-mono text-emerald-400">Active</span>
            <p className="text-2xl font-bold text-emerald-300">{stats.activeCount}</p>
          </div>
          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/20 space-y-1">
            <span className="text-[10px] uppercase font-mono text-rose-400">Revoked</span>
            <p className="text-2xl font-bold text-rose-300">{stats.revokedCount}</p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/20 space-y-1">
            <span className="text-[10px] uppercase font-mono text-amber-400">Superseded</span>
            <p className="text-2xl font-bold text-amber-300">{stats.supersededCount}</p>
          </div>
          <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 space-y-1">
            <span className="text-[10px] uppercase font-mono text-cyan-400">Avg Exam Score</span>
            <p className="text-2xl font-bold text-cyan-300">{stats.averageScore}%</p>
          </div>
          <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-950/20 space-y-1">
            <span className="text-[10px] uppercase font-mono text-purple-400">Pass Rate</span>
            <p className="text-2xl font-bold text-purple-300">{stats.passingRatePct}%</p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by Certificate ID, Student ID, or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 font-mono text-xs bg-slate-900/80 border-white/10 text-white placeholder:text-slate-500"
          />
        </form>

        <div className="flex gap-2 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => {
              const val = e.target.value as any;
              setStatusFilter(val);
              loadCertificates(1, search, val, levelFilter);
            }}
            className="text-xs bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active (Valid)</option>
            <option value="revoked">Revoked</option>
            <option value="superseded">Superseded</option>
          </select>

          <select
            value={levelFilter}
            onChange={(e) => {
              const val = e.target.value as any;
              setLevelFilter(val);
              loadCertificates(1, search, statusFilter, val);
            }}
            className="text-xs bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-slate-200"
          >
            <option value="all">All Levels</option>
            <option value="junior">Junior Explorer</option>
            <option value="explorer">Space Explorer</option>
            <option value="astronomer">Young Astronomer</option>
          </select>
        </div>
      </div>

      {/* Certificates Data Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-white/10">
              <tr>
                <th className="p-3.5">Certificate ID</th>
                <th className="p-3.5">Student / Call Sign</th>
                <th className="p-3.5">Learning Tier</th>
                <th className="p-3.5">Score</th>
                <th className="p-3.5">Issue Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-mono">
                    Loading registry records...
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-mono">
                    No certificate records matched the active filters.
                  </td>
                </tr>
              ) : (
                certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 font-mono text-cyan-300 font-semibold">
                      {cert.certificateNumber}
                    </td>
                    <td className="p-3.5 font-medium text-white">
                      <div>{cert.certificateName || cert.displayName}</div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {cert.studentPublicId}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">{cert.learningLevelLabel}</td>
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">
                      {cert.finalScorePercentage?.toFixed(1)}%
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">{cert.issueDate}</td>
                    <td className="p-3.5">
                      {cert.status === "active" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono">
                          <CheckCircle2 className="size-3" />
                          VALID
                        </span>
                      )}
                      {cert.status === "revoked" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-mono">
                          <XCircle className="size-3" />
                          REVOKED
                        </span>
                      )}
                      {cert.status === "superseded" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono">
                          <History className="size-3" />
                          SUPERSEDED
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleInspect(cert.certificateNumber)}
                        className="h-7 text-xs text-slate-300 hover:text-white"
                        title="View assessment evidence and audit trail"
                      >
                        Evidence
                      </Button>
                      {cert.status === "active" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenReissue(cert)}
                            className="h-7 text-xs text-amber-300 hover:text-amber-200"
                            title="Correct details and reissue with supersession lineage"
                          >
                            Reissue
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenRevoke(cert)}
                            className="h-7 text-xs text-rose-400 hover:text-rose-300"
                            title="Revoke certificate"
                          >
                            Revoke
                          </Button>
                        </>
                      )}
                      <a
                        href={`/verify/${cert.certificateNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center size-7 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                        title="Open public verification page"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evidence & Audit Modal */}
      {inspectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-2xl w-full bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="size-4 text-cyan-400" />
                Assessment Evidence & Audit Trail
              </h3>
              <button
                onClick={() => setInspectModalOpen(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            {inspectLoading ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs">
                Loading evidence...
              </div>
            ) : inspectingCert ? (
              <div className="space-y-4 text-xs">
                {/* Evidence Summary */}
                <div className="p-4 rounded-xl border border-white/5 bg-slate-950/40 space-y-2">
                  <span className="font-mono uppercase text-[10px] text-slate-400 font-bold block">
                    Verified Academic Evidence
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div>
                      Modules Completed:{" "}
                      <span className="font-bold text-emerald-400">
                        {inspectingCert.assessmentEvidence.totalModulesCompleted} / 24
                      </span>
                    </div>
                    <div>
                      Final Exam Score:{" "}
                      <span className="font-bold text-emerald-400">
                        {inspectingCert.assessmentEvidence.finalExamScore}%
                      </span>
                    </div>
                    <div>
                      Attempt ID:{" "}
                      <span className="font-mono text-slate-400">
                        {inspectingCert.assessmentEvidence.attemptId}
                      </span>
                    </div>
                    <div>
                      Curriculum Version:{" "}
                      <span className="font-mono text-slate-400">
                        v{inspectingCert.assessmentEvidence.curriculumVersion}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cryptographic Signature */}
                <div className="p-4 rounded-xl border border-white/5 bg-slate-950/40 space-y-1">
                  <span className="font-mono uppercase text-[10px] text-slate-400 font-bold block">
                    Cryptographic HMAC-SHA256 Fingerprint
                  </span>
                  <code className="font-mono text-[10px] text-cyan-300 break-all block">
                    {inspectingCert.certificate.verificationHash}
                  </code>
                </div>

                {/* Audit Trail */}
                <div className="space-y-2">
                  <span className="font-mono uppercase text-[10px] text-slate-400 font-bold block">
                    Immutable Audit History ({inspectingCert.auditTrail.length} records)
                  </span>
                  {inspectingCert.auditTrail.length === 0 ? (
                    <p className="text-slate-500 italic">No administrative alterations recorded.</p>
                  ) : (
                    <div className="space-y-2">
                      {inspectingCert.auditTrail.map((log: any) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-lg border border-white/5 bg-white/[0.01] space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span className="text-amber-400 uppercase">{log.action}</span>
                            <span>{new Date(log.created_at).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-300 text-[11px]">
                            Actor: {log.actor_role} ({log.actor_id})
                          </p>
                          {log.new_state && (
                            <pre className="text-[10px] font-mono text-slate-400 overflow-x-auto bg-black/40 p-2 rounded">
                              {JSON.stringify(log.new_state, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Revocation Dialog */}
      {revokeModalOpen && targetCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="size-5" />
              <h3 className="text-base font-bold text-white">Revoke Issued Certificate</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to revoke certificate{" "}
              <strong className="font-mono text-white">{targetCert.certificateNumber}</strong>. Once
              revoked, this credential will permanently verify as <em>REVOKED</em> across all public
              checks.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-slate-400">
                Mandatory Revocation Reason:
              </label>
              <Input
                type="text"
                placeholder="e.g. Assessment irregularity / Administrative cancellation"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="text-xs bg-slate-950 border-white/10 text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRevokeModalOpen(false)}
                className="border-white/10 text-white"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={submittingAction || !revokeReason.trim()}
                onClick={handleConfirmRevoke}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                {submittingAction ? "Revoking..." : "Confirm Revocation"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reissue Dialog */}
      {reissueModalOpen && targetCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/40 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <History className="size-5" />
              <h3 className="text-base font-bold text-white">Reissue Certificate</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will mark{" "}
              <strong className="font-mono text-white">{targetCert.certificateNumber}</strong> as
              <em className="text-amber-400"> SUPERSEDED</em> and issue a brand-new certificate with
              unique cryptographic ID. Prior issuance records are strictly preserved for auditing.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Approved Certificate Name:</label>
                <Input
                  type="text"
                  value={updatedName}
                  onChange={(e) => setUpdatedName(e.target.value)}
                  className="bg-slate-950 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Learning Tier:</label>
                <select
                  value={updatedLevel}
                  onChange={(e) => setUpdatedLevel(e.target.value as LearningLevel)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                >
                  <option value="junior">Junior Explorer</option>
                  <option value="explorer">Space Explorer</option>
                  <option value="astronomer">Young Astronomer</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Reason for Reissuance:</label>
                <Input
                  type="text"
                  placeholder="e.g. Corrected recipient legal name spelling"
                  value={reissueReason}
                  onChange={(e) => setReissueReason(e.target.value)}
                  className="bg-slate-950 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReissueModalOpen(false)}
                className="border-white/10 text-white"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={submittingAction || !reissueReason.trim()}
                onClick={handleConfirmReissue}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                {submittingAction ? "Reissuing..." : "Confirm & Reissue"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
