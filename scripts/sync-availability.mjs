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
  if (p.checksumUrl) {
    const checksum = new URL(p.checksumUrl);
    const prefix = '/jenksed/yourmove-go/releases/download/' + tag + '/';
    if (checksum.origin !== release.origin || !checksum.pathname.startsWith(prefix) ||
        !checksum.pathname.endsWith('.sha256') || checksum.search || checksum.hash ||
        checksum.username || checksum.password || /%2f/i.test(checksum.pathname)) {
      throw new Error('Checksum must belong to the same official GitHub release.');
    }
  }
  return p;
}
export function renderAvailability(config) {
  const p = releaseState(config);
  const planned = config.enabled === true && /^\d{4}-\d{2}-\d{2}$/.test(config.date || '') ? `<p>Initial launch is planned for <time datetime="${escape(config.date)}">${escape(config.dateLabel || config.date)}</time>. A published release and its requirements determine availability.</p>` : '';
  const label = p && /\.dmg$/i.test(p.downloadUrl) ? 'Download for Mac (.dmg)' : p ? `Download YourMove ${escape(p.version)}` : '';
  return `<section class="availability-section" aria-labelledby="availability-title" data-analytics-section="release_availability"><div class="shell availability-grid">
<div><p class="availability-state">${p ? `Available now · ${escape(p.version)} technical alpha` : 'Public installer · Not yet published'}</p><h2 id="availability-title">${p ? `YourMove for ${escape(p.platform)} is available.` : 'There isn’t an official app download yet.'}</h2><p>${p ? 'Download the Mac technical alpha from the official GitHub release.' : 'You don’t need to learn GitHub or run build commands to check back. This page will point to the official release when it’s available.'}</p></div>
<div>${p ? `<a class="discovery-button" href="${escape(p.downloadUrl)}" data-analytics-cta="download_release" data-analytics-placement="get_started_availability">${label}</a><p class="release-requirements"><strong>Requirements:</strong> ${escape(p.requirements)}</p><p class="release-security"><strong>Not notarized by Apple:</strong> On first launch, macOS may block this technical alpha until you approve this specific app in Privacy &amp; Security. Do not disable Gatekeeper.</p><div class="release-next-steps"><a class="text-action" href="/docs/availability/" data-analytics-cta="installation_guide" data-analytics-placement="get_started_availability">Installation &amp; security instructions ↗</a><a class="text-action" href="${escape(p.releaseUrl)}" data-analytics-cta="check_releases" data-analytics-placement="get_started_availability" target="_blank" rel="noopener noreferrer">Release notes &amp; known limits ↗</a>${p.checksumUrl ? `<a class="text-action" href="${escape(p.checksumUrl)}" data-analytics-cta="installer_checksum" data-analytics-placement="get_started_availability">Installer SHA-256 checksum ↗</a>` : ''}</div><p class="release-source">Technical alpha qualified ${escape(p.verifiedOn)}. Verify the download before installing.</p>` : `${planned}<a class="discovery-button" href="https://github.com/jenksed/yourmove-go/releases" data-analytics-cta="check_releases" data-analytics-placement="get_started_availability" target="_blank" rel="noopener noreferrer">Check official releases ↗</a><p class="release-source">Verified October 27, 2026 against <a href="https://github.com/jenksed/yourmove-go/releases">GitHub Releases</a> and the <a href="https://github.com/jenksed/yourmove-go#downloads-and-macos-status">official project README</a>. No public releases were listed. Source builds are available below.</p>`}</div>
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
