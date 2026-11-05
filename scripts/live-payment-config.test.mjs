import assert from 'node:assert/strict';
import { test } from 'node:test';
import { livePaymentConfiguration,livePaymentSecretPayload } from './prepare-live-payment-config.mjs';
const initial={name:'ovu-supabase-staging',account_id:'bd0819150e88cf64f97548038790d560',workers_dev:true,preview_urls:false,routes:[],triggers:{},
 vars:{SUPABASE_URL:'https://pdvwkdggyyrfkoqrpbji.supabase.co',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_synthetic',
 PUBLIC_APP_ORIGIN:'https://ovu-supabase-staging.mukul-srivastava-025.workers.dev',OVU_DEPLOYMENT_STAGE:'staging',RAZORPAY_MODE:'test',OVU_ACCESS_ENVIRONMENT:'live'}};
const environment={RAZORPAY_LIVE_KEY_ID:'rzp_live_SyntheticOnly',RAZORPAY_LIVE_KEY_SECRET:'synthetic-api-secret-used-for-tests',
 RAZORPAY_LIVE_WEBHOOK_SECRET:'synthetic-separate-webhook-secret-for-tests',SUPABASE_SERVICE_ROLE_KEY:'forbidden-extra-value'};
test('local Live configuration removes historical-read exception without changing account, routes or limits',()=>{
 const config=livePaymentConfiguration(initial);assert.equal(config.vars.RAZORPAY_MODE,'live');assert.ok(!('OVU_ACCESS_ENVIRONMENT'in config.vars));
 assert.equal(initial.vars.RAZORPAY_MODE,'test');assert.equal(initial.vars.OVU_ACCESS_ENVIRONMENT,'live');
 assert.deepEqual({...config,vars:initial.vars},initial);assert.deepEqual(Object.keys(livePaymentSecretPayload(config,environment)).sort(),
 ['RAZORPAY_LIVE_KEY_ID','RAZORPAY_LIVE_KEY_SECRET','RAZORPAY_LIVE_WEBHOOK_SECRET']);
});
test('wrong destinations, production routes, jobs and private/public configuration confusion fail closed',()=>{
 for(const config of [{...initial,name:'production'},{...initial,account_id:'0'.repeat(32)},{...initial,routes:['ourvisibleuniverse.in/*']},
 {...initial,triggers:{crons:['* * * * *']}},{...initial,vars:{...initial.vars,SUPABASE_URL:'https://wrong.supabase.co'}},
 {...initial,vars:{...initial.vars,PUBLIC_APP_ORIGIN:'https://ourvisibleuniverse.in'}},{...initial,vars:{...initial.vars,OVU_DEPLOYMENT_STAGE:'production'}},
 {...initial,vars:{...initial.vars,RAZORPAY_LIVE_KEY_SECRET:'forbidden'}}])assert.throws(()=>livePaymentConfiguration(config));
});
test('Live payload refuses Test keys, missing secrets, shared webhook secrets and historical-read overrides',()=>{
 const config=livePaymentConfiguration(initial);
 assert.throws(()=>livePaymentSecretPayload(initial,environment));
 assert.throws(()=>livePaymentSecretPayload({...config,vars:{...config.vars,OVU_ACCESS_ENVIRONMENT:'live'}},environment));
 for(const value of [{...environment,RAZORPAY_LIVE_KEY_ID:'rzp_test_Synthetic'},
 {...environment,RAZORPAY_LIVE_KEY_SECRET:undefined},{...environment,RAZORPAY_LIVE_WEBHOOK_SECRET:'short'},
 {...environment,RAZORPAY_LIVE_WEBHOOK_SECRET:environment.RAZORPAY_LIVE_KEY_SECRET}]) assert.throws(()=>livePaymentSecretPayload(config,value));
});
