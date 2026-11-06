import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const account = 'bd0819150e88cf64f97548038790d560';
const project = 'https://pdvwkdggyyrfkoqrpbji.supabase.co';
const publicVariables = ['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'PUBLIC_APP_ORIGIN',
  'OVU_DEPLOYMENT_STAGE', 'RAZORPAY_MODE', 'RAZORPAY_LIVE_CHECKOUT_ENABLED'];

/** Local preparation only. Keep the existing Worker/secrets and signed webhook URL. */
export function productionConfiguration(config, readiness, { drainOnly = false } = {}) {
  if (config.name !== 'ovu-supabase-staging' || config.account_id !== account ||
      config.vars?.SUPABASE_URL !== project || config.vars?.OVU_DEPLOYMENT_STAGE !== 'staging' ||
      config.vars?.PUBLIC_APP_ORIGIN !== 'https://ovu-supabase-staging.mukul-srivastava-025.workers.dev' ||
      config.workers_dev !== true || config.preview_urls !== false || config.route || config.routes?.length ||
      Object.keys(config.triggers ?? {}).length || Object.keys(config.vars).some(key => !publicVariables.includes(key)) ||
      !config.vars.SUPABASE_PUBLISHABLE_KEY?.startsWith('sb_publishable_') ||
      config.vars.RAZORPAY_MODE !== 'live' || config.vars.RAZORPAY_LIVE_CHECKOUT_ENABLED !== 'true') {
    throw new Error('Only the verified Live staging configuration can be promoted');
  }
  if (typeof drainOnly !== 'boolean') throw new Error('Explicit cutover phase required');
  for (const check of ['dnsInventoryVerified', 'zoneActive', 'sourceDeltaReconciled',
    'targetBackupVerified', 'productionAuthConfigured',
    ...(drainOnly ? ['legacyPendingOrdersRegistered', 'approvedRecoveryReconciled'] : ['sourceWriteDrainVerified'])]) {
    if (readiness?.[check] !== true) throw new Error(`Production prerequisite not verified: ${check}`);
  }
  return { ...config, routes: [
    { pattern: 'ourvisibleuniverse.in', custom_domain: true },
    { pattern: 'www.ourvisibleuniverse.in', custom_domain: true },
  ], vars: { ...config.vars, PUBLIC_APP_ORIGIN: 'https://ourvisibleuniverse.in', OVU_DEPLOYMENT_STAGE: 'production',
    RAZORPAY_LIVE_CHECKOUT_ENABLED: drainOnly ? 'false' : 'true' } };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (!process.argv.includes('--prepare-only') || !process.argv.includes('--readiness-file')) {
    throw new Error('Use --prepare-only --readiness-file <reviewed evidence JSON>; this utility never deploys');
  }
  const root = resolve(import.meta.dirname, '../dist/server');
  const readiness = JSON.parse(await readFile(resolve(process.argv[process.argv.indexOf('--readiness-file') + 1]), 'utf8'));
  const config = productionConfiguration(JSON.parse(await readFile(resolve(root, 'wrangler.staging-live.json'), 'utf8')), readiness,
    { drainOnly: process.argv.includes('--drain-only') });
  await writeFile(resolve(root, 'wrangler.production.json'), JSON.stringify(config, null, 2));
  console.log('Prepared production configuration locally; no DNS, authentication, data or deployment changed.');
}
