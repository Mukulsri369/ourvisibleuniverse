export type AdminAccessHistory = {
  passes: Array<{
    id: string;
    environment: "sandbox" | "live";
    price_id: string;
    access_days: number;
    status: string;
    starts_at: string;
    expires_at: string;
    original_expires_at: string | null;
    expiry_is_fixed: boolean | number;
  }>;
  payments: Array<{
    environment: "sandbox" | "live";
    payment_id: string;
    order_id: string;
    amount_minor: string | number;
    currency: string;
    refunded_minor: string | number;
    state: string;
    refund_unused_microseconds: string | number;
    created_at: string;
  }>;
  changes: Array<{
    request_id: string;
    actor_name: string;
    environment: "sandbox" | "live";
    action: string;
    reason: string;
    created_at: string;
  }>;
  refundAdjustments: Array<{
    environment: "sandbox" | "live";
    payment_id: string;
    pass_id: string;
    previous_expiry: string;
    updated_expiry: string;
    removed_microseconds: string | number;
    created_at: string;
  }>;
};

async function result<T>(response: Response): Promise<T> {
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "Please sign in again."
        : response.status === 403
          ? "Administrator access required."
          : "The request could not be completed. You can retry safely.",
    );
  return response.json();
}
export async function accessHistory(userId: string, signal?: AbortSignal) {
  return result<AdminAccessHistory>(
    await fetch("/api/backend/admin/history?" + new URLSearchParams({ userId }), {
      credentials: "same-origin",
      cache: "no-store",
      signal,
    }),
  );
}
export async function changeUserAccess(input: {
  requestId: string;
  userId: string;
  environment: "sandbox" | "live";
  action: "revoke" | "set_expiry";
  passId: string;
  reason: string;
  expiresAt?: string;
}) {
  return result<{ passId: string; expiresAt: string }>(
    await fetch("/api/backend/admin/access", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}
