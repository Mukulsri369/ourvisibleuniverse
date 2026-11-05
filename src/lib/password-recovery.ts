import type { SupabaseClient } from "@supabase/supabase-js";

type Auth = SupabaseClient["auth"];
export function passwordRecoveryCallback(origin: string): string {
  return new URL("/auth-reset", origin).href;
}
export function passwordRecoveryError(password: string, confirmation: string): string | null {
  if (password.length < 8) return "Use at least 8 characters.";
  // Supabase uses bcrypt; do not silently accept a truncated UTF-8 password.
  if (new TextEncoder().encode(password).length > 72)
    return "Use a password of at most 72 UTF-8 bytes.";
  if (password !== confirmation) return "The passwords do not match.";
  return null;
}

/** Pin the request to the verified identity, even if another tab changes accounts. */
export async function updateRecoveryPassword(
  source: Auth,
  isolated: Auth,
  expectedId: string,
  password: string,
) {
  const user = await source.getUser();
  if (user.error || user.data.user?.id !== expectedId)
    throw new Error("Your account changed or your link expired. Reopen the recovery link.");
  const current = await source.getSession();
  const session = current.data.session;
  if (current.error || !session || session.user.id !== expectedId)
    throw new Error("Your account changed. Reopen the recovery link.");
  const bound = await isolated.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
  if (bound.error || bound.data.user?.id !== expectedId)
    throw new Error("Your recovery session is no longer valid. Request a new link.");
  const verified = await isolated.getUser();
  if (verified.error || verified.data.user?.id !== expectedId)
    throw new Error("Your recovery session could not be verified. Request a new link.");
  const result = await isolated.updateUser({ password });
  if (result.error) throw result.error;
  if (result.data.user?.id !== expectedId)
    throw new Error("The password update could not be confirmed.");
}
