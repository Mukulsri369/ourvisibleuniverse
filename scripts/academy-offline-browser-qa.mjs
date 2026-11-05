// Test-only loopback harness for the exact production journal/flush modules.
// It has no authentication keys, external requests or production app route.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { transpileModule, ModuleKind, ScriptTarget } from "typescript";
const run = crypto.randomUUID(), scripts = new Map();
for (const [path, source] of [["/journal.js", "offline-journal"], ["/queue.js", "offline-queue"]]) {
  scripts.set(path, transpileModule(await readFile(new URL(`../src/lib/academy/${source}.ts`, import.meta.url), "utf8"),
    { compilerOptions: { module: ModuleKind.ESNext, target: ScriptTarget.ES2022 } }).outputText);
}
const page = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>OVU offline storage QA</title><body><main>
<h1>OVU offline storage QA</h1><p>Synthetic events only. This tests the production storage modules; it does not simulate a complete Academy lesson.</p>
<h2 id="tab"></h2><label>QA account <select id="owner"><option value="a">Account A</option><option value="b">Account B</option></select></label>
<p><button id="append">Queue synthetic reading</button> <button id="flush">Flush queued events</button></p>
<p><button id="offline">Simulate network outage</button> <button id="hold">Hold acknowledgements</button> <button id="release">Release acknowledgements</button></p>
<p><button id="cleanup">Remove synthetic QA events</button></p><pre><output id="status" aria-live="polite"></output></pre></main>
<script type="module">
import {appendOfflineAction,readOfflineActions,acknowledgeOfflineActions} from '/journal.js';
import {flushAcknowledgedOfflineActions} from '/queue.js';
const run=${JSON.stringify(run)}, tab=new URLSearchParams(location.search).get('tab') || 'A';
const owner=()=> 'qa-'+run+'-'+document.getElementById('owner').value;
const actions=()=>readOfflineActions(localStorage).filter(action=>action.id.startsWith('qa:'+run+':'));
let offline=false,hold=false,busy=false,message='Ready',waiters=[];
document.getElementById('tab').textContent='Tab '+tab;
function render(){document.getElementById('status').textContent=JSON.stringify({pendingForAccount:actions().filter(action=>action.ownerId===owner()).length,totalPending:actions().length,offline,receiptsHeld:hold,busy,message},null,2);document.getElementById('flush').disabled=busy;}
document.getElementById('owner').onchange=render;
document.getElementById('append').onclick=()=>{try{appendOfflineAction(localStorage,{id:'qa:'+run+':'+crypto.randomUUID(),ownerId:owner(),type:'lesson_progress',payload:{moduleId:'01',lessonId:'01-core',scrollDepthPercent:80,timeSpentSeconds:120},timestamp:new Date().toISOString()});message='Synthetic event saved';}catch{message='Storage failure; event was not acknowledged';}render();};
document.getElementById('offline').onclick=()=>{offline=!offline;document.getElementById('offline').textContent=offline?'Restore network':'Simulate network outage';render();};
document.getElementById('hold').onclick=()=>{hold=true;render();};
document.getElementById('release').onclick=()=>{hold=false;for(const release of waiters)release();waiters=[];render();};
document.getElementById('flush').onclick=async()=>{busy=true;render();try{await flushAcknowledgedOfflineActions({ownerId:owner(),read:actions,acknowledge:events=>acknowledgeOfflineActions(localStorage,events),send:async()=>{if(offline)throw Error('Synthetic network interruption');if(hold)await new Promise(resolve=>waiters.push(resolve));return {success:true};}});message='Flush finished';}catch{message='Storage acknowledgement unavailable';}finally{busy=false;render();}};
document.getElementById('cleanup').onclick=()=>{acknowledgeOfflineActions(localStorage,actions());message='Only this run’s synthetic events removed';render();};
addEventListener('storage',render);render();
</script></body></html>`;
const server = createServer((request, response) => {
  const address = server.address();
  if (request.method !== "GET" || request.headers.host !== `127.0.0.1:${address.port}`) { response.writeHead(403).end(); return; }
  const path = new URL(request.url, `http://127.0.0.1:${address.port}`).pathname;
  const content = path === "/" ? page : scripts.get(path);
  if (content === undefined) { response.writeHead(404).end(); return; }
  response.writeHead(200, { "Content-Type": path === "/" ? "text/html; charset=utf-8" : "text/javascript; charset=utf-8",
    "Cache-Control": "no-store", "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'none'; frame-ancestors 'none'" });
  response.end(content);
});
server.listen(0, "127.0.0.1", () => console.log(`Offline browser QA ready: http://127.0.0.1:${server.address().port}`));
process.once("SIGINT", () => { server.closeAllConnections(); server.close(() => process.exit(0)); });
