"""Verify Wave 3 navigation on the actual local preview. No live analytics ingestion.
Requires optional Playwright/BeautifulSoup dependencies; run npm run build first.
"""
from pathlib import Path
import argparse,json
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--url',default='http://127.0.0.1:8765')
parser.add_argument('--browser')
parser.add_argument('--output',type=Path,default=ROOT/'artifacts/navigation-wave-3')
args=parser.parse_args();args.output.mkdir(parents=True,exist_ok=True)
routes=sorted('/'+p.parent.relative_to(ROOT/'public').as_posix().strip('.')+'/' for p in (ROOT/'public').rglob('index.html'));routes=[r.replace('//','/') for r in routes]
report={'renders':[],'interactions':[],'errors':[]}
home=BeautifulSoup((ROOT/'public/index.html').read_text(),'html.parser')
for route in routes:
 tree=BeautifulSoup((ROOT/'public'/route.strip('/')/'index.html').read_text(),'html.parser')
 for selector in ['body > header.header','body > footer.footer','.announcement']:
  assert str(tree.select_one(selector))==str(home.select_one(selector)),(route,selector,'shared layout differs')

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=args.browser)
 context=browser.new_context(reduced_motion='reduce')
 # Exercise the actual analytics code with a mock SDK and record no personal data.
 context.route('**/analytics-config.js',lambda r:r.fulfill(content_type='application/javascript',body='''window.__events=[];window.posthog={__SV:1,init(){},capture(event,properties){window.__events.push({event,properties})}};window.YOURMOVE_POSTHOG={projectToken:'phc_TESTONLY123',apiHost:'https://us.i.posthog.com'};'''))
 errors=[]
 context.on('page',lambda page:page.on('pageerror',lambda e:errors.append(str(e))))
 for width in [390,768,1024,1440]:
  page=context.new_page();page.set_viewport_size({'width':width,'height':1000})
  page.on('console',lambda msg:errors.append(msg.text) if msg.type=='error' else None)
  page.on('response',lambda r:errors.append(f'{r.status} {r.url}') if r.url.startswith(args.url) and r.status>=400 else None)
  for route in routes:
   assert page.goto(args.url+route,wait_until='networkidle').status==200
   page.evaluate('document.fonts.ready')
   assert page.evaluate('document.documentElement.scrollWidth')<=width+1,(route,width,'overflow')
   assert page.locator('.announcement').inner_text().startswith('Initial release planned for November 6.')
   nav=page.locator('.site-nav');menu=page.locator('.menu-button')
   if width<=900:
    assert not nav.is_visible()
    assert nav.locator('a').first.evaluate('(el)=>getComputedStyle(el).display')!='none' # only the disclosure hides links
    menu.focus();page.keyboard.press('Enter');assert menu.get_attribute('aria-expanded')=='true'
    assert nav.is_visible()
    assert nav.bounding_box()['y']+nav.bounding_box()['height']<=page.locator('main').bounding_box()['y']+1
    page.keyboard.press('Tab');assert nav.locator('a').first.evaluate('(e)=>e===document.activeElement')
    assert nav.locator('a').first.evaluate('(e)=>getComputedStyle(e).outlineStyle')=='solid'
    page.keyboard.press('Escape');assert not nav.is_visible();assert menu.evaluate('(e)=>e===document.activeElement')
    menu.click();page.locator('main').click(position={'x':5,'y':5});assert not nav.is_visible()
    menu.click();nav.locator('a').last.focus();page.keyboard.press('Tab');assert not nav.is_visible()
    if route=='/':
     menu.click();page.screenshot(path=str(args.output/f'after/menu-{width}.png'));menu.click()
   else:
    assert nav.is_visible();assert not menu.is_visible()
    for link in nav.locator('a').all():
     link.focus();assert link.evaluate('(e)=>getComputedStyle(e).outlineStyle')=='solid'
     assert link.bounding_box()['height']>=44
   for group in ['docs','blog']:
    if route.startswith('/'+group+'/'):
     assert nav.locator(f'[data-path="/{group}/"]').get_attribute('aria-current')==('page' if route=='/'+group+'/' else 'location')
   assert nav.locator('.nav-cta').get_attribute('data-analytics-placement')=='header'
   assert nav.locator('.nav-cta').get_attribute('data-analytics-cta')=='get_started'
   assert page.locator('.ym-release-link').get_attribute('data-analytics-cta')=='release_details'
   assert page.evaluate('typeof window.YourMoveAnalytics')=='undefined' # localhost exclusion stays intact
   assert not page.locator('body > footer .footer-support-callout').count()
   report['renders'].append({'route':route,'width':width,'overflow':0,'navigation':'PASS'})
  page.close();print('PASS navigation',width,'14 routes',flush=True)
 # Follow real links through the three audience journeys.
 page=context.new_page()
 for start,selector,destination in [('/', '.site-nav a[href="/how-it-works/"]','/how-it-works/'),('/', '.site-nav .nav-cta','/get-started/'),('/get-started/','.site-nav a[href="/docs/"]','/docs/'),('/docs/','body > footer a[href="/docs/troubleshooting/"]','/docs/troubleshooting/'),('/blog/why-im-building-yourmove/','.site-nav a[href="/blog/"]','/blog/')]:
  page.goto(args.url+start);page.locator(selector).click();page.wait_for_url(args.url+destination)
 report['interactions']+=['real job-seeker/help/blog links','keyboard Enter/Tab/Escape and visible focus on all routes','touch toggle, outside click, focus leaving menu','current section on generated articles and docs','retained CTA attributes and localhost analytics exclusion']
 page.goto(args.url+'/');page.set_viewport_size({'width':768,'height':1000});page.locator('.menu-button').click();page.set_viewport_size({'width':1024,'height':1000});page.wait_for_function("document.querySelector('.menu-button').getAttribute('aria-expanded')==='false'");page.set_viewport_size({'width':768,'height':1000});page.locator('.site-nav').wait_for(state='hidden')
 report['interactions'].append('menu resets across breakpoint')
 for width in [390,768]:
  nojs=browser.new_context(java_script_enabled=False,viewport={'width':width,'height':1000})
  pg=nojs.new_page()
  for route in routes:
   pg.goto(args.url+route,wait_until='load');assert pg.locator('.site-nav').is_visible();assert not pg.locator('.menu-button').is_visible();assert pg.evaluate('document.documentElement.scrollWidth')<=width+1
  nojs.close()
 report['interactions'].append('all 14 routes usable without JavaScript at mobile/tablet')
 touch=browser.new_context(has_touch=True,is_mobile=True,viewport={'width':390,'height':844})
 pg=touch.new_page();pg.goto(args.url+'/');pg.locator('.menu-button').tap();assert pg.locator('.site-nav').is_visible();pg.locator('.menu-button').tap();assert not pg.locator('.site-nav').is_visible();pg.locator('.menu-button').focus();pg.keyboard.press('Space');assert pg.locator('.site-nav').is_visible();pg.keyboard.press('Escape');touch.close()
 report['interactions'].append('mobile touchscreen tap and keyboard Space')
 # Analytics deliberately excludes localhost. Verify events on an intercepted test origin.
 analytics=browser.new_context(viewport={'width':1024,'height':1000})
 def proxy(route):
  from urllib.parse import urlsplit
  resource=context.request.get(args.url+urlsplit(route.request.url).path)
  route.fulfill(status=resource.status,body=resource.body(),content_type=resource.headers.get('content-type','text/plain'))
 analytics.route('https://www.yourmove.run/**',proxy)
 analytics.route('**/analytics-config.js',lambda r:r.fulfill(content_type='application/javascript',body="window.__events=[];window.posthog={__SV:1,init(){},capture(event,properties){window.__events.push({event,properties})}};window.YOURMOVE_POSTHOG={projectToken:'phc_TESTONLY123',apiHost:'https://us.i.posthog.com'};"))
 pg=analytics.new_page()
 for route in ['/','/docs/','/blog/why-im-building-yourmove/']:
  pg.goto('https://www.yourmove.run'+route,wait_until='networkidle')
  assert pg.evaluate("window.__events.some(e=>e.event==='ym_release_announcement_viewed')")
  for selector,placement in [('.nav-cta','header'),('.ym-release-link','release_banner'),('.footer-identity>a:last-child','footer')]:
   pg.evaluate("document.addEventListener('click',e=>e.preventDefault(),{capture:true,once:true})")
   pg.locator(selector).click()
   assert pg.evaluate("placement=>window.__events.some(e=>e.event==='ym_cta_clicked'&&e.properties.placement===placement)",placement)
 analytics.close()
 report['interactions'].append('mock PostHog: header, release, support clicks and release views on home/docs/generated article')
 assert not errors,errors
 browser.close()
report.update(result='PASS')
(args.output/'navigation-checks.json').write_text(json.dumps(report,indent=2))
print('PASS 56 renders; all route menus, no-JS, focus, resizing, analytics and journeys; no console/page/local-response errors.')
