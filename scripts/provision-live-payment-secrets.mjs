// Invoke only after the owner's explicit Live staging setup approval.
// Secrets travel through stdin, never command arguments or a plaintext file.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { livePaymentSecretPayload } from './prepare-live-payment-config.mjs';
export function liveProvisioningRequest(config,environment) {
 const payload=livePaymentSecretPayload(config,environment);
 return {worker:'ovu-supabase-staging',payload,operation:['secret','bulk']};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
 if(!process.argv.includes('--approved-staging-setup'))throw new Error('Explicit approved Live staging setup flag required');
 const root=resolve(import.meta.dirname,'..'),configPath=resolve(root,'dist/server/wrangler.staging-live.json');
 const config=JSON.parse(await readFile(configPath,'utf8'));
 const {worker,payload,operation}=liveProvisioningRequest(config,process.env);
 const child=spawn(process.execPath,[resolve(root,'node_modules/wrangler/bin/wrangler.js'),...operation,'--config',configPath,'--name',worker],
  {cwd:root,stdio:['pipe','pipe','pipe'],windowsHide:true});
 let output='';child.stdout.on('data',data=>{output+=data;});child.stderr.on('data',data=>{output+=data;});
 child.stdin.on('error',()=>{});child.stdin.end(JSON.stringify(payload));
 const status=await new Promise((done,reject)=>{child.once('error',reject);child.once('close',done);});
 for(const value of Object.values(payload))output=output.replaceAll(value,'[PRIVATE LIVE VALUE REDACTED]');
 console.log(output);
 if(status!==0)throw new Error('Cloudflare did not confirm Live staging secret provisioning');
 console.log('Three Live payment bindings provisioned only to the staging Worker. No Razorpay request or checkout mode change was made by this utility. Verify remote mode separately.');
}
