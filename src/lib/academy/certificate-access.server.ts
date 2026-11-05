import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertCertificateExportAccess, permitsPublicCertificateIdentity } from "./certificate-privacy";
import { certificateHashMatches } from "./certificate-integrity.server";
import type { SupabaseClient } from "@supabase/supabase-js";
// The legacy generated Database type contains only access_passes. Keep the
// additive Academy boundary local until its full schema types are regenerated.
const db = supabaseAdmin as unknown as SupabaseClient;

/** Caller identity/token come from the verified website request, never its body. */
export async function certificateForExport(number: string, requesterId?: string, token?: string) {
  const { data: row, error } = await db.from("academy_certificates").select("*")
    .eq("certificate_number", number.trim().toUpperCase()).maybeSingle();
  if (error || !row) throw new Error("Certificate not found or registry unavailable.");
  let administrator = false;
  if (requesterId && requesterId !== row.user_id && token) {
    const { verifyAdminAuthorizationServer } = await import("./certificate.server");
    try { administrator = (await verifyAdminAuthorizationServer(token)).authorized; }
    catch { /* A regular website session does not grant administrator export. */ }
  }
  let publicIdentity = false;
  if (requesterId !== row.user_id && !administrator) {
    const profile = await db.from("student_profiles")
      .select("profile_visibility,age_bracket,guardian_consent_status").eq("user_id", row.user_id).maybeSingle();
    publicIdentity = !profile.error && permitsPublicCertificateIdentity(profile.data);
  }
  assertCertificateExportAccess({ ownerId: row.user_id, requesterId, administrator, publicIdentity, active: row.status === "active" });
  if (!certificateHashMatches(row)) throw new Error("Certificate integrity verification failed.");
  return row;
}
