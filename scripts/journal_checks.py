"""Verify the served Journal reading journey. Run npm run build first.
Uses the existing optional Playwright/BeautifulSoup/Pillow QA environment.
No analytics ingestion; screenshots remain under artifacts/journal-wave-6/.
"""
from pathlib import Path
from urllib.parse import urlsplit
import json, xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]; PUBLIC=ROOT/'public'; OUT=ROOT/'artifacts/journal-wave-6'
BASE='http://127.0.0.1:8765'; WIDTHS=[320,390,768,1024,1440]
ROUTES=['blog','blog/why-im-building-yourmove','blog/meta-global-ai-developer-hackathon-yourmove','manifesto']
(OUT/'after').mkdir(parents=True,exist_ok=True)
report={'renders':[],'contrast':[],'journeys':[],'interactions':[],'metadata':[],'errors':[]}
titles=[]; descriptions=[]
for route in ROUTES:
 tree=BeautifulSoup((PUBLIC/route/'index.html').read_text(),'html.parser')
 assert len(tree.select('h1'))==1
 assert len(tree.select('[id]'))==len({el['id'] for el in tree.select('[id]')})
 titles.append(tree.title.text);descriptions.append(tree.select_one('meta[name=description]')['content'])
 canonical='https://www.yourmove.run/'+route+'/'
 assert tree.select_one('link[rel=canonical]')['href']==canonical
 og=tree.select_one('meta[property="og:image"]')['content']; assert og.startswith('https://www.yourmove.run/assets/')
 asset=PUBLIC/urlsplit(og).path.lstrip('/'); dims=Image.open(asset).size
 assert dims==(1200,630),(route,dims)
 assert tree.select_one('meta[property="og:image:width"]')['content']=='1200'
 assert tree.select_one('meta[property="og:image:height"]')['content']=='630'
 assert tree.select_one('meta[name="twitter:image"]')['content']==og
 if route.startswith('blog/'):
  schema=json.loads(tree.select_one('script[type="application/ld+json"]').string)
  assert schema['@type']=='BlogPosting' and schema['author']['name']=='Joshua Jenks'
  assert schema['mainEntityOfPage']['@id']==canonical
  assert schema['datePublished'].startswith('2026-10-26')
  assert schema['image']==og
  assert tree.select_one('meta[property="article:published_time"]')['content']==schema['datePublished']
 for el in tree.select('[href],[src]'):
  value=el.get('href',el.get('src','')); parsed=urlsplit(value)
  if parsed.scheme or parsed.netloc or not value:continue
  target=PUBLIC/parsed.path.lstrip('/') if parsed.path else PUBLIC/route/'index.html'
  if target.is_dir():target/='index.html'
  assert target.exists(),(route,value)
  if parsed.fragment and target.suffix=='.html':assert BeautifulSoup(target.read_text(),'html.parser').find(id=parsed.fragment),(route,value)
 report['metadata'].append({'route':route,'canonical':canonical,'socialImage':str(asset.relative_to(PUBLIC)),'dimensions':dims})
assert len(set(titles))==len(titles) and len(set(descriptions))==len(descriptions)
feed=ET.parse(PUBLIC/'feed.xml').getroot();items=feed.findall('./channel/item');assert len(items)==2
sitemap={el.text for el in ET.parse(PUBLIC/'sitemap.xml').getroot().iter() if el.tag.endswith('}loc')}
for route in ROUTES:assert 'https://www.yourmove.run/'+route+'/' in sitemap
for item in items:
 assert item.findtext('link') in sitemap
 assert item.findtext('guid')==item.findtext('link')
 assert item.findtext('pubDate')=='Mon, 26 Oct 2026 12:00:00 GMT'
CONTRAST=r'''el=>{
 const s=getComputedStyle(el),rgba=c=>(c.match(/[\d.]+/g)||[]).map(Number);
 let layers=[];for(let x=el;x;x=x.parentElement)layers.unshift(x);
 const bg=layers.reduce((a,x)=>{let c=rgba(getComputedStyle(x).backgroundColor),t=c.length===4?c[3]:1;return a.map((v,i)=>c[i]*t+v*(1-t))},[255,255,255]);
 const lum=c=>c.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
 const a=lum(rgba(s.color)),b=lum(bg);return {ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),size:parseFloat(s.fontSize),weight:parseFloat(s.fontWeight)};
}'''
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 context=browser.new_context(permissions=['clipboard-read','clipboard-write'],reduced_motion='reduce')
 page=context.new_page()
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 page.on('console',lambda e:report['errors'].append(e.text) if e.type=='error' else None)
 page.on('response',lambda r:report['errors'].append(f'{r.status} {r.url}') if r.url.startswith(BASE) and r.status>=400 else None)
 for route in ROUTES:
  for width in WIDTHS:
   page.set_viewport_size({'width':width,'height':900 if width>768 else 844})
   assert page.goto(f'{BASE}/{route}/',wait_until='networkidle').status==200;page.evaluate('document.fonts.ready')
   assert page.evaluate('document.documentElement.scrollWidth')<=width+1,(route,width,'overflow')
   assert page.evaluate('document.fonts.check("400 20px Jost")')
   assert page.locator('h1').evaluate('(e)=>getComputedStyle(e).fontFamily').startswith('Jost')
   assert page.evaluate('typeof window.YourMoveAnalytics')=='undefined'
   for el in page.locator('main h1,main h2,main h3,main button').all():
    if el.is_visible():assert el.evaluate('(e)=>e.scrollWidth<=e.clientWidth+1'),(route,width,'clipped heading/control')
   for img in page.locator('main img').all():
    img.scroll_into_view_if_needed();assert img.evaluate('(e)=>e.complete&&e.naturalWidth>0')
    assert img.evaluate('(e)=>Math.abs(e.clientWidth/e.clientHeight-e.naturalWidth/e.naturalHeight)<.03'),(route,width,'cropped image')
   ratios=[]
   for el in page.locator('main p,main h1,main h2,main h3,main a,main button,main cite,main time,main figcaption,main span,main em').all():
    if not el.is_visible() or not el.inner_text().strip():continue
    c=el.evaluate(CONTRAST);threshold=3 if c['size']>=24 or (c['size']>=18.66 and c['weight']>=700) else 4.5
    assert c['ratio']>=threshold,(route,width,el.inner_text(),c);ratios.append(c['ratio'])
   report['contrast'].append({'route':route,'width':width,'lowestRatio':round(min(ratios),2)})
   page.evaluate('window.scrollTo(0,0)');page.screenshot(path=str(OUT/'after'/f'{route.replace("/","-")}-{width}.png'),full_page=True)
   report['renders'].append({'route':route,'width':width,'height':page.evaluate('document.documentElement.scrollHeight'),'overflow':0})
  print('PASS editorial renders',route,flush=True)
 # Follow the reading journey with real local navigation, including contextual product links.
 for width in [390,1440]:
  page.set_viewport_size({'width':width,'height':900});page.goto(BASE+'/blog/')
  page.locator('.ym-read-link').focus();assert page.locator('.ym-read-link').evaluate('(e)=>getComputedStyle(e).outlineStyle')=='solid'
  page.keyboard.press('Enter');page.wait_for_url(BASE+'/blog/why-im-building-yourmove/')
  page.locator('.ym-prose a[href="/how-it-works/"]').click();page.wait_for_url(BASE+'/how-it-works/');page.go_back()
  page.locator('.ym-prose a[href="/evidence/"]').click();page.wait_for_url(BASE+'/evidence/');page.go_back()
  copy=page.locator('[data-copy-article]');copy.focus();assert copy.evaluate('(e)=>getComputedStyle(e).outlineStyle')=='solid'
  page.keyboard.press('Enter');page.wait_for_function("document.querySelector('[data-copy-status]').textContent==='Article link copied.'")
  assert page.evaluate('navigator.clipboard.readText()')=='https://www.yourmove.run/blog/why-im-building-yourmove/'
  page.locator('.ym-article-related a[href="/manifesto/"]').click();page.wait_for_url(BASE+'/manifesto/')
  page.locator('.manifesto-postscript a').click();page.wait_for_url(BASE+'/blog/why-im-building-yourmove/')
  page.locator('.ym-blog-back').click();page.wait_for_url(BASE+'/blog/')
  page.locator('.ym-story h3 a').click();page.wait_for_url(BASE+'/blog/meta-global-ai-developer-hackathon-yourmove/')
  page.locator('.ym-prose a[href="/evidence/"]').click();page.wait_for_url(BASE+'/evidence/')
  report['journeys'].append({'width':width,'result':'Journal → founder → workflow/evidence → Manifesto → founder → Journal → hackathon → evidence'})
 # Clipboard denial preserves a usable sharing instruction.
 page.goto(BASE+'/blog/why-im-building-yourmove/');page.evaluate("Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('QA denial'))}})")
 page.locator('[data-copy-article]').click();page.wait_for_function("document.querySelector('[data-copy-status]').textContent.includes('Copy the address')")
 # Exercise Markdown styles absent from the current articles without publishing filler content.
 page.set_viewport_size({'width':320,'height':844})
 page.locator('.ym-prose').evaluate('''e=>e.innerHTML='<h2>QA typography fixture</h2><blockquote><p>A quotation from a test fixture.</p></blockquote><ul><li>A list item</li></ul><pre><code>'+('long_code_line'.repeat(30))+'</code></pre><table><tr><td>'+('wide table content '.repeat(30))+'</td></tr></table><p><img src="/assets/blog/yourmove-meta-hackathon-featured.webp" alt="QA illustration"></p><p><em>QA caption.</em></p>' ''')
 assert page.evaluate('document.documentElement.scrollWidth')<=321
 assert page.locator('.ym-prose blockquote').evaluate('(e)=>parseFloat(getComputedStyle(e).borderLeftWidth)')==2
 assert page.locator('.ym-prose li').evaluate('(e)=>getComputedStyle(e).listStyleType')=='disc'
 # Reading and navigation remain functional without JavaScript, at every width.
 nojs=browser.new_context(java_script_enabled=False);pg=nojs.new_page()
 for width in WIDTHS:
  pg.set_viewport_size({'width':width,'height':844})
  for route in ROUTES:
   pg.goto(BASE+'/'+route+'/',wait_until='networkidle')
   assert pg.evaluate('document.documentElement.scrollWidth')<=width+1
   assert pg.locator('.site-nav').is_visible()
   if route.startswith('blog/'):
    assert pg.locator('.ym-prose').inner_text().strip()
    assert not pg.locator('[data-copy-article]').is_visible()
 nojs.close()
 report['interactions']=['keyboard reading links and focus','real clipboard URL and denial fallback','uncropped image aspect ratios','no-JS reading/navigation at five widths','local analytics exclusion','quote/list/code/table/caption QA fixture at 320px']
 assert not report['errors'],report['errors']
 browser.close()
(OUT/'verification.json').write_text(json.dumps(report,indent=2))
print('PASS 20 editorial renders, 20 no-JS renders, metadata/assets/RSS/sitemap, contrast, keyboard/clipboard, privacy boundary and reading journeys. No console errors or failed local responses.')
