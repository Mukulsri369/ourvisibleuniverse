// Local preparation only. This file never uploads keys, activates checkout or calls Razorpay.
import { readFile,writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
function assertStaging(config) {
 if(config.name!=='ovu-supabase-staging'||config.account_id!=='bd0819150e88cf64f97548038790d560'||
  config.vars?.SUPABASE_URL!=='https://pdvwkdggyyrfkoqrpbji.supabase.co'||
  config.vars?.PUBLIC_APP_ORIGIN!=='https://ovu-supabase-staging.mukul-srivastava-025.workers.dev'||
  config.vars?.OVU_DEPLOYMENT_STAGE!=='staging'||config.workers_dev!==true||config.preview_urls!==false||
  config.route||config.routes?.length||config.triggers?.crons?.length) throw new Error('Only the exact approved staging target is eligible');
 if(Object.keys(config.vars).some(key=>!['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','PUBLIC_APP_ORIGIN','OVU_DEPLOYMENT_STAGE','RAZORPAY_MODE','OVU_ACCESS_ENVIRONMENT','RAZORPAY_LIVE_CHECKOUT_ENABLED'].includes(key)))
  throw new Error('Private or unexpected variables must not enter the deployment configuration');
 if(!config.vars.SUPABASE_PUBLISHABLE_KEY?.startsWith('sb_publishable_')) throw new Error('Public Supabase configuration required');
}
export function livePaymentConfiguration(config,{websiteApproved=false,webhookConfigured=false,enableCheckout=false}={}) {
 assertStaging(config);
 if(!['test','live'].includes(config.vars.RAZORPAY_MODE))throw new Error('Explicit source payment mode required');
 if(typeof enableCheckout!=='boolean'||typeof websiteApproved!=='boolean'||typeof webhookConfigured!=='boolean')throw new Error('Explicit readiness checks required');
 if(enableCheckout&&(!websiteApproved||!webhookConfigured))throw new Error('Website approval and configured webhook required before Live checkout activation');
 const vars={...config.vars,RAZORPAY_MODE:'live',RAZORPAY_LIVE_CHECKOUT_ENABLED:enableCheckout?'true':'false'};delete vars.OVU_ACCESS_ENVIRONMENT;
 return {...config,vars};
}
export function livePaymentSecretPayload(config,environment) {
 assertStaging(config);
 if(config.vars.RAZORPAY_MODE!=='live'||'OVU_ACCESS_ENVIRONMENT' in config.vars) throw new Error('Live mode requires ordinary Live entitlement reads');
 const {RAZORPAY_LIVE_KEY_ID:id,RAZORPAY_LIVE_KEY_SECRET:secret,RAZORPAY_LIVE_WEBHOOK_SECRET:webhook}=environment;
 if(!/^rzp_live_[A-Za-z0-9]+$/.test(id??'')||typeof secret!=='string'||secret.length<16||secret.length>256||/\s/.test(secret)||
  typeof webhook!=='string'||webhook.length<32||webhook.length>256||/\s/.test(webhook)||webhook===secret)
  throw new Error('Existing Live pair and separate strong webhook secret must be entered privately');
 return {RAZORPAY_LIVE_KEY_ID:id,RAZORPAY_LIVE_KEY_SECRET:secret,RAZORPAY_LIVE_WEBHOOK_SECRET:webhook};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
 if(!process.argv.includes('--prepare-only'))throw new Error('Explicit local preparation flag required; this utility cannot upload or deploy');
 const root=resolve(import.meta.dirname,'../dist/server');
 const config=livePaymentConfiguration(JSON.parse(await readFile(resolve(root,'wrangler.staging.json'),'utf8')),
  {websiteApproved:process.argv.includes('--website-approved'),webhookConfigured:process.argv.includes('--webhook-configured'),enableCheckout:process.argv.includes('--enable-live-checkout')});
 await writeFile(resolve(root,'wrangler.staging-live.json'),JSON.stringify(config,null,2));
 console.log('Prepared public-only Live staging configuration locally. No activation, secrets, provider calls or remote changes.');
}
