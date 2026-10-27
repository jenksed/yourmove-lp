/* Review-only rendering. The wordmark is the original bitmap inside an SVG filter.
 * The optical M paths are a manual reconstruction, never an original vector master.
 * No production source files or exported asset pack are generated here. */
'use strict';
const source = '../../public/assets/logo-official.png';
const directions = {
  a: {name:'Cobalt layers', label:'A', role:'QUIET INK / COORDINATED', note:'A direct palette match: graphite lettering and a cobalt rear plane. Cohesive, with less of the established green signature.', light:['#242933','#DCE6FA','#8DA9DF','#3459A5'], dark:['#EDF0F5','#DCE6FA','#8DA9DF','#AAC5FF']},
  b: {name:'Green signature', label:'B', role:'RECOMMENDED / CONTINUITY', note:'Graphite and light cobalt frame a deliberate green rear plane. The identity keeps its history alongside cobalt product actions.', light:['#242933','#E9EEF8','#AAC5FF','#215C43'], dark:['#EDF0F5','#D4E1FB','#AAC5FF','#78B696']},
  c: {name:'Graphite relief', label:'C', role:'QUIET INK / TONAL', note:'A restrained graphite family for editorial and neutral contexts. Strong tonal hierarchy, but a less distinctive primary signature.', light:['#242933','#E5E8ED','#A2ABB8','#606773'], dark:['#EDF0F5','#D9DDE3','#A2ABB8','#8792A0']}
};
let sequence=0;
const channels = hex => hex.match(/[\da-f]{2}/gi).map(x=>parseInt(x,16)/255);
function filterMarkup(id,palette){
  // Perceptual source-tone bands separate ink, green, sage, and white planes.
  // Keep source alpha, source outlines, geometry, and lettering intact.
  const colors=palette.map(channels);
  const tables=[0,1,2].map(channel=>Array.from({length:101},(_,i)=>{
    const v=i/100;
    let index=v<.105?0:v<.36?3:v<.78?2:1;
    return colors[index][channel].toFixed(5);
  }).join(' '));
  return `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".2126 .7152 .0722 0 0 .2126 .7152 .0722 0 0 .2126 .7152 .0722 0 0 0 0 0 1 0"/><feComponentTransfer>${['R','G','B'].map((c,i)=>`<feFunc${c} type="table" tableValues="${tables[i]}"/>`).join('')}</feComponentTransfer></filter>`;
}
function wordmark(key,mode='light',extra=''){
 const d=directions[key],id='tone-'+(++sequence);
 return `<svg class="wordmark ${extra}" viewBox="29 49 717 163" width="717" height="163" role="img" aria-label="YourMove, ${d.name}, ${mode} surface"><defs>${filterMarkup(id,d[mode])}</defs><image href="${source}" width="768" height="268" filter="url(#${id})"/></svg>`;
}
function sourceSymbol(key,mode='light'){
 const d=directions[key],id='tone-'+(++sequence);
 return `<svg class="symbol" viewBox="375 48 138 166" width="138" height="166" role="img" aria-label="${d.name}, source-preserving layered M on ${mode}"><defs>${filterMarkup(id,d[mode])}</defs><image href="${source}" width="768" height="268" filter="url(#${id})"/></svg>`;
}
function opticalSymbol(key,mode='light',size=null){
 const [front,paper,middle,back]=directions[key][mode];
 // Four planes follow the source's stepped shoulders, radii, and front cutout.
 // Flat silhouette study: no bevel, shadow, micro-outline, or substitute letter.
 return `<svg class="symbol optical" viewBox="371 44 150 174" ${size?`width="${size}" height="${size}"`:'width="150" height="174"'} role="img" aria-label="${directions[key].name}, flat reconstructed M${size?', '+size+' pixels':''}">
 <path fill="${back}" d="M443 61Q443 46 455 52L505 86Q513 91 513 101V202Q513 214 503 207L494 201Q489 198 489 190V106Q489 99 483 95L447 70Q443 67 443 61Z"/>
 <path fill="${middle}" d="M426 80Q426 65 438 71L480 100Q487 105 487 114V203Q487 216 477 209L468 203Q463 200 463 192V122Q463 115 457 111L430 92Q426 89 426 80Z"/>
 <path fill="${paper}" d="M405 93Q405 78 417 84L456 111Q463 116 463 126V203Q463 216 452 209L444 204Q440 201 440 194V137Q440 130 434 126L409 108Q405 105 405 99Z"/>
 <path fill="${front}" d="M376 104Q376 85 389 92L434 124Q442 129 442 139V205L402 163V206H376Z"/>
 </svg>`;
}
const swatches=d=>`<div class="swatches">${d.light.map(hex=>`<span class="swatch" style="--swatch:${hex}" title="${hex}"></span>`).join('')}<span>FOUR PLANES</span></div>`;
document.querySelector('#direction-grid').innerHTML=Object.entries(directions).map(([key,d])=>`<article class="direction ${key==='b'?'recommended':''}"><div class="direction-title"><p class="eyebrow">${d.label} / ${d.role}</p><h3>${d.name}</h3></div><div class="word-stage light">${wordmark(key)}<span class="stage-label">CANVAS / #F5F4F1</span></div><div class="word-stage dark">${wordmark(key,'dark')}<span class="stage-label">GRAPHITE / #191C22</span></div><div class="direction-info">${swatches(d)}<p>${d.note}</p></div></article>`).join('');
document.querySelector('#navigation-comparison').innerHTML=`<div class="nav-row head"><span>TREATMENT</span><span>DESKTOP / VISIBLE 153px</span><span>MOBILE / VISIBLE 136px</span></div><div class="nav-row"><span class="nav-name">Existing source</span><img class="nav-original desktop-mark" src="${source}" width="163" height="57" alt="Original YourMove at desktop navigation size"><img class="nav-original mobile-mark" src="${source}" width="145" height="51" alt="Original YourMove at mobile navigation size"></div>`+Object.entries(directions).map(([key,d])=>`<div class="nav-row"><span class="nav-name">${d.label} · ${d.name}</span><div style="width:153px" class="desktop-mark">${wordmark(key)}</div><div style="width:136px" class="mobile-mark">${wordmark(key)}</div></div>`).join('');
document.querySelector('#small-grid').innerHTML=Object.entries(directions).map(([key,d])=>`<article class="small-card"><h3>${d.label} · ${d.name}</h3><span class="sample-label">SOURCE M / ORIGINAL GEOMETRY</span><div class="symbol-pair"><div class="symbol-stage">${sourceSymbol(key)}<span class="stage-label">LIGHT</span></div><div class="symbol-stage dark">${sourceSymbol(key,'dark')}<span class="stage-label">DARK</span></div></div><span class="sample-label">FLAT M / OPTICAL RECONSTRUCTION</span><div class="favicon-tray"><div class="favicon-sample">${opticalSymbol(key,'light',32)}<span>32px</span></div><div class="favicon-sample">${opticalSymbol(key,'light',16)}<span>16px</span></div></div><div class="favicon-tray dark-tray"><div class="favicon-sample">${opticalSymbol(key,'dark',32)}<span>32px</span></div><div class="favicon-sample">${opticalSymbol(key,'dark',16)}<span>16px</span></div></div><div class="avatar-row"><div class="avatar light">${opticalSymbol(key)}</div><div class="avatar dark">${opticalSymbol(key,'dark')}</div></div><div class="avatar-label">SQUARE SOCIAL AVATARS / LIGHT &amp; DARK</div></article>`).join('');
function selectDirection(key){
 for(const button of document.querySelectorAll('[data-direction]'))button.setAttribute('aria-pressed',String(button.dataset.direction===key));
 for(const slot of document.querySelectorAll('[data-placement]'))slot.innerHTML=wordmark(key,slot.dataset.placement==='word-dark'?'dark':'light');
 document.querySelector('#active-label').textContent=`Showing ${directions[key].label} · ${directions[key].name}`;
}
for(const button of document.querySelectorAll('[data-direction]'))button.addEventListener('click',()=>selectDirection(button.dataset.direction));
selectDirection('b');
