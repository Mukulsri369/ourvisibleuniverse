import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createPaymentService } from '../src/lib/payment-service.server.ts';
const project = 'https://pdvwkdggyyrfkoqrpbji.supabase.co';
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
function requireTrue(condition, message) { if (!condition) throw new Error(message); }

/** Narrow maintenance approval, not a public endpoint or generic legacy-order bypass. */
export function validateApprovedLegacyPayment(approval, order, payment) {
  requireTrue(approval?.scope === 'owner-reviewed-30-day-recovery-20261106' &&
    /^order_[A-Za-z0-9]+$/.test(approval.orderId) && /^pay_[A-Za-z0-9]+$/.test(approval.paymentId) &&
    uuid.test(approval.sourceUserId) && uuid.test(approval.targetUserId) &&
    /^[a-f0-9]{64}$/.test(approval.reviewSha256), 'Exact reviewed recovery approval required');
  requireTrue(order.id === approval.orderId && payment.id === approval.paymentId &&
    payment.order_id === order.id, 'Provider references differ from approval');
  requireTrue(order.notes?.userId === approval.sourceUserId && order.notes?.planId === 'universe_30_days' &&
    /^ovu_[a-f0-9]{28}$/.test(order.receipt), 'Original order ownership/plan does not match');
  requireTrue(order.amount === 17900 && order.amount_paid === 17900 && payment.amount === 17900 &&
    order.currency === 'INR' && payment.currency === 'INR', 'Approved amount/currency does not match');
  requireTrue(order.status === 'paid' && payment.captured === true && payment.status === 'captured' &&
    payment.amount_refunded === 0, 'Payment is no longer captured and unrefunded');
  return {environment:'live',orderId:order.id,userId:approval.targetUserId,planId:'universe_30_days',days:30,amount:17900,currency:'INR'};
}

export function assertRegisteredOrder(existing, expected) {
  for (const field of ['environment','orderId','userId','planId','days','amount','currency'])
    requireTrue(existing?.[field] === expected[field], 'Registered order conflicts with reviewed purchase');
}

async function main() {
  requireTrue(process.argv.includes('--approved-specific-30-day-recovery') && process.argv.includes('--private-output'), 'Explicit scoped approval/private output required');
  requireTrue(process.env.SUPABASE_URL === project && process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('sb_secret_') &&
    /^rzp_live_[A-Za-z0-9]+$/.test(process.env.RAZORPAY_LIVE_KEY_ID ?? '') && process.env.RAZORPAY_LIVE_KEY_SECRET?.length >= 16, 'Private server configuration missing');
  const chunks=[];for await(const chunk of process.stdin)chunks.push(chunk);
  const approval=JSON.parse(Buffer.concat(chunks).toString('utf8'));
  // Reject malformed identifiers before constructing any request URL.
  requireTrue(/^order_[A-Za-z0-9]+$/.test(approval.orderId) && /^pay_[A-Za-z0-9]+$/.test(approval.paymentId) && uuid.test(approval.targetUserId), 'Invalid approval identifiers');
  let providerReads=0;
  async function providerRead(path) {
    requireTrue([`/orders/${approval.orderId}`,`/orders/${approval.orderId}/payments`,`/payments/${approval.paymentId}`].includes(path), 'Provider read outside approval');
    const response=await fetch(`https://api.razorpay.com/v1${path}`, {method:'GET',headers:{Authorization:`Basic ${Buffer.from(`${process.env.RAZORPAY_LIVE_KEY_ID}:${process.env.RAZORPAY_LIVE_KEY_SECRET}`).toString('base64')}`},signal:AbortSignal.timeout(25000)});
    requireTrue(response.ok,'Read-only provider verification failed');providerReads++;return response.json();
  }
  async function database(path, method='GET', body) {
    requireTrue(method==='GET' || (method==='POST' && ['/rest/v1/payment_orders','/rest/v1/rpc/payment_apply_verified_capture'].includes(path)), 'Database mutation outside approved recovery');
    const response=await fetch(project+path,{method,headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json',Prefer:'return=representation'},
      ...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(25000)});
    requireTrue(response.ok,'Owned-project recovery operation failed');return response.json();
  }
  const order=await providerRead(`/orders/${approval.orderId}`), payment=await providerRead(`/payments/${approval.paymentId}`);
  const expected=validateApprovedLegacyPayment(approval,order,payment);
  const userResponse=await database(`/auth/v1/admin/users/${approval.targetUserId}`), user=userResponse.user??userResponse;
  requireTrue(user.id===approval.targetUserId && user.email?.toLowerCase()===approval.expectedEmail?.toLowerCase() && !!user.email_confirmed_at && user.role==='authenticated', 'Reviewed identity no longer matches');
  const before=await database('/rest/v1/access_passes?select=*&limit=1000');requireTrue(Array.isArray(before)&&before.length<1000,'Pass snapshot incomplete');
  async function stored() {
    const rows=await database(`/rest/v1/payment_orders?select=*&environment=eq.live&order_id=eq.${approval.orderId}`);
    requireTrue(Array.isArray(rows)&&rows.length<=1,'Ambiguous registered order');
    const row=rows[0];return row?{environment:row.environment,orderId:row.order_id,userId:row.user_id,planId:row.plan_id,days:row.access_days,amount:row.amount_minor,currency:row.currency}:null;
  }
  let registered=await stored();
  if(!registered) {
    await database('/rest/v1/payment_orders','POST',{environment:'live',order_id:expected.orderId,user_id:expected.userId,plan_id:expected.planId,
      access_days:expected.days,amount_minor:expected.amount,currency:expected.currency,created_at:new Date(order.created_at*1000).toISOString()});
    registered=await stored();
  }
  assertRegisteredOrder(registered,expected);
  const service=createPaymentService({mode:'live',keyId:()=>{throw new Error('Checkout is unavailable in recovery maintenance');},
    provider:{create:async()=>{throw new Error('Provider writes are prohibited');},
      order:async()=>{const value=await providerRead(`/orders/${approval.orderId}`);validateApprovedLegacyPayment(approval,value,await providerRead(`/payments/${approval.paymentId}`));return value;},
      payment:async()=>{const value=await providerRead(`/payments/${approval.paymentId}`);validateApprovedLegacyPayment(approval,await providerRead(`/orders/${approval.orderId}`),value);return value;},
      payments:async()=>providerRead(`/orders/${approval.orderId}/payments`)},
    store:{order:async()=>stored(),record:async()=>{throw new Error('Use only the scoped registered order');},ignored:async()=>{throw new Error('No webhook events are fabricated');},
      apply:async(storedOrder,paymentId,refundedAmount)=>{assertRegisteredOrder(storedOrder,expected);requireTrue(paymentId===approval.paymentId&&refundedAmount===0,'Unapproved payment state');
        return database('/rest/v1/rpc/payment_apply_verified_capture','POST',{p_environment:'live',p_order_id:expected.orderId,p_payment_id:approval.paymentId,
          p_user_id:expected.userId,p_amount:expected.amount,p_currency:expected.currency,p_refunded:0,p_event_id:null,p_event_type:null,p_body_sha256:null});}},
    verifySignature:async()=>false,verifyWebhook:async()=>false});
  const result=await service.recover(expected.userId,expected.orderId);
  const replay=await service.recover(expected.userId,expected.orderId);
  requireTrue(replay.duplicate===true && replay.expiresAt===result.expiresAt,'Recovery replay changed access');
  const after=await database('/rest/v1/access_passes?select=*&limit=1000');requireTrue(Array.isArray(after)&&after.length<1000,'Postflight snapshot incomplete');
  const canonical=value=>JSON.stringify(value,Object.keys(value).sort());
  for(const old of before)requireTrue(canonical(after.find(row=>row.id===old.id)??{})===canonical(old),'Existing access record changed');
  const recovered=after.filter(row=>row.environment==='live'&&row.payment_session_id===approval.paymentId);
  requireTrue(recovered.length===1&&recovered[0].user_id===expected.userId&&recovered[0].access_days===30&&recovered[0].status==='active','Recovered purchase postflight failed');
  const beforeOwn=before.filter(row=>row.environment==='live'&&row.payment_session_id===approval.paymentId);
  requireTrue(after.length===before.length+(beforeOwn.length?0:1),'Unexpected extra pass records');
  const summary={completed:true,planDays:30,passRecordsCreated:beforeOwn.length?0:1,existingPassesPreserved:before.length,
    duplicateReplayVerified:true,readOnlyProviderRequests:providerReads,providerWrites:0,emailsSent:0,rolesChanged:0,webhookDeliveryVerified:false};
  process.stdout.write(JSON.stringify({summary,reviewSha256:approval.reviewSha256,orderId:approval.orderId,paymentId:approval.paymentId,
    targetUserId:expected.userId,result,replay,recoveredPass:recovered[0],beforePassesSha256:createHash('sha256').update(JSON.stringify(before)).digest('hex')}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main().catch(()=>{console.error('Scoped recovery stopped; preserve private evidence and registered records for reconciliation. No provider financial writes were performed.');process.exitCode=1;});
