import { AdminAccessLink } from "@/components/admin/AdminAccessLink";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { getMyAccess } from "@/lib/razorpay.functions";
import { useStudentAuth } from "@/lib/academy/useStudentAuth";
import { StudentProfileModal } from "@/components/academy/StudentProfileModal";
import { LEARNING_LEVELS } from "@/lib/academy/registry";
import { GraduationCap, Shield, User, Award, ExternalLink } from "lucide-react";

type Access =
  | { access_days: number; expires_at: string; price_id: string; starts_at: string; status: string }
  | null
  | undefined;

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "Your account — Our Visible Universe" },
      {
        name: "description",
        content: "View your universe access pass and academy student profile.",
      },
      { property: "og:title", content: "Your account — Our Visible Universe" },
      {
        property: "og:description",
        content: "View your universe access pass and academy student profile.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const [access, setAccess] = useState<Access>();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { profile, updateProfile, changeLearningLevel, signOut } = useStudentAuth();

  useEffect(() => {
    void getMyAccess()
      .then((r) => setAccess(r.access))
      .catch(() => setAccess(null));
  }, []);
  const active = Boolean(
    access && access.status === "active" && new Date(access.expires_at) > new Date(),
  );
  const days = access
    ? Math.max(0, Math.ceil((new Date(access.expires_at).getTime() - Date.now()) / 86400000))
    : 0;
  return (
    <PublicLayout>
      <main className="mx-auto max-w-4xl px-5 pb-24 pt-36 space-y-10">
        <div>
          <p className="text-sm font-semibold uppercase text-primary">Your account</p>
          <h1 className="mt-2 text-4xl font-semibold">Account Overview</h1>
          <div className="mt-4">
            <AdminAccessLink />
          </div>
        </div>

        {/* 1. Cosmic Learning Academy Student Profile */}
        <section className="border border-cyan-500/30 bg-gradient-to-r from-slate-900/90 to-cyan-950/20 p-7 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3.5">
              <div className="size-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                <GraduationCap className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white">Cosmic Learning Academy</h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono">
                    Free Forever
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Verified astronomical education curriculum, 3D simulations & knowledge
                  certification.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfileModal(true)}
                className="border-white/20 text-slate-200 hover:text-white hover:bg-white/10"
              >
                <User className="size-3.5 mr-1.5 text-cyan-400" />
                <span>Manage Profile</span>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-white/20 text-slate-200 hover:text-white hover:bg-white/10"
              >
                <Link to="/admin-certificates">
                  <Shield className="size-3.5 mr-1.5 text-amber-400" />
                  <span>Cert Admin</span>
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
              >
                <Link to="/learn">
                  <span>Open Academy</span>
                  <ExternalLink className="size-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Student Call Sign
              </p>
              <p className="mt-1 text-lg font-bold text-white">{profile.display_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Public Student ID
              </p>
              <p className="mt-1 text-lg font-mono font-bold text-cyan-300">
                {profile.student_public_id}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Learning Level
              </p>
              <p className="mt-1 text-lg font-bold text-white">
                {LEARNING_LEVELS[profile.selected_level]?.name || profile.selected_level}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Privacy Status
              </p>
              <p className="mt-1 text-lg font-medium text-emerald-400 flex items-center gap-1.5">
                <Shield className="size-4" />
                <span className="capitalize">{profile.profile_visibility}</span>
              </p>
            </div>
          </div>
        </section>

        {/* 2. Universe Access Pass */}
        <section className="border border-border bg-card p-7 rounded-2xl">
          <p className="text-sm text-muted-foreground">Universe access pass</p>
          <p className="mt-2 text-2xl font-semibold">
            {access === undefined ? "Checking…" : active ? "Active" : "No active pass"}
          </p>
          {active && access && (
            <div className="mt-7 grid gap-5 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="mt-1 text-xl">{days} days</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last pass</p>
                <p className="mt-1 text-xl">{access.access_days} days</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Access until</p>
                <p className="mt-1 text-xl" suppressHydrationWarning>
                  {new Date(access.expires_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {active ? (
              <Button asChild>
                <Link to="/universe">Open universe</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/pricing">Choose a pass</Link>
              </Button>
            )}
            {active && (
              <Button asChild variant="outline">
                <Link to="/pricing">Extend access</Link>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={async () => {
                await signOut();
                await navigate({ to: "/" });
              }}
            >
              Sign out
            </Button>
          </div>
        </section>

        {/* Student Profile Modal */}
        <StudentProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          profile={profile}
          isLoggedIn={true}
          onSaveProfile={updateProfile}
          onSignOut={async () => {
            await signOut();
            setShowProfileModal(false);
            await navigate({ to: "/" });
          }}
          onSelectLevel={changeLearningLevel}
        />
      </main>
    </PublicLayout>
  );
}
