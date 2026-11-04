/** Certificate signing must never fall back to a public source-code constant. */
export function requireCertificateSigningSecret() {
  const secret = process.env.CERTIFICATE_SIGNING_SECRET;
  if (!secret || secret.length < 32) throw new Error("A private CERTIFICATE_SIGNING_SECRET of at least 32 characters is required");
  return secret;
}
