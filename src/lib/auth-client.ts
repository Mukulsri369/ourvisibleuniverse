import { createAuthClient } from "better-auth/react";

/** Same-origin HttpOnly sessions. Never store bearer tokens in browser storage. */
export const identity = createAuthClient({ fetchOptions: { credentials: "include" } });
export type IdentityUser = NonNullable<typeof identity.$Infer.Session>["user"];
