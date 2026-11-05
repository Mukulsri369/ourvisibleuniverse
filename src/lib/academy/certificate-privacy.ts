export interface CertificatePrivacyProfile {
  profile_visibility?: string; age_bracket?: string; guardian_consent_status?: string;
}

export function permitsPublicCertificateIdentity(profile: CertificatePrivacyProfile | null | undefined) {
  if (profile?.profile_visibility !== "public") return false;
  return profile.age_bracket === "18_plus" ||
    (["under_13", "13_to_17"].includes(profile.age_bracket ?? "") && profile.guardian_consent_status === "guardian_consented");
}

export function assertCertificateExportAccess(input: {
  ownerId: string; requesterId?: string; administrator?: boolean; publicIdentity: boolean; active: boolean;
}) {
  if (input.requesterId === input.ownerId || input.administrator) return;
  if (input.active && input.publicIdentity) return;
  throw Object.assign(new Error("This certificate download is private. Sign in to its owning account."), { statusCode: 403 });
}
