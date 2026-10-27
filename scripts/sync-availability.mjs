// The release owner qualifies a GitHub asset; the calendar never qualifies it.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';
const repository = 'https://github.com/jenksed/yourmove-go';
const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export function releaseState(config) {
  const p = config.published;
  if (p === null || p === undefined) return null;
  const version = /^v?\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/;
  if (p.qualified !== true || !version.test(p.version || '') || !p.platform || !p.requirements || !p.verifiedOn ||
      !/^\d{4}-\d{2}-\d{2}$/.test(p.verifiedOn) ||
      !String(p.releaseUrl).startsWith(repository + '/releases/tag/') ||
      !String(p.downloadUrl).startsWith(repository + '/releases/download/')) {
    throw new Error('Published release needs qualification, version, requirements, verification date, and official GitHub release/asset URLs.');
  }
  // Both links must belong to the same exact release. Reject redirects/queries and incomplete paths.
  const release = new URL(p.releaseUrl), download = new URL(p.downloadUrl);
  const tag = release.pathname.slice('/jenksed/yourmove-go/releases/tag/'.length);
  const asset = download.pathname.slice('/jenksed/yourmove-go/releases/download/'.length);
  if (tag !== p.version || tag.includes('/') || !asset.startsWith(tag + '/') || !asset.slice(tag.length + 1) ||
      [release,download].some(url => url.search || url.hash || url.username || url.password) ||
      !asset.slice(tag.length + 1).match(/^[a-zA-Z0-9_.%+-]+$/)) throw new Error('Release and asset URLs must identify the same official GitHub release.');
  return p;
}
export function renderAvailability(config) {
  const p = releaseState(config);
  const planned = config.enabled === true && /^\d{4}-\d{2}-\d{2}$/.test(config.date || '') ? `<p>Initial launch is planned for <time datetime="${escape(config.date)}">${escape(config.dateLabel || config.date)}</time>. A published release and its requirements determine availability.</p>` : '';
  return `<section class="availability-section" aria-labelledby="availability-title" data-analytics-section="release_availability"><div class="shell availability-grid">
<div><p class="availability-state">${p ? `Official release · ${escape(p.version)}` : 'Public installer · Not yet published'}</p><h2 id="availability-title">${p ? `YourMove for ${escape(p.platform)} is available.` : 'There isn’t an official app download yet.'}</h2><p>${p ? 'Download the qualified application package from the official GitHub release.' : 'You don’t need to learn GitHub or run build commands to check back. This page will point to the official release when it’s available.'}</p></div>
<div>${p ? `<a class="discovery-button" href="${escape(p.downloadUrl)}" data-analytics-cta="download_release" data-analytics-placement="get_started_availability">Download YourMove ${escape(p.version)}</a><p class="release-requirements">${escape(p.requirements)}</p><a class="text-action" href="${escape(p.releaseUrl)}" data-analytics-cta="check_releases" data-analytics-placement="get_started_availability" target="_blank" rel="noopener noreferrer">Read release notes &amp; installation instructions ↗</a><p class="release-source">Release qualified ${escape(p.verifiedOn)}. Check the release notes before installing.</p>` : `${planned}<a class="discovery-button" href="${repository}/releases" data-analytics-cta="check_releases" data-analytics-placement="get_started_availability" target="_blank" rel="noopener noreferrer">Check official releases ↗</a><p class="release-source">Verified October 27, 2026 against <a href="${repository}/releases">GitHub Releases</a> and the <a href="${repository}#downloads-and-macos-status">official project README</a>. No public releases were listed. Source builds are available below.</p>`}</div>
</div></section>`;
}
export function syncAvailability({check = false, root = process.cwd()} = {}) {
  const sandbox = {window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'public/release-config.js'),'utf8'), sandbox);
  const config = sandbox.window.YOURMOVE_RELEASE;
  const p = releaseState(config);
  const file = path.join(root,'public/get-started/index.html');
  const original = fs.readFileSync(file,'utf8');
  const marker = /<!-- availability:start -->[\s\S]*?<!-- availability:end -->/;
  if (!marker.test(original)) throw new Error('Get Started availability markers are missing.');
  let updated = original.replace(marker, `<!-- availability:start -->\n${renderAvailability(config)}\n<!-- availability:end -->`);
  const homeFile = path.join(root,'public/index.html');
  const home = fs.readFileSync(homeFile,'utf8');
  // Text-only launch updates to existing homepage availability notices and shared announcement.
  const status = p ? `Official release ${escape(p.version)} available.` : 'Official installer not yet published.';
  const statusPattern = /Official (?:installer not yet published|release v?\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)? available)\./g;
  updated = updated.replace(statusPattern, status);
  const newHome = home.replace(/Official (?:installer not yet published|release v?\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)? available)\./g, status);
  for (const [target,before,after] of [[file,original,updated],[homeFile,home,newHome]]) {
    if (check && before !== after) throw new Error('Availability is stale: ' + target);
    if (!check && before !== after) fs.writeFileSync(target,after);
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) syncAvailability({check:process.argv.includes('--check')});
