import { identity } from "@/lib/auth-client";
import { AccessHistoryDialog } from "./AccessHistoryDialog";
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  getSubscriptionAdminStatus,
  listSubscribers,
  grantSubscriberAccess,
  type SubscriberPage,
} from "@/lib/subscription-admin.functions";
const date = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
export function SubscriptionAdmin() {
  const [historyTarget, setHistoryTarget] = useState<{ userId: string; email: string } | null>(
    null,
  );
  const { data: identitySession, isPending: identityPending } = identity.useSession();
  const [permission, setPermission] = useState<
    "loading" | "allowed" | "denied" | "setup" | "error"
  >("loading");
  const [environment, setEnvironment] = useState<"live" | "sandbox">("live"),
    [search, setSearch] = useState(""),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState<"all" | "active" | "expired" | "refunded" | "failed">("all"),
    [page, setPage] = useState(0),
    [revision, setRevision] = useState(0);
  const [data, setData] = useState<SubscriberPage | null>(null),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const [email, setEmail] = useState(""),
    [days, setDays] = useState<30 | 180 | 365>(30),
    [reason, setReason] = useState(""),
    [busy, setBusy] = useState(false),
    [grantError, setGrantError] = useState(""),
    [success, setSuccess] = useState("");
  const request = useRef<{ fingerprint: string; id: string } | null>(null),
    submitting = useRef(false),
    emailInput = useRef<HTMLInputElement>(null);
  const sessionEpoch = useRef(0),
    environmentInitialized = useRef(false);
  useEffect(() => {
    if (identityPending) return;
    sessionEpoch.current++;
    setPermission(identitySession?.user.emailVerified ? "loading" : "denied");
    setData(null);
    setRevision((n) => n + 1);
  }, [identitySession?.user.id, identitySession?.user.emailVerified, identityPending]);
  useEffect(() => {
    let alive = true;
    const epoch = sessionEpoch.current;
    getSubscriptionAdminStatus()
      .then((r) => {
        if (alive && sessionEpoch.current === epoch) {
          if (!environmentInitialized.current) {
            setEnvironment(r.environment ?? "live");
            environmentInitialized.current = true;
          }
          setPermission(r.setupRequired ? "setup" : r.isAdmin ? "allowed" : "denied");
        }
      })
      .catch(() => {
        if (alive && sessionEpoch.current === epoch) setPermission("error");
      });
    return () => {
      alive = false;
    };
  }, [revision]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    if (permission !== "allowed") return;
    let alive = true;
    setLoading(true);
    setError("");
    listSubscribers({ data: { environment, search: query, status, page } })
      .then((r) => {
        if (alive) setData(r);
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e.message : "Unable to load subscribers");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [permission, environment, query, status, page, revision]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setGrantError("");
    setSuccess("");
    const body = { email: email.trim(), days, environment, reason: reason.trim() };
    const fingerprint = JSON.stringify(body);
    if (request.current?.fingerprint !== fingerprint)
      request.current = { fingerprint, id: crypto.randomUUID() };
    try {
      const r = await grantSubscriberAccess({ data: { ...body, requestId: request.current.id } });
      setSuccess(body.email + " has access until " + date(r.expiresAt) + ".");
      request.current = null;
      setRevision((n) => n + 1);
    } catch (e) {
      setGrantError(e instanceof Error ? e.message : "Unable to grant access");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  return (
    <main
      className="mx-auto max-w-7xl px-5 pb-20 pt-32 text-white sm:px-8"
      data-ui="subscription-admin"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-400">Our Visible Universe / Administration</p>
          <h1 className="mt-2 text-2xl font-medium">Subscribers</h1>
          <p className="mt-2 text-sm text-neutral-400">Manage access to the 3D atlas.</p>
        </div>
        <Link
          to="/account"
          className="min-h-11 rounded-lg bg-neutral-900 px-4 py-3 text-sm hover:bg-neutral-800"
        >
          Back to account
        </Link>
      </div>
      {permission !== "allowed" ? (
        <section className="mt-8 rounded-xl bg-neutral-900 p-6">
          <h2 className="text-base font-medium">
            {permission === "loading"
              ? "Verifying administrator access…"
              : permission === "setup"
                ? "Database setup required"
                : permission === "error"
                  ? "Unable to verify access"
                  : "Administrator access required"}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">
            {permission === "setup"
              ? "Administrator access has not been configured for this account. Ask the owner to assign access."
              : permission === "denied"
                ? "Sign in with the verified administrator account to view subscribers."
                : permission === "error"
                  ? "Your session or connection could not be verified. Retry or sign in again."
                  : "Subscriber data stays private until your account is verified."}
          </p>
          {permission !== "loading" && (
            <div className="mt-4 flex gap-3">
              <Link
                to="/auth"
                search={{ next: "/admin/subscribers", role: undefined }}
                className="min-h-11 rounded-lg bg-white px-4 py-3 text-sm text-black"
              >
                Sign in
              </Link>
              {permission === "error" && (
                <button onClick={() => setRevision((n) => n + 1)} className="min-h-11 px-4 text-sm">
                  Retry
                </button>
              )}
            </div>
          )}
        </section>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap gap-x-12 gap-y-5 rounded-xl bg-neutral-900 p-5">
            <div>
              <p className="text-sm text-neutral-400">Subscribers · {environment}</p>
              <p className="mt-1 text-3xl tabular-nums">{data?.subscribers ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-400">With active access</p>
              <p className="mt-1 text-3xl tabular-nums">{data?.active ?? "—"}</p>
            </div>
            <label className="ml-auto text-sm text-neutral-400">
              Environment
              <select
                aria-label="Subscription environment"
                className="mt-2 block min-h-11 rounded-lg bg-neutral-800 px-3 text-white"
                value={environment}
                onChange={(e) => {
                  setEnvironment(e.target.value as "live" | "sandbox");
                  setPage(0);
                  setData(null);
                }}
              >
                <option value="live">Live</option>
                <option value="sandbox">Sandbox</option>
              </select>
            </label>
          </div>
          <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">
            <section aria-label="Subscriber list" className="min-w-0">
              <div className="flex flex-wrap gap-3">
                <input
                  aria-label="Search subscribers"
                  type="search"
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="min-h-11 min-w-0 flex-1 rounded-lg bg-neutral-900 px-4 text-sm focus-visible:outline focus-visible:outline-white"
                />
                <select
                  aria-label="Access status"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as typeof status);
                    setPage(0);
                  }}
                  className="min-h-11 rounded-lg bg-neutral-900 px-3 text-sm"
                >
                  {["all", "active", "expired", "refunded", "failed"].map((s) => (
                    <option key={s} value={s}>
                      {s === "all" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setRevision((n) => n + 1)}
                  className="min-h-11 rounded-lg bg-neutral-900 px-4 text-sm"
                  disabled={loading}
                >
                  {loading ? "Refreshing…" : "Refresh"}
                </button>
              </div>
              {error && (
                <p role="alert" className="mt-4 text-sm text-red-300">
                  {error}
                </p>
              )}
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[580px] text-left text-sm text-neutral-200">
                  <thead className="text-neutral-400">
                    <tr>
                      <th className="pb-3 font-normal">Subscriber</th>
                      <th className="pb-3 font-normal">Access</th>
                      <th className="pb-3 text-right font-normal">Expires</th>
                      <th className="pb-3 pl-5 font-normal">Source</th>
                      <th className="pb-3 font-normal">
                        <span className="sr-only">Action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.users.map((user) => (
                      <tr key={user.user_id} className="border-t border-neutral-800">
                        <td className="py-4 pr-4">
                          <span className="block font-medium">{user.name || user.email}</span>
                          {user.name && (
                            <span className="mt-1 block text-xs text-neutral-400">
                              {user.email}
                            </span>
                          )}
                        </td>
                        <td className="py-4 pr-3">
                          <span
                            className={user.has_access ? "text-emerald-300" : "text-neutral-400"}
                          >
                            {user.has_access ? "Active" : user.status}
                          </span>
                          <span className="mt-1 block text-xs text-neutral-500">
                            {user.access_days} days
                          </span>
                        </td>
                        <td className="py-4 text-right tabular-nums whitespace-nowrap">
                          {date(user.expires_at)}
                        </td>
                        <td className="py-4 pl-5 text-neutral-400">{user.source}</td>
                        <td className="py-4 pl-3">
                          <button
                            className="min-h-11 px-2 text-sm underline underline-offset-4"
                            onClick={() =>
                              setHistoryTarget({ userId: user.user_id, email: user.email })
                            }
                          >
                            History and access
                          </button>
                          <button
                            className="min-h-11 px-2 text-sm underline underline-offset-4"
                            onClick={() => {
                              setEmail(user.email);
                              emailInput.current?.focus();
                            }}
                          >
                            Extend
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!data && loading && (
                <p role="status" className="py-8 text-sm text-neutral-400">
                  Loading subscribers…
                </p>
              )}
              {data && !data.users.length && (
                <p className="py-10 text-center text-sm text-neutral-400">
                  No subscribers match this view.
                </p>
              )}
              <div className="mt-4 flex items-center justify-between gap-4 text-sm text-neutral-400">
                <span>{data ? data.total + " matching subscribers" : ""}</span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 0 || loading}
                    onClick={() => setPage((n) => n - 1)}
                    className="min-h-11 px-3 disabled:opacity-30"
                  >
                    Previous
                  </button>
                  <button
                    disabled={!data || (page + 1) * 50 >= data.total || loading}
                    onClick={() => setPage((n) => n + 1)}
                    className="min-h-11 px-3 disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
            <section className="rounded-xl bg-neutral-900 p-5" aria-label="Grant access">
              <h2 className="text-lg font-medium">Grant access</h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                Add or extend access for a user who has already signed in. Existing time is
                preserved.
              </p>
              <form onSubmit={submit} className="mt-5 space-y-4">
                <label className="block text-sm text-neutral-300">
                  Email
                  <input
                    ref={emailInput}
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 min-h-11 w-full rounded-lg bg-neutral-800 px-3 text-white"
                  />
                </label>
                <label className="block text-sm text-neutral-300">
                  Duration
                  <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value) as 30 | 180 | 365)}
                    className="mt-2 min-h-11 w-full rounded-lg bg-neutral-800 px-3 text-white"
                  >
                    {[30, 180, 365].map((n) => (
                      <option key={n} value={n}>
                        {n} days
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm text-neutral-300">
                  Reason
                  <textarea
                    required
                    minLength={3}
                    maxLength={500}
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-2 w-full resize-y rounded-lg bg-neutral-800 p-3 text-white"
                  />
                </label>
                <p className="text-xs text-neutral-400">
                  This records an admin grant, not a payment. Environment: {environment}.
                </p>
                <button
                  disabled={busy}
                  type="submit"
                  className="min-h-11 w-full rounded-lg bg-white px-4 text-sm font-medium text-black disabled:opacity-50"
                >
                  {busy ? "Granting access…" : "Grant " + days + " days"}
                </button>
                {grantError && (
                  <p role="alert" className="text-sm text-red-300">
                    {grantError}
                  </p>
                )}
                {success && (
                  <p role="status" className="text-sm text-emerald-300">
                    {success}
                  </p>
                )}
              </form>
            </section>
          </div>
        </>
      )}
      {permission === "allowed" && historyTarget && (
        <AccessHistoryDialog
          user={historyTarget}
          environment={environment}
          onClose={() => setHistoryTarget(null)}
          onChanged={() => setRevision((n) => n + 1)}
        />
      )}
    </main>
  );
}
