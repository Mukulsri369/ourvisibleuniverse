import { boundedRequestBody as boundedBody, RequestBodyError } from "./request-body.server";
import { z } from "zod";
import type { createIndependentAuth } from "./auth.server";
import { independentAuth } from "./runtime.server";
import { database } from "./db.server";
import { adminChangeAccess, getAccess } from "./access.server";
import { requireAdmin, type Principal } from "./authorization.server";
import { paymentService, PaymentRequestError } from "./payments.server";
import { isPlanId } from "../lib/plans";
import { getStudentProfile, updateStudentProfile, syncGuestProgress } from "./student.server";

import { getLessonProgress, saveLessonProgress } from "./academy-progress.server";

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const changeAccess = z
  .object({
    requestId: z.string().uuid(),
    userId: z.string().uuid(),
    environment: z.enum(["sandbox", "live"]),
    action: z.enum(["grant", "revoke", "set_expiry"]),
    reason: z.string().trim().min(3).max(500),
    days: z.union([z.literal(30), z.literal(180), z.literal(365)]).optional(),
    passId: z.string().uuid().optional(),
    expiresAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

function response(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" },
  });
}

/** Cookie sessions remain on the server. No arbitrary query language or user-supplied SQL. */
export function createBackendHandler(auth: ReturnType<typeof createIndependentAuth>) {
  const payments = paymentService();
  return async function handle(request: Request): Promise<Response | null> {
    const url = new URL(request.url),
      path = url.pathname;
    if (!path.startsWith("/api/auth/") && !path.startsWith("/api/backend/")) return null;
    try {
      if (!["GET", "POST"].includes(request.method)) throw new HttpError(405, "Method not allowed");
      if (path === "/api/backend/payments/webhook" && request.method === "POST") {
        const mode = z.enum(["test", "live"]).parse(url.searchParams.get("mode"));
        await payments.webhook(
          await boundedBody(request, 256 * 1024),
          request.headers.get("x-razorpay-signature") ?? "",
          request.headers.get("x-razorpay-event-id") ?? "",
          mode,
        );
        return response({ received: true });
      }
      if (path.startsWith("/api/auth/")) {
        if (request.method === "POST") {
          const body = await boundedBody(request);
          request = new Request(request.url, {
            method: "POST",
            headers: request.headers,
            body,
            signal: request.signal,
          });
        }
        const result = await auth.handler(request);
        result.headers.set("cache-control", "no-store");
        return result;
      }
      if (request.method === "POST") {
        if (request.headers.get("origin") !== new URL(process.env.BETTER_AUTH_URL!).origin)
          throw new HttpError(403, "Invalid request origin");
        if (request.headers.get("content-type")?.split(";")[0] !== "application/json")
          throw new HttpError(415, "JSON required");
      }
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session) throw new HttpError(401, "Sign in required");
      if (!session.user.emailVerified) throw new HttpError(403, "Verified email required");
      const principal: Principal = session.user;
      if (path === "/api/backend/student/profile") {
        return response(
          request.method === "GET"
            ? await getStudentProfile(principal)
            : await updateStudentProfile(principal, JSON.parse(await boundedBody(request))),
        );
      }
      if (path === "/api/backend/student/progress" && request.method === "POST")
        return response(await syncGuestProgress(principal, JSON.parse(await boundedBody(request))));
      if (path === "/api/backend/academy/lessons")
        return response(
          request.method === "GET"
            ? await getLessonProgress(principal)
            : await saveLessonProgress(principal, JSON.parse(await boundedBody(request))),
        );
      if (path === "/api/backend/me" && request.method === "GET") {
        const [roles]: any = await database().execute(
          "SELECT role FROM app_roles WHERE user_id=?",
          [principal.id],
        );
        return response({
          user: { id: principal.id, email: principal.email, name: session.user.name },
          roles: roles.map((r: any) => r.role),
        });
      }
      if (path === "/api/backend/access" && request.method === "GET") {
        const environment = process.env.RAZORPAY_MODE === "live" ? "live" : "sandbox";
        return response({ access: await getAccess(principal.id, environment), environment });
      }
      if (path === "/api/backend/payments/checkout" && request.method === "POST") {
        const input = z
          .object({ planId: z.string(), currency: z.enum(["INR", "USD"]) })
          .strict()
          .parse(JSON.parse(await boundedBody(request)));
        if (!isPlanId(input.planId)) throw new HttpError(400, "Invalid plan");
        return response(await payments.checkout(principal.id, input.planId, input.currency));
      }
      if (path === "/api/backend/payments/confirm" && request.method === "POST") {
        const input = z
          .object({
            orderId: z.string().max(100),
            paymentId: z.string().max(100),
            signature: z.string().regex(/^[a-fA-F0-9]{64}$/),
          })
          .strict()
          .parse(JSON.parse(await boundedBody(request)));
        return response(await payments.confirm(principal.id, input));
      }
      if (path === "/api/backend/payments/recover" && request.method === "POST") {
        const input = z
          .object({ orderId: z.string().max(100) })
          .strict()
          .parse(JSON.parse(await boundedBody(request)));
        return response(await payments.recover(principal.id, input.orderId));
      }
      if (path.startsWith("/api/backend/admin/")) {
        try {
          await requireAdmin(principal);
        } catch {
          throw new HttpError(403, "Administrator access required");
        }
        if (path === "/api/backend/admin/users" && request.method === "GET") {
          const search = (url.searchParams.get("search") ?? "").trim();
          if (search.length > 200) throw new HttpError(400, "Search too long");
          // Locate accounts without returning password hashes, sessions or OAuth tokens.
          const [users]: any = await database().execute(
            `SELECT id,name,email,emailVerified,createdAt FROM auth_user
            WHERE INSTR(LOWER(email),LOWER(?))>0 OR INSTR(LOWER(name),LOWER(?))>0 ORDER BY createdAt DESC,id LIMIT 100`,
            [search, search],
          );
          return response({ users });
        }
        if (path === "/api/backend/admin/history" && request.method === "GET") {
          const userId = z.string().uuid().parse(url.searchParams.get("userId"));
          const [passes] = await database().execute(
            "SELECT id,environment,price_id,access_days,status,starts_at,expires_at,original_expires_at,expiry_is_fixed FROM access_passes WHERE user_id=? ORDER BY created_at DESC LIMIT 200",
            [userId],
          );
          const [payments] = await database().execute(
            "SELECT environment,payment_id,order_id,amount_minor,currency,refunded_minor,state,refund_unused_microseconds,refund_rebased_at,created_at FROM payment_transactions WHERE user_id=? ORDER BY created_at DESC LIMIT 200",
            [userId],
          );
          const [changes] = await database().execute(
            "SELECT a.request_id,a.actor_id,u.name AS actor_name,a.environment,a.action,a.reason,a.result,a.created_at FROM admin_access_changes a JOIN auth_user u ON u.id=a.actor_id WHERE a.user_id=? ORDER BY a.created_at DESC LIMIT 200",
            [userId],
          );
          const [refundAdjustments] = await database().execute(
            "SELECT environment,payment_id,pass_id,previous_expiry,updated_expiry,removed_microseconds,created_at FROM entitlement_refund_adjustments WHERE user_id=? ORDER BY created_at DESC LIMIT 200",
            [userId],
          );
          return response({ passes, payments, changes, refundAdjustments });
        }
        if (path === "/api/backend/admin/access" && request.method === "POST") {
          const input = changeAccess.parse(JSON.parse(await boundedBody(request)));
          return response(await adminChangeAccess(principal, input));
        }
      }
      throw new HttpError(404, "Endpoint not found");
    } catch (error) {
      if (
        error instanceof HttpError ||
        error instanceof RequestBodyError ||
        error instanceof PaymentRequestError
      )
        return response({ error: error.message }, error.status);
      if (error instanceof z.ZodError || error instanceof SyntaxError)
        return response({ error: "Invalid request" }, 400);
      // SQL/provider errors can contain private values. Never serialize or log them here.
      return response({ error: "Request could not be completed" }, 500);
    }
  };
}

let handler: ReturnType<typeof createBackendHandler> | undefined;
export function handleIndependentRequest(request: Request) {
  return (handler ??= createBackendHandler(independentAuth()))(request);
}
