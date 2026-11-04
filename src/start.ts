import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { assertWebsiteSession } from "@/integrations/supabase/website-session";

// Covers custom Academy/certificate functions as well as those using auth middleware.
// Anonymous public/practice functions remain available; a supplied token must be valid.
const websiteSessionBoundary = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { getRequest, setResponseStatus } = await import("@tanstack/react-start/server");
  const authorization = getRequest()?.headers.get("authorization");
  if (authorization) {
    const match = /^Bearer ([^\s,]+)$/.exec(authorization);
    if (!match) { setResponseStatus(401); throw Object.assign(new Error("Invalid authentication"), { statusCode: 401 }); }
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase.auth.getClaims(match[1]);
    if (error || !data?.claims?.sub) { setResponseStatus(401); throw Object.assign(new Error("Invalid authentication"), { statusCode: 401 }); }
    try { assertWebsiteSession(data.claims); }
    catch (error) { setResponseStatus(403); throw error; }
  }
  return next();
});

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth, websiteSessionBoundary],
  requestMiddleware: [errorMiddleware],
}));
