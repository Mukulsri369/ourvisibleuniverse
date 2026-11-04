import { supabase } from "./client";

/** Use the project's own OAuth configuration and SDK-managed PKCE session. */
export async function signInWithGoogle(redirectTo: string) {
  const result = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  return { error: result.error, redirected: !result.error && Boolean(result.data.url) };
}
