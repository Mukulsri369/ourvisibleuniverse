type VerifiedUser = {
  id: string;
  email?: string;
  email_confirmed_at?: string;
  app_metadata?: Record<string, unknown>;
};

/** Call only with an identity returned by Supabase's verified server-side user lookup. */
export function isConfiguredCertificateAdmin(user: VerifiedUser, config: { emails?: string; userIds?: string }) {
  if (!user.id) return false;
  const role = user.app_metadata?.role;
  const ids = (config.userIds ?? "").split(",").map(id => id.trim()).filter(Boolean);
  const emails = (config.emails ?? "").split(",").map(email => email.trim().toLowerCase()).filter(Boolean);
  return role === "admin" || role === "service_role" || ids.includes(user.id) ||
    Boolean(user.email_confirmed_at && user.email && emails.includes(user.email.toLowerCase()));
}
