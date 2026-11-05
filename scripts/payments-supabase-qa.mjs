// Explicit disposable development workflow. Never contacts Razorpay or changes existing users.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const target='https://pdvwkdggyyrfkoqrpbji.supabase.co';
assert.ok(process.argv.includes('--disposable-development-fixture'));
assert.equal(process.env.SUPABASE_URL,target);
const secret=process.env.SUPABASE_SERVICE_ROLE_KEY, publicKey=process.env.SUPABASE_PUBLISHABLE_KEY;
assert.ok(secret?.startsWith('sb_secret_') && publicKey?.startsWith('sb_publishable_'));
const marker=crypto.randomUUID().replaceAll('-',''), users=[], tokens=[], events=[];
let stage='preflight', beforeUsers, beforePasses;
const checks=[];
async function request(path,method='GET',body,token){
 const response=await fetch(target+path,{method,headers:{apikey:token?publicKey:secret,
  ...(token?{Authorization:`Bearer ${token}`} : {}),'Content-Type':'application/json',Prefer:'return=representation'},
  ...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(30000)});
 const data=response.status===204?undefined:await response.json(); return {ok:response.ok,status:response.status,data};
}
async function api(...args){const result=await request(...args); assert.ok(result.ok,`Fixture request failed at ${stage} (${result.status})`);return result.data;}
const order=index=>`order_QA${marker}${index}`, payment=index=>`pay_QA${marker}${index}`;
function capture(index,user,extra={}) {return {p_environment:'sandbox',p_order_id:order(index),p_payment_id:payment(index),
 p_user_id:user,p_amount:index===1?17900:79900,p_currency:'INR',p_refunded:0,...extra};}
async function rpc(body,token){return api('/rest/v1/rpc/payment_apply_verified_capture','POST',body,token);}
const report={passed:false,providerCalls:0,existingCustomerWrites:0,fixturesRemoved:false,checks};
try{
 beforeUsers=(await api('/auth/v1/admin/users?per_page=1000')).users.map(user=>user.id).sort();
 beforePasses=await api('/rest/v1/access_passes?select=*&order=id');
 assert.ok(beforeUsers.length<1000 && beforePasses.length<1000);
 for(let index=0;index<2;index++){
  stage='create-marked-identity';const email=`ovu.payment.qa.${marker}.${index}@example.test`;
  const user=await api('/auth/v1/admin/users','POST',{email,email_confirm:true,app_metadata:{ovu_payment_fixture:marker}});
  users.push(user.id);
  const link=await api('/auth/v1/admin/generate_link','POST',{type:'magiclink',email});
  const session=await api('/auth/v1/verify','POST',{type:'magiclink',token_hash:link.hashed_token??link.properties?.hashed_token});
  assert.ok(session.access_token);tokens.push(session.access_token);
 }
 stage='register-synthetic-orders';
 await api('/rest/v1/payment_orders','POST',[1,2].map(index=>({environment:'sandbox',order_id:order(index),user_id:users[0],
  plan_id:index===1?'universe_30_days':'universe_180_days',access_days:index===1?30:180,amount_minor:index===1?17900:79900,currency:'INR'})));
 if(process.argv.includes('--built')) {
  stage='built-application';const {paymentBuiltChecks}=await import('./helpers/payment-built-qa.mjs');
  checks.push(...await paymentBuiltChecks({tokens,orderId:order(1),marker}));
  assert.equal((await api(`/rest/v1/access_passes?user_id=eq.${users[0]}&select=id`)).length,0);
 }
 stage='permission-boundaries';
 for(const token of tokens){
  const read=await request('/rest/v1/payment_orders?select=order_id','GET',undefined,token);
  assert.ok([401,403].includes(read.status));
  const mutation=await request('/rest/v1/rpc/payment_apply_verified_capture','POST',capture(1,users[0]),token);
  assert.ok([401,403].includes(mutation.status));
 }
 const anonymous=await fetch(target+'/rest/v1/payment_orders?select=order_id',{headers:{apikey:publicKey}});
 assert.ok([401,403].includes(anonymous.status));await anonymous.body.cancel();
 checks.push('anonymous and authenticated clients cannot read ledger or invoke payment mutations');
 stage='concurrent-duplicate-capture';
 const event=`event_QA${marker}`;events.push(event);
 const copies=await Promise.all(Array.from({length:8},()=>rpc(capture(1,users[0],{p_event_id:event,p_event_type:'payment.captured',p_body_sha256:'a'.repeat(64)}))));
 assert.equal(copies.filter(row=>!row.duplicate).length,1);
 assert.equal(new Set(copies.map(row=>row.expiresAt)).size,1);
 const first=(await api(`/rest/v1/access_passes?user_id=eq.${users[0]}&select=*`));assert.equal(first.length,1);
 assert.equal((await api(`/rest/v1/payment_events?event_id=eq.${event}&select=event_id`)).length,1);
 checks.push('eight concurrent captures yield one pass, one transaction and one event');
 stage='owner-and-amount-failure';
 for(const body of [capture(1,users[1]),capture(1,users[0],{p_amount:1}),capture(1,users[0],{p_currency:'USD'})])
  assert.equal((await request('/rest/v1/rpc/payment_apply_verified_capture','POST',body)).ok,false);
 checks.push('cross-owner, amount and currency mismatches rejected');
 stage='stack-and-refund';
 const second=await rpc(capture(2,users[0]));
 assert.equal(new Date(second.expiresAt)-new Date(first[0].expires_at),180*86400000);
 const refunded=await rpc(capture(1,users[0],{p_refunded:17900}));assert.equal(refunded.status,'refunded');
 const rebased=await api(`/rest/v1/access_passes?user_id=eq.${users[0]}&payment_session_id=eq.${payment(2)}&select=expires_at,allocated_starts_at,allocated_expires_at`);
 assert.equal(new Date(rebased[0].allocated_expires_at)-new Date(rebased[0].allocated_starts_at),180*86400000);
 assert.ok(new Date(second.expiresAt)-new Date(rebased[0].expires_at)>29.9*86400000);
 const replay=await Promise.all(Array.from({length:4},()=>rpc(capture(1,users[0],{p_refunded:17900}))));
 assert.ok(replay.every(row=>row.status==='refunded'));
 const afterReplay=await api(`/rest/v1/access_passes?user_id=eq.${users[0]}&payment_session_id=eq.${payment(2)}&select=expires_at,allocated_starts_at,allocated_expires_at`);
 assert.deepEqual(afterReplay,rebased);
 assert.equal((await api(`/rest/v1/entitlement_refund_adjustments?user_id=eq.${users[0]}&select=id`)).length,1);
 checks.push('full refund removes only unused time and concurrent refund retries do not subtract twice');
 stage='late-capture';
 assert.equal((await rpc(capture(1,users[0]))).status,'refunded');
 checks.push('late capture callback cannot reactivate a refunded purchase');
 report.passed=true;
}finally{
 stage='cleanup';
 for(const id of users){
  const user=await api(`/auth/v1/admin/users/${id}`);assert.equal(user.app_metadata?.ovu_payment_fixture,marker);
  for(const table of ['entitlement_refund_adjustments','payment_transactions','payment_orders','access_passes'])
   await api(`/rest/v1/${table}?user_id=eq.${id}`,'DELETE');
 }
 for(const event of events) await api(`/rest/v1/payment_events?environment=eq.sandbox&event_id=eq.${event}`,'DELETE');
 for(const id of users) await api(`/auth/v1/admin/users/${id}`,'DELETE');
 if(beforeUsers) assert.deepEqual((await api('/auth/v1/admin/users?per_page=1000')).users.map(user=>user.id).sort(),beforeUsers);
 if(beforePasses) assert.deepEqual(await api('/rest/v1/access_passes?select=*&order=id'),beforePasses);
 report.fixturesRemoved=true;
 await writeFile(new URL('../../../evidence/ovu-payment-database-results.json',import.meta.url),JSON.stringify(report,null,2));
}
console.log(JSON.stringify(report));
