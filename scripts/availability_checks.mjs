// Offline release-switch checks. All published assets here are deliberate QA fixtures.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {releaseState, renderAvailability, syncAvailability} from './sync-availability.mjs';
const pending = {enabled:true,date:'2026-11-06',dateLabel:'November 6',published:null};
const published = {...pending,published:{qualified:true,version:'v0.0.0-qa',platform:'Apple Silicon Mac',requirements:'QA fixture only — not a published release.',verifiedOn:'2026-11-06',releaseUrl:'https://github.com/jenksed/yourmove-go/releases/tag/v0.0.0-qa',downloadUrl:'https://github.com/jenksed/yourmove-go/releases/download/v0.0.0-qa/YourMove-QA.zip'}};
assert.equal(releaseState(pending),null);
for (const date of ['2026-11-05','2026-11-06','2026-11-07']) {
  const html = renderAvailability({...pending,date});
  assert.match(html,/Not yet published/);assert.doesNotMatch(html,/data-analytics-cta="download_release"/);
}
assert.match(renderAvailability(published),/data-analytics-cta="download_release"/);
assert.doesNotMatch(renderAvailability(published),/Not yet published|planned for/);
for (const override of [{qualified:false},{requirements:''},{downloadUrl:'https://example.com/app.zip'}, {releaseUrl:'https://github.com/jenksed/yourmove-go/releases/tag/other'}, {downloadUrl:published.published.downloadUrl+'?redirect=bad'}, {version:'v9.9.9'}, {version:'<script>'}]) {
  assert.throws(()=>renderAvailability({...published,published:{...published.published,...override}}));
}
const root = fs.mkdtempSync(path.join(os.tmpdir(),'yourmove-wave5-release-'));
try {
  fs.mkdirSync(path.join(root,'public/get-started'),{recursive:true});
  for (const file of ['index.html','get-started/index.html']) fs.copyFileSync(path.join('public',file),path.join(root,'public',file));
  const configFile=path.join(root,'public/release-config.js');
  fs.writeFileSync(configFile,'window.YOURMOVE_RELEASE='+JSON.stringify(published));syncAvailability({root});syncAvailability({root,check:true});
  const home=fs.readFileSync(path.join(root,'public/index.html'),'utf8');
  assert.doesNotMatch(home,/Official installer not yet published/);assert.match(home,/Official release v0.0.0-qa available/);
  const getStarted=fs.readFileSync(path.join(root,'public/get-started/index.html'),'utf8');
  assert.doesNotMatch(getStarted,/Official installer not yet published/);
  assert.match(getStarted,/Download YourMove v0.0.0-qa/);assert.match(getStarted,/QA fixture only/);
  // The scheduled banner must yield to the actual published state, including on launch day.
  vm.runInNewContext(fs.readFileSync('public/release-banner.js','utf8'),{window:{YOURMOVE_RELEASE:published},document:{querySelector(){throw Error('Planned banner should not render for a published release')}}});
  const out=path.join('artifacts/product-discovery-wave-5');fs.mkdirSync(out,{recursive:true});
  fs.writeFileSync(path.join(out,'release-fixture.html'),getStarted);fs.writeFileSync(path.join(out,'release-fixture-config.js'),'window.YOURMOVE_RELEASE='+JSON.stringify(published));
  fs.writeFileSync(configFile,'window.YOURMOVE_RELEASE='+JSON.stringify(pending));syncAvailability({root});
  assert.match(fs.readFileSync(path.join(root,'public/index.html'),'utf8'),/Official installer not yet published/);
  assert.match(fs.readFileSync(path.join(root,'public/get-started/index.html'),'utf8'),/Not yet published/);
} finally {fs.rmSync(root,{recursive:true,force:true});}
console.log('PASS pending, launch-date, qualified release, invalid configs, static no-JS output, announcement notices, and rollback. No network requests.');
