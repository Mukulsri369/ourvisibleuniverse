const token = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;
export function PaymentTestModeBanner() {
  if (!token) return <div className="bg-destructive px-4 py-2 text-center text-sm text-destructive-foreground">Production payments are not configured yet.</div>;
  if (!token.startsWith("pk_test_")) return null;
  return <div className="bg-warning px-4 py-2 text-center text-sm text-warning-foreground">Payments are in test mode. No real charge will be made.</div>;
}