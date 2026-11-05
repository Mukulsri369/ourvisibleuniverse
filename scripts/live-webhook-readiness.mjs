// Synthetic signed delivery to the approved staging Worker only. No Razorpay API.
// Uses an unsupported setup event, never a fabricated capture/refund or customer payment.
import assert from 'node:assert/strict';
import { createHmac,createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
const project='https://pdvwkdggyyrfkoqrpbji.supabase.co',origin='https://ovu-supabase-staging.mukul-srivastava-025.workers.dev';
assert.ok(process.argv.includes('--approved-staging-setup'));
assert.equal(process.env.SUPABASE_URL,project);
const secret=process.env.OVU_SETUP_WEBHOOK_SECRET,serverKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
assert.ok(secret?.length>=32 && serverKey?.startsWith('sb_secret_'));
const id='ovu_setup_'+crypto.randomUUID().replaceAll('-','');
const body=JSON.stringify({event:'ovu.setup.check',payload:{}}),hash=createHash('sha256').update(body).digest('hex');
const signature=createHmac('sha256',secret).update(body).digest('hex');
async function database(path,method='GET') {
 const response=await fetch(project+'/rest/v1/'+path,{method,headers:{apikey:serverKey},signal:AbortSignal.timeout(20000)});
 assert.ok(response.ok,`Readiness storage request rejected (${response.status})`);
 return response.status===204?undefined:response.json();
}
async function deliver(mode,sig){
 const response=await fetch(origin+'/api/public/payments/razorpay?mode='+mode,{method:'POST',headers:{'Content-Type':'application/json',
  'x-razorpay-signature':sig,'x-razorpay-event-id':id},body,redirect:'error',signal:AbortSignal.timeout(30000)});
 const status=response.status;await response.body?.cancel();return status;
}
const report={passed:false,syntheticSignedDelivery:true,providerWebhookDeliveryVerified:false,providerApiCalls:0,customerWrites:0,setupEventRemoved:false};
const before=await database('access_passes?select=*&order=id');
try{
 assert.equal(await deliver('test',signature),400);
 assert.equal(await deliver('live','0'.repeat(64)),401);
 assert.equal(await deliver('live',signature),200);
 assert.equal(await deliver('live',signature),200);
 const rows=await database('payment_events?environment=eq.live&event_id=eq.'+id+'&select=state,event_type,body_sha256');
 assert.deepEqual(rows,[{state:'ignored',event_type:'ovu.setup.check',body_sha256:hash}]);
 assert.equal(JSON.stringify(await database('access_passes?select=*&order=id'))===JSON.stringify(before),true,'Existing entitlement snapshot changed; values withheld');
 report.passed=true;report.replayedEventCount=1;
}finally{
 await database('payment_events?environment=eq.live&event_id=eq.'+id+'&event_type=eq.ovu.setup.check&body_sha256=eq.'+hash,'DELETE');
 assert.deepEqual(await database('payment_events?environment=eq.live&event_id=eq.'+id+'&select=event_id'),[]);
 report.setupEventRemoved=true;
 await writeFile(new URL('../../../evidence/ovu-live-webhook-readiness.json',import.meta.url),JSON.stringify(report,null,2));
}
console.log(JSON.stringify(report));
