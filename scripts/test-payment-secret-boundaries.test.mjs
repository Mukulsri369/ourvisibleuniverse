import assert from "node:assert/strict";
import { test } from "node:test";
import { testPaymentSecretPayload } from "./configure-test-payment-secrets.mjs";
const config={name:"ovu-supabase-staging",account_id:"bd0819150e88cf64f97548038790d560",workers_dev:true,preview_urls:false,routes:[],vars:{PUBLIC_APP_ORIGIN:"https://ovu-supabase-staging.mukul-srivastava-025.workers.dev",SUPABASE_URL:"https://pdvwkdggyyrfkoqrpbji.supabase.co",RAZORPAY_MODE:"test"}};
const env={RAZORPAY_TEST_KEY_ID:"rzp_test_synthetic",RAZORPAY_TEST_KEY_SECRET:"synthetic-test-key-secret",RAZORPAY_TEST_WEBHOOK_SECRET:"synthetic-separate-webhook-secret-32-characters",RAZORPAY_LIVE_KEY_SECRET:"synthetic-never-copy",SUPABASE_SERVICE_ROLE_KEY:"synthetic-never-copy"};
test("only the three explicit Test bindings are uploaded",()=>{
 const payload=testPaymentSecretPayload(config,env);
 assert.deepEqual(Object.keys(payload).sort(),["RAZORPAY_TEST_KEY_ID","RAZORPAY_TEST_KEY_SECRET","RAZORPAY_TEST_WEBHOOK_SECRET"].sort());
 assert.equal(payload.RAZORPAY_LIVE_KEY_SECRET,undefined); assert.equal(payload.SUPABASE_SERVICE_ROLE_KEY,undefined);
});
test("wrong worker/account/origin/project/mode and domain/job configuration are refused",()=>{
 for(const change of [{name:"production"},{account_id:"other"},{workers_dev:false},{preview_urls:true},{routes:["ourvisibleuniverse.in/*"]},{route:"ourvisibleuniverse.in/*"},{triggers:{crons:["* * * * *"]}}]) assert.throws(()=>testPaymentSecretPayload({...config,...change},env));
 for(const change of [{RAZORPAY_MODE:"live"},{SUPABASE_URL:"https://other.supabase.co"},{PUBLIC_APP_ORIGIN:"https://ourvisibleuniverse.in"}]) assert.throws(()=>testPaymentSecretPayload({...config,vars:{...config.vars,...change}},env));
});
test("Live keys, absent/weak credentials and reuse of API secret as webhook secret fail closed",()=>{
 for(const change of [{RAZORPAY_TEST_KEY_ID:"rzp_live_synthetic"},{RAZORPAY_TEST_KEY_SECRET:"short"},{RAZORPAY_TEST_KEY_SECRET:" space padded secret "},{RAZORPAY_TEST_WEBHOOK_SECRET:"short"},{RAZORPAY_TEST_WEBHOOK_SECRET:env.RAZORPAY_TEST_KEY_SECRET},{RAZORPAY_TEST_WEBHOOK_SECRET:undefined}]) assert.throws(()=>testPaymentSecretPayload(config,{...env,...change}));
});
