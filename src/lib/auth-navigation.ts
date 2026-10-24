import { oauthReturnPath } from "./oauth-return-path";

/** Keep navigation local, including destinations restored from browser storage. */
export function authDestination(next: unknown, saved: unknown, studentFlow: boolean): string {
  for (const candidate of [next, saved]) {
    const path = oauthReturnPath(candidate);
    if (path !== "/") return path;
  }
  return studentFlow ? "/learn" : "/universe";
}

/** Carry the destination through full-page OAuth, not only the current tab's storage. */
export function googleAuthCallback(origin: string, destination: string): string {
  const callback = new URL("/auth", origin);
  callback.searchParams.set("next", authDestination(destination, undefined, false));
  return callback.href;
}

export function readAuthNext(): string | null {
  try {
    return sessionStorage.getItem("auth_next");
  } catch {
    return null;
  }
}

export function saveAuthNext(destination: string): void {
  try {
    sessionStorage.setItem("auth_next", destination);
  } catch {
    /* Callback carries it too. */
  }
}

export function clearAuthNext(): void {
  try {
    sessionStorage.removeItem("auth_next");
  } catch {
    /* Storage can be blocked. */
  }
}
