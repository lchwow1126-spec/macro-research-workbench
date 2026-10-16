import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash, webcrypto } from 'node:crypto';
const source = await readFile(new URL('../index-BB7nPvbl.js', import.meta.url), 'utf8');
const callback = source.slice(source.indexOf('async(t=`none`)=>{if(!te.current)'), source.indexOf('},[j,e,M]);if((0,T.useEffect)') + 1);
const body = '{"value":"中国"}';
const sha = s => createHash('sha256').update(s).digest('hex');
function harness({ hash = sha(body), payload = body, loaded = false, pending = false, manifestStatus = 200 } = {}) {
  const calls = [], errors = [], updates = [];
  const x = { current: loaded ? {old:true} : null }, k = {current: loaded ? sha(body) : ''}, A = {current: pending ? sha(body) : ''};
  const fetch = async url => {
    calls.push(String(url));
    return String(url).includes('publication-manifest')
      ? new Response(JSON.stringify({snapshot_sha256:hash}), {status:manifestStatus})
      : new Response(payload);
  };
  const names = ['te','m','j','M','e','fetch','document','k','A','x','v','g','n','b','Ne','f','crypto'];
  const values = [{current:false},()=>{},true,false,true,fetch,{baseURI:'https://example.com/sub/'},k,A,x,()=>{},e=>errors.push(e),v=>updates.push(v),()=>{},JSON.stringify,()=>{},webcrypto];
  return {run: new Function(...names, `return (${callback});`)(...values),calls,errors,updates,k,A};
}
test('initial load verifies bytes and records hash', async()=>{const h=harness();await h.run();assert.equal(h.calls.length,2);assert.equal(h.updates.length,1);assert.equal(h.k.current,sha(body));});
test('unchanged active or pending snapshot skips download on repeated polls',async()=>{for(const pending of [false,true]){const h=harness({loaded:true,pending});if(pending)h.k.current='other';await h.run();await h.run();assert.equal(h.calls.length,2);assert.ok(h.calls.every(u=>u.includes('publication-manifest')));}});
test('changed hash downloads and verifies',async()=>{const h=harness({loaded:true,payload:'{"new":true}',hash:sha('{"new":true}')});await h.run();assert.equal(h.calls.length,2);assert.equal(h.A.current,sha('{"new":true}'));});
test('manual refresh still downloads',async()=>{const h=harness({loaded:true});await h.run('snapshot');assert.equal(h.calls.length,2);assert.equal(h.updates.length,1);});
test('missing, malformed, or unavailable manifest stops before large download',async()=>{for(const options of [{hash:null},{hash:'bad'},{manifestStatus:503}]){const h=harness({...options,loaded:true});await h.run();assert.equal(h.calls.length,1);assert.equal(h.updates.length,0);assert.ok(h.errors[0]);}});
test('mismatch retains current state and retries next poll',async()=>{const h=harness({loaded:true,hash:'a'.repeat(64)});await h.run();await h.run();assert.equal(h.calls.length,4);assert.equal(h.updates.length,0);assert.equal(h.k.current,sha(body));assert.ok(h.errors.every(Boolean));});
test('matching bytes but invalid JSON is rejected',async()=>{const h=harness({payload:'{',hash:sha('{')});await h.run();assert.equal(h.updates.length,0);assert.ok(h.errors[0]);});
