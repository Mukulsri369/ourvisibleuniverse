/** Compare raw provider Unix seconds with explicit-offset ISO timestamps only. */
export function paymentTimeRelation(createdSeconds, sourceCapturedAt, webhookCreatedAt) {
  if (!Number.isSafeInteger(createdSeconds) || createdSeconds < 946684800 || createdSeconds > 4102444800)
    throw new Error('Expected provider Unix seconds, not milliseconds');
  const parse = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value)))
      throw new Error('Use an explicit-offset ISO timestamp; locale coercion is unsafe');
    return Date.parse(value);
  };
  const createdMs = createdSeconds * 1000;
  return {createdAfterSourceSnapshot: createdMs > parse(sourceCapturedAt),
    createdAfterWebhookSetup: createdMs > parse(webhookCreatedAt)};
}
