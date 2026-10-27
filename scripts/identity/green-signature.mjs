// Green Signature B, approved October 27, 2026.
// Wordmarks preserve the source raster and the exact Wave 2 review color filter.
// The four optical M paths are the approved reconstruction, not an original master.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const bytes = fs.readFileSync(path.join(root, 'public/assets/logo-official.png'));
const digest = crypto.createHash('sha256').update(bytes).digest('hex');
if (digest !== 'c768d24d778a11e0f7708e515ac99e0f2d34d453bca811749a11dc2d62dc0ea9') throw new Error('Original logo source changed; review provenance before exporting.');
const source = 'data:image/png;base64,' + bytes.toString('base64');
export const palettes = {
  light: ['#242933','#E9EEF8','#AAC5FF','#215C43'],
  dark: ['#EDF0F5','#D4E1FB','#AAC5FF','#78B696'],
  'mono-ink': ['#242933','#242933','#242933','#242933'],
  'mono-white': ['#FFFFFF','#FFFFFF','#FFFFFF','#FFFFFF'],
};
const channels = hex => hex.match(/[\da-f]{2}/gi).map(x => parseInt(x,16)/255);
export function filterMarkup(palette) {
  const colors = palette.map(channels);
  const tables = [0,1,2].map(channel => Array.from({length:101}, (_,i) => {
    const v = i/100;
    const index = v < .105 ? 0 : v < .36 ? 3 : v < .78 ? 2 : 1;
    return colors[index][channel].toFixed(5);
  }).join(' '));
  return `<filter id="tone" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".2126 .7152 .0722 0 0 .2126 .7152 .0722 0 0 .2126 .7152 .0722 0 0 0 0 0 1 0"/><feComponentTransfer>${['R','G','B'].map((c,i)=>`<feFunc${c} type="table" tableValues="${tables[i]}"/>`).join('')}</feComponentTransfer></filter>`;
}
const paths = [
  'M443 61Q443 46 455 52L505 86Q513 91 513 101V202Q513 214 503 207L494 201Q489 198 489 190V106Q489 99 483 95L447 70Q443 67 443 61Z',
  'M426 80Q426 65 438 71L480 100Q487 105 487 114V203Q487 216 477 209L468 203Q463 200 463 192V122Q463 115 457 111L430 92Q426 89 426 80Z',
  'M405 93Q405 78 417 84L456 111Q463 116 463 126V203Q463 216 452 209L444 204Q440 201 440 194V137Q440 130 434 126L409 108Q405 105 405 99Z',
  'M376 104Q376 85 389 92L434 124Q442 129 442 139V205L402 163V206H376Z',
];
export function markPaths(mode='light', classes=false) {
  const [front,paper,middle,back] = palettes[mode];
  return paths.map((d,i)=>`<path ${classes?`class="plane-${i}" `:''}fill="${[back,middle,paper,front][i]}" d="${d}"/>`).join('');
}
export function render({kind='wordmark', mode='light', width=717, height=163}={}) {
  if (!palettes[mode]) throw new Error('Unknown approved mode');
  const optical = kind === 'm-flat';
  const viewBox = kind === 'compact' ? '0 0 768 268' : kind === 'm-display' ? '375 48 138 166' : optical ? '371 44 150 174' : '29 49 717 163';
  const description = optical ? 'Path-based optical reconstruction of the approved four-plane M; not an original vector master.' : 'Original raster lettering and geometry, recolored with the exact approved Green Signature B filter; not vector artwork.';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}" role="img" aria-label="YourMove"><title>YourMove — Green Signature B</title><desc>${description}</desc>${optical?markPaths(mode):`<defs>${filterMarkup(palettes[mode])}</defs><image href="${source}" width="768" height="268" filter="url(#tone)"/>`}</svg>`;
}
export function favicon() {
  const dark = palettes.dark;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><title>YourMove</title><desc>Approved Green Signature B optical M reconstruction. Adapted to browser color scheme.</desc><style>.tile{fill:#f5f4f1}@media(prefers-color-scheme:dark){.tile{fill:#191c22}${[dark[3],dark[2],dark[1],dark[0]].map((v,i)=>`.plane-${i}{fill:${v}}`).join('')}}</style><rect class="tile" width="32" height="32" rx="4"/><svg x="3" y="2" width="26" height="28" viewBox="371 44 150 174">${markPaths('light',true)}</svg></svg>`;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const task = JSON.parse(fs.readFileSync(0,'utf8'));
  process.stdout.write(task.kind === 'favicon' ? favicon() : render(task));
}
