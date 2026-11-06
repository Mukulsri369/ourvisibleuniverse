import assert from 'node:assert/strict';
import { test } from 'node:test';
import { productionConfiguration } from './prepare-production-config.mjs';

const config = { name: 'ovu-supabase-staging', account_id: 'bd0819150e88cf64f97548038790d560',
  main: 'index.js', assets: { directory: '../client' }, compatibility_flags: ['nodejs_compat'],
  workers_dev: true, preview_urls: false, routes: [], triggers: {},
  vars: { SUPABASE_URL: 'https://pdvwkdggyyrfkoqrpbji.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_synthetic',
    PUBLIC_APP_ORIGIN: 'https://ovu-supabase-staging.mukul-srivastava-025.workers.dev', OVU_DEPLOYMENT_STAGE: 'staging',
    RAZORPAY_MODE: 'live', RAZORPAY_LIVE_CHECKOUT_ENABLED: 'true' } };
const ready = Object.fromEntries(['dnsInventoryVerified', 'zoneActive', 'sourceDeltaReconciled',
  'targetBackupVerified', 'sourceWriteDrainVerified', 'productionAuthConfigured'].map(key => [key, true]));

test('promotion retains Worker, assets, existing webhook hostname and Live settings; routes only OVU domains', () => {
  const before = structuredClone(config);
  const promoted = productionConfiguration(config, ready);
  assert.deepEqual(config, before);
  assert.equal(promoted.name, config.name); assert.equal(promoted.account_id, config.account_id);
  assert.deepEqual(promoted.assets, config.assets); assert.equal(promoted.main, config.main);
  assert.equal(promoted.workers_dev, true); assert.equal(promoted.preview_urls, false);
  assert.equal(promoted.vars.PUBLIC_APP_ORIGIN, 'https://ourvisibleuniverse.in');
  assert.equal(promoted.vars.OVU_DEPLOYMENT_STAGE, 'production');
  assert.equal(promoted.vars.RAZORPAY_MODE, 'live');
  assert.equal(promoted.vars.RAZORPAY_LIVE_CHECKOUT_ENABLED, 'true');
  assert.deepEqual(promoted.routes, ['ourvisibleuniverse.in', 'www.ourvisibleuniverse.in'].map(pattern => ({pattern, custom_domain: true})));
});

test('each unverified cutover prerequisite prevents generation', () => {
  assert.throws(() => productionConfiguration(config));
  for (const key of Object.keys(ready)) {
    for (const value of [false, undefined, 'true']) assert.throws(() => productionConfiguration(config, {...ready, [key]: value}));
  }
});

test('promotion rejects wrong destinations, inherited routes/jobs and secret or stale access overrides', () => {
  for (const change of [{name:'other'}, {account_id:'0'.repeat(32)}, {workers_dev:false}, {preview_urls:true},
    {routes:['ourvisibleuniverse.store/*']}, {route:'other/*'}, {triggers:{crons:['* * * * *']}},
    ...[{SUPABASE_URL:'https://other.supabase.co'}, {SUPABASE_PUBLISHABLE_KEY:'sb_secret_synthetic'},
      {RAZORPAY_MODE:'test'}, {RAZORPAY_LIVE_CHECKOUT_ENABLED:'false'}, {OVU_DEPLOYMENT_STAGE:'production'},
      {PUBLIC_APP_ORIGIN:'https://other.example'}, {OVU_ACCESS_ENVIRONMENT:'live'},
      {SUPABASE_SERVICE_ROLE_KEY:'synthetic-forbidden'}].map(vars => ({vars:{...config.vars,...vars}}))]) {
    assert.throws(() => productionConfiguration({...config,...change}, ready));
  }
});

test('domain attachment during drain explicitly holds new checkout; final activation still requires completed drain', () => {
  const draining={...ready,sourceWriteDrainVerified:false,legacyPendingOrdersRegistered:true,approvedRecoveryReconciled:true};
  assert.throws(()=>productionConfiguration(config,draining));
  const held=productionConfiguration(config,draining,{drainOnly:true});
  assert.equal(held.vars.RAZORPAY_MODE,'live');assert.equal(held.vars.RAZORPAY_LIVE_CHECKOUT_ENABLED,'false');
  assert.equal(held.vars.PUBLIC_APP_ORIGIN,'https://ourvisibleuniverse.in');
  assert.equal(held.workers_dev,true);assert.equal(held.routes.length,2);
  assert.equal(productionConfiguration(config,{...draining,sourceWriteDrainVerified:true}).vars.RAZORPAY_LIVE_CHECKOUT_ENABLED,'true');
  for(const key of ['dnsInventoryVerified','zoneActive','sourceDeltaReconciled','targetBackupVerified','productionAuthConfigured','legacyPendingOrdersRegistered','approvedRecoveryReconciled'])
    assert.throws(()=>productionConfiguration(config,{...draining,[key]:false},{drainOnly:true}));
});
