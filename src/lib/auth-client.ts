import { anonymousClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/** Same-origin HttpOnly sessions. Never store bearer tokens in browser storage. */
export const identity = createAuthClient({
  plugins: [anonymousClient()],
  fetchOptions: { credentials: "include" },
});
export type IdentityUser = NonNullable<typeof identity.$Infer.Session>["user"];

let practiceSession: Promise<void> | undefined;
export async function ensurePracticeSession() {
  return (practiceSession ??= (async () => {
    const session = await identity.getSession();
    if (session.data?.user) return;
    const result = await identity.signIn.anonymous();
    if (result.error) throw new Error("Could not start private practice session");
  })().finally(() => {
    practiceSession = undefined;
  }));
}
