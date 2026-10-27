"""Wave 5 served journey and launch-state checks. Chromium only; no live analytics ingestion.
Run npm run build and node scripts/availability_checks.mjs first.
"""
from pathlib import Path
from urllib.parse import urlsplit
import json
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];PUBLIC=ROOT/'public';OUT=ROOT/'artifacts/product-discovery-wave-5'
BASE='http://127.0.0.1:8765';ROUTES=['how-it-works','evidence','get-started'];WIDTHS=[320,390,768,1024,1440]
(OUT/'after').mkdir(parents=True,exist_ok=True)
report={'renders':[],'journeys':[],'interactions':[],'contrast':[],'errors':[]}
for route in ROUTES:
 tree=BeautifulSoup((PUBLIC/route/'index.html').read_text(),'html.parser')
 assert len(tree.select('h1'))==1
 assert len(tree.select('[id]'))==len({el['id'] for el in tree.select('[id]')})
 for el in tree.select('[href],[src],[srcset]'):
  for url in [el.get('href',''),el.get('src',''),el.get('srcset','')]:
   if not url or not url.startswith(('/','#')):continue
   parsed=urlsplit(url);target=PUBLIC/parsed.path.lstrip('/') if parsed.path else PUBLIC/route/'index.html'
   if target.is_dir():target/='index.html'
   assert target.exists(),(route,url)
   if parsed.fragment:assert BeautifulSoup(target.read_text(),'html.parser').find(id=parsed.fragment),(route,url)
CONTRAST=r'''el=>{
 const s=getComputedStyle(el), rgba=c=>(c.match(/[\d.]+/g)||[]).map(Number);
 let layers=[];for(let x=el;x;x=x.parentElement)layers.unshift(x);
 const bg=layers.reduce((a,x)=>{let c=rgba(getComputedStyle(x).backgroundColor),t=c.length===4?c[3]:1;return a.map((v,i)=>c[i]*t+v*(1-t))},[255,255,255]);
 const lum=c=>c.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
 const fg=rgba(s.color);const a=lum(fg),b=lum(bg);return {ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),size:parseFloat(s.fontSize),weight:parseFloat(s.fontWeight)};
}'''
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 context=browser.new_context(reduced_motion='reduce',permissions=['clipboard-read','clipboard-write'])
 page=context.new_page()
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 page.on('console',lambda e:report['errors'].append(e.text) if e.type=='error' else None)
 page.on('response',lambda r:report['errors'].append(f'{r.status} {r.url}') if r.url.startswith(BASE) and r.status>=400 else None)
 for route in ROUTES:
  for width in WIDTHS:
   page.set_viewport_size({'width':width,'height':900 if width>768 else 844})
   assert page.goto(f'{BASE}/{route}/',wait_until='networkidle').status==200
   page.evaluate('document.fonts.ready')
   assert page.evaluate('document.documentElement.scrollWidth')<=width+1,(route,width,'overflow')
   assert page.locator('h1').evaluate('(e)=>getComputedStyle(e).fontFamily').startswith('Jost')
   assert page.evaluate('document.fonts.check("500 18px Jost")')
   assert page.evaluate('typeof window.YourMoveAnalytics')=='undefined','localhost privacy boundary'
   for el in page.locator('.discovery h1,.discovery h2,.discovery h3,.discovery button,.discovery summary').all():
    if el.is_visible():assert el.evaluate('(el)=>el.scrollWidth<=el.clientWidth+1'),(route,width,'element clipping',el.inner_text())
   page.screenshot(path=str(OUT/'after'/f'{route}-{width}.png'),full_page=True)
   report['renders'].append({'route':route,'width':width,'overflow':0,'height':page.evaluate('document.documentElement.scrollHeight')})
  # Check every visible authored text leaf on the flat Quiet Ink surfaces.
  ratios=[]
  for el in page.locator('.discovery p,.discovery h1,.discovery h2,.discovery h3,.discovery a,.discovery button,.discovery dt,.discovery dd,.discovery span,.discovery figcaption,.discovery summary,.discovery blockquote').all():
   if not el.is_visible() or not el.inner_text().strip():continue
   c=el.evaluate(CONTRAST);threshold=3 if c['size']>=24 or (c['size']>=18.66 and c['weight']>=700) else 4.5
   assert c['ratio']>=threshold,(route,el.inner_text(),c)
   ratios.append(c['ratio'])
  report['contrast'].append({'route':route,'lowestRatio':round(min(ratios),2)})
 # Complete real navigation from homepage through all three chapters.
 page.goto(BASE+'/');page.locator('.site-nav a[href="/how-it-works/"]').click();page.wait_for_url(BASE+'/how-it-works/')
 for anchor in ['save','prepare','handoff','decide']:
  page.locator('.journey-nav a[href="#'+anchor+'"]').click();assert page.locator('#'+anchor).is_visible()
 page.locator('[data-path-choice=manual]').focus();page.keyboard.press('Enter');assert page.locator('#manual-path').is_visible();assert not page.locator('#supported-path').is_visible()
 assert page.locator('[data-path-choice=manual]').evaluate('(el)=>getComputedStyle(el).outlineStyle')=='solid'
 page.keyboard.press('Shift+Tab');page.keyboard.press('Space');assert page.locator('#supported-path').is_visible()
 page.locator('[data-path-choice=manual]').click();page.locator('.path-example').screenshot(path=str(OUT/'after/manual-path-1440.png'))
 page.locator('.chapter-next a[href="/evidence/"]').click();page.wait_for_url(BASE+'/evidence/')
 page.locator('.actual-evidence summary').focus();page.keyboard.press('Enter');assert page.locator('.actual-evidence img').is_visible()
 page.locator('.chapter-next a[href="/get-started/"]').click();page.wait_for_url(BASE+'/get-started/')
 if page.locator('[data-analytics-cta=download_release]').count():
  assert 'is available' in page.locator('#availability-title').inner_text()
 else:
  assert 'official app download' in page.locator('#availability-title').inner_text()
 page.locator('.build-instructions summary').first.focus();page.keyboard.press('Space')
 copy=page.locator('.gs-console button');copy.click();assert page.evaluate('navigator.clipboard.readText()')==copy.get_attribute('data-copy-text')
 page.locator('.build-instructions summary').nth(1).click();copy=page.locator('.browser-console button');copy.click();assert page.evaluate('navigator.clipboard.readText()')==copy.get_attribute('data-copy-text')
 assert page.locator('.availability-section [data-analytics-cta=check_releases]').get_attribute('href').startswith('https://github.com/jenksed/yourmove-go/releases')
 report['journeys'].append('Homepage → How It Works → Career Evidence → Get Started; real stage anchors, release URL and both copy-command payloads')
 report['interactions']+=['Enter/Space support comparison and source/evidence disclosures','Tab order and visible focus','real Mac and browser clipboard contents','localhost excludes PostHog']
 # Touch and normal-motion mode do not depend on animation.
 touch=browser.new_context(has_touch=True,is_mobile=True,viewport={'width':390,'height':844},reduced_motion='no-preference')
 pg=touch.new_page();pg.goto(BASE+'/how-it-works/');pg.locator('[data-path-choice=manual]').tap();assert pg.locator('#manual-path').is_visible();assert pg.evaluate('document.documentElement.scrollWidth')==390
 pg.screenshot(path=str(OUT/'after/manual-path-390.png'),full_page=True);touch.close()
 report['interactions'].append('touch comparison at 390px; normal and reduced motion')
 # All primary content and both support paths remain available without scripts.
 for width in WIDTHS:
  nojs=browser.new_context(java_script_enabled=False,viewport={'width':width,'height':900});pg=nojs.new_page()
  for route in ROUTES:
   pg.goto(f'{BASE}/{route}/');assert pg.evaluate('document.documentElement.scrollWidth')<=width+1
   if route=='how-it-works':assert pg.locator('#supported-path').is_visible() and pg.locator('#manual-path').is_visible()
   if route=='get-started':pg.locator('.build-instructions summary').first.click();assert pg.locator('.gs-console').is_visible()
  nojs.close()
 report['interactions'].append('all 3 pages without JavaScript at all 5 widths')
 # Preview the qualified-release fixture on an intercepted local test origin; never fetch a fake asset.
 fixture=(OUT/'release-fixture.html').read_text();config=(OUT/'release-fixture-config.js').read_text()
 launch=browser.new_context()
 launch.route(BASE+'/get-started/',lambda r:r.fulfill(content_type='text/html',body=fixture))
 launch.route('**/release-config.js',lambda r:r.fulfill(content_type='application/javascript',body=config))
 pg=launch.new_page()
 for width in [320,390,768,1024,1440]:
  pg.set_viewport_size({'width':width,'height':900});pg.goto(BASE+'/get-started/',wait_until='networkidle')
  assert pg.locator('[data-analytics-cta=download_release]').count()==1
  assert 'v0.0.0-qa available' in pg.locator('.announcement').inner_text()
  assert pg.locator('.ym-release-announcement').count()==0
  assert pg.evaluate('document.documentElement.scrollWidth')<=width+1
  if width in [390,1440]:pg.screenshot(path=str(OUT/'after'/f'release-fixture-{width}.png'),full_page=True)
 launch.close()
 report['interactions'].append('qualified-release fixture rendered at 5 widths; static status/asset/requirements and no planned banner')
 browser.close()
assert not report['errors'],report['errors']
(OUT/'verification.json').write_text(json.dumps(report,indent=2))
print(json.dumps({'status':'PASS','renders':len(report['renders']),'contrast':report['contrast'],'interactions':report['interactions'],'errors':report['errors']},indent=2))
