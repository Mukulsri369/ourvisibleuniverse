/** A staging entitlement read override never changes checkout/webhook payment mode. */
export function getAccessEnvironment(
  env: Record<string, string | undefined> = process.env,
): "live" | "sandbox" {
  const override = env.OVU_ACCESS_ENVIRONMENT;
  if (override !== undefined) {
    if (
      override !== "live" ||
      env.OVU_DEPLOYMENT_STAGE !== "staging" ||
      env.PUBLIC_APP_ORIGIN !== "https://ovu-supabase-staging.mukul-srivastava-025.workers.dev" ||
      env.SUPABASE_URL !== "https://pdvwkdggyyrfkoqrpbji.supabase.co" ||
      env.RAZORPAY_MODE !== "test"
    ) {
      throw new Error(
        "Imported live-access reads require the exact approved staging configuration",
      );
    }
    return "live";
  }
  return env.RAZORPAY_MODE === "live" ? "live" : "sandbox";
}
