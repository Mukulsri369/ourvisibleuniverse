import assert from 'node:assert/strict';
import { readFile,readdir } from 'node:fs/promises';
import { resolve,dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { unstable_dev } from 'wrangler';
import { runWithStartContext } from '@tanstack/start-storage-context';
export async function paymentBuiltChecks({tokens,orderId,marker}) {
 assert.ok(!process.env.RAZORPAY_LIVE_KEY_SECRET && !process.env.RAZORPAY_TEST_KEY_SECRET);
 const config=resolve(import.meta.dirname,'../../dist/server/wrangler.json'),built=JSON.parse(await readFile(config,'utf8'));
 let manifest='';
 for(const name of await readdir(resolve(dirname(config),'assets'))) if(/^server-.*\.js$/.test(name)) manifest+=await readFile(resolve(dirname(config),'assets',name),'utf8');
 const {serverFnFetcher}=await import(new URL('./serverFnFetcher.js',import.meta.resolve('@tanstack/start-client-core/client-rpc')));
 const probe=createServer();probe.listen(0,'127.0.0.1');await once(probe,'listening');const port=probe.address().port;await new Promise(done=>probe.close(done));
 const origin=`http://127.0.0.1:${port}`;
 const vars=Object.fromEntries(['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','SUPABASE_SERVICE_ROLE_KEY'].map(key=>[key,process.env[key]]));
 Object.assign(vars,{RAZORPAY_MODE:'test',PUBLIC_APP_ORIGIN:origin});
 const start=()=>unstable_dev(resolve(dirname(config),built.main),{config,local:true,bundle:false,ip:'127.0.0.1',port,vars,
  persistTo:resolve(tmpdir(),'ovu-payment-built-qa',marker),logLevel:'error',experimental:{disableExperimentalWarning:true,disableDevRegistry:true}});
 async function rpc(name,data,token,method='POST') {
  const id=manifest.match(new RegExp('"([a-f0-9]{64})":\\s*\\{\\s*functionName:\\s*"'+name+'_createServerFn_handler"'))?.[1];assert.ok(id,`Missing built function ${name}`);
  const envelope=await runWithStartContext({startOptions:{serializationAdapters:[]}},()=>serverFnFetcher(`${origin}/_serverFn/${id}`,
   [{method,data,headers:token?{Authorization:`Bearer ${token}`}:{}}],(url,init)=>fetch(url,{...init,signal:AbortSignal.timeout(30000)})));
  if(envelope?.error)throw envelope.error;return envelope?.result??envelope;
 }
 let worker;
 try {
  worker=await start();
  await assert.rejects(()=>rpc('getMyPendingPayments',undefined,undefined,'GET'));
  const pending=await rpc('getMyPendingPayments',undefined,tokens[0],'GET');assert.ok(pending.some(row=>row.order_id===orderId));
  assert.deepEqual(await rpc('getMyPendingPayments',undefined,tokens[1],'GET'),[]);
  await assert.rejects(()=>rpc('recoverRazorpayPayment',{orderId},tokens[1]));
  await assert.rejects(()=>rpc('confirmRazorpayPayment',{razorpay_order_id:orderId,razorpay_payment_id:'pay_BuiltForged',razorpay_signature:'bad'},tokens[0]));
  const wrongMode=await fetch(origin+'/api/public/payments/razorpay?mode=live',{method:'POST',body:'{}'});assert.equal(wrongMode.status,400);await wrongMode.body.cancel();
  await worker.stop();worker=await start();
  assert.deepEqual(await rpc('getMyPendingPayments',undefined,tokens[0],'GET'),pending);
  return ['built authenticated pending-order API isolates owners','built recovery rejects other owners and forged confirmation','built webhook rejects wrong mode','pending-order recovery history survives built Worker restart'];
 }finally{await worker?.stop();}
}
