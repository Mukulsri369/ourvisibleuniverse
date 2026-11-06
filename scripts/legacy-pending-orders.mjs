import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ACCESS_PLANS } from '../src/lib/plans.ts';
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
class LegacyOrderValidationError extends Error {}
function check(value,message){if(!value)throw new LegacyOrderValidationError(message);}
export function pendingRegistration(candidate,fresh,mappings,cutoffUnix){
 check(/^order_[A-Za-z0-9]+$/.test(candidate.id)&&fresh.id===candidate.id,'Unreviewed order reference');
 check(Number.isSafeInteger(cutoffUnix)&&Number.isSafeInteger(fresh.created_at)&&fresh.created_at<=cutoffUnix,'Order outside migration cutoff');
 check(/^ovu_[a-f0-9]{28}$/.test(fresh.receipt),'Not an original OVU receipt');
 for(const field of ['amount','currency','receipt','created_at'])check(fresh[field]===candidate[field],'Provider order changed since scoped audit');
 for(const field of ['userId','planId','currency'])check((fresh.notes?.[field]??null)===(candidate.notes?.[field]??null),'Order ownership/plan changed since audit');
 check(['created','attempted'].includes(fresh.status)&&fresh.amount_paid===0&&fresh.amount_due===fresh.amount,'Order needs paid-state reconciliation');
 check(Number.isSafeInteger(fresh.amount)&&fresh.amount>0&&fresh.amount<=1_000_000_000&&['INR','USD'].includes(fresh.currency)&&
  (fresh.notes.currency==null||fresh.notes.currency===fresh.currency),'Invalid original order price');
 const mapping=mappings.filter(row=>row.sourceId===fresh.notes.userId);
 check(mapping.length===1&&uuid.test(mapping[0].targetId)&&uuid.test(mapping[0].sourceId),'Original owner is not uniquely reconciled');
 check(Number.isFinite(Date.parse(mapping[0].sourceCreatedAt))&&fresh.created_at>=Date.parse(mapping[0].sourceCreatedAt)/1000-300,'Order predates the reconciled identity');
 const plan=Object.hasOwn(ACCESS_PLANS,fresh.notes.planId)?ACCESS_PLANS[fresh.notes.planId]:undefined;
 check(plan&&[30,180,365].includes(plan.days),'Unknown original plan');
 // Preserve the authenticated provider's price at original creation, not today's catalogue price.
 return {environment:'live',orderId:fresh.id,userId:mapping[0].targetId,planId:plan.id,days:plan.days,amount:fresh.amount,currency:fresh.currency,createdAt:new Date(fresh.created_at*1000).toISOString()};
}
function same(existing,expected){return ['environment','orderId','userId','planId','days','amount','currency'].every(field=>existing[field]===expected[field]);}
export async function registerLegacyPending({candidates,mappings,cutoffUnix,providerRead,listExisting,insert}){
 check(Array.isArray(candidates)&&candidates.length<1000&&new Set(candidates.map(row=>row.id)).size===candidates.length,'Invalid or duplicate migration inventory');
 check(candidates.every(row=>/^order_[A-Za-z0-9]+$/.test(row.id)),'Invalid candidate reference');
 const expected=[];
 for(const candidate of candidates)expected.push(pendingRegistration(candidate,await providerRead(candidate.id),mappings,cutoffUnix));
 const before=await listExisting();check(before.length<1000,'Expand order pagination before migration');
 // Validate all existing immutable bindings before making the first append.
 for(const row of expected){const matches=before.filter(old=>old.environment===row.environment&&old.orderId===row.orderId);check(matches.length<=1&&(!matches.length||same(matches[0],row)),'Existing order ownership/price conflicts');}
 let inserted=0,preserved=0;
 for(const row of expected){if(before.some(old=>old.environment===row.environment&&old.orderId===row.orderId)){preserved++;continue;}await insert(row);inserted++;}
 const after=await listExisting();
 for(const row of expected){const matches=after.filter(old=>old.environment===row.environment&&old.orderId===row.orderId);check(matches.length===1&&same(matches[0],row),'Registered migration order postflight failed');}
 for(const old of before)check(after.some(row=>same(row,old)),'Existing order changed');
 return {summary:{completed:true,candidates:expected.length,ordersInserted:inserted,existingOrdersPreserved:preserved,accessGrantsPerformed:0,providerWrites:0},registrations:expected};
}
async function main(){
 check(process.argv.includes('--register-reviewed-legacy-orders')&&process.argv.includes('--private-output'),'Explicit migration operation required');
 check(process.env.SUPABASE_URL==='https://pdvwkdggyyrfkoqrpbji.supabase.co'&&process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('sb_secret_')&&/^rzp_live_[A-Za-z0-9]+$/.test(process.env.RAZORPAY_LIVE_KEY_ID??'')&&process.env.RAZORPAY_LIVE_KEY_SECRET?.length>=16,'Private server configuration missing');
 const parts=[];for await(const chunk of process.stdin)parts.push(chunk);const input=JSON.parse(Buffer.concat(parts).toString('utf8'));
 check(input.sourceProject==='6f478791-cfcb-4931-ba58-b9ed1948e8d4'&&input.reconciliationConflicts===0,'Verified OVU source mapping required');
 const providerRead=async id=>{const response=await fetch(`https://api.razorpay.com/v1/orders/${id}`,{method:'GET',headers:{Authorization:`Basic ${Buffer.from(`${process.env.RAZORPAY_LIVE_KEY_ID}:${process.env.RAZORPAY_LIVE_KEY_SECRET}`).toString('base64')}`},signal:AbortSignal.timeout(25000)});check(response.ok,'Original provider order read failed');return response.json();};
 const db=async(path,method='GET',body)=>{check(method==='GET'||(method==='POST'&&path==='/rest/v1/payment_orders'),'No access/transaction mutations permitted');const response=await fetch(process.env.SUPABASE_URL+path,{method,headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json',Prefer:'return=representation'},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(25000)});check(response.ok,'Owned order storage failed');return response.json();};
 const beforePasses=await db('/rest/v1/access_passes?select=*&limit=1000');check(beforePasses.length<1000,'Pass snapshot incomplete');
 const result=await registerLegacyPending({...input,providerRead,listExisting:async()=>{const rows=await db('/rest/v1/payment_orders?select=*&limit=1000');return rows.map(row=>({environment:row.environment,orderId:row.order_id,userId:row.user_id,planId:row.plan_id,days:row.access_days,amount:row.amount_minor,currency:row.currency}));},
 insert:row=>db('/rest/v1/payment_orders','POST',{environment:row.environment,order_id:row.orderId,user_id:row.userId,plan_id:row.planId,access_days:row.days,amount_minor:row.amount,currency:row.currency,created_at:row.createdAt})});
 const afterPasses=await db('/rest/v1/access_passes?select=*&limit=1000');
 const canonical=row=>JSON.stringify(row,Object.keys(row).sort());
 check(beforePasses.length===afterPasses.length&&beforePasses.every(old=>afterPasses.some(row=>canonical(row)===canonical(old))),'Pass records changed during registration; reconcile before continuing');
 result.summary.existingPassesPreserved=beforePasses.length;process.stdout.write(JSON.stringify(result));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main().catch(error=>{console.error(`Pending-order registration stopped: ${error instanceof LegacyOrderValidationError?error.message:'External operation failed'}. No provider financial writes were made.`);process.exitCode=1;});
