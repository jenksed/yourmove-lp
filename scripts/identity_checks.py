"""Verify Green Signature B assets, metadata, source preservation, and live placements.

Optional QA dependencies: Pillow, BeautifulSoup, Playwright + installed Chromium.
The baseline is a saved public/ directory from before this identity integration.
"""
from pathlib import Path
from urllib.parse import urlsplit
import argparse, json, hashlib, xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--url',default='http://[::1]:8765')
parser.add_argument('--browser',required=True)
parser.add_argument('--baseline-public',type=Path,required=True)
parser.add_argument('--output',type=Path,default=ROOT/'artifacts/identity-wave-2/final/identity')
args=parser.parse_args();args.output.mkdir(parents=True,exist_ok=True)
report={'routes':[],'preserved':[],'placements':[]}
for f in sorted(PUBLIC.rglob('index.html')):
    route='/'+str(f.parent.relative_to(PUBLIC)).strip('.')+'/' if f.parent!=PUBLIC else '/'
    s=BeautifulSoup(f.read_text(),'html.parser')
    assert len(s.select('header .site-logo img'))==1,f
    assert s.select_one('header .site-logo img')['src']=='/assets/identity/yourmove-wordmark-navigation-light.png',f
    assert s.select_one('footer img')['src']=='/assets/identity/yourmove-wordmark-navigation-dark.png',f
    assert 'logo-official.png' not in f.read_text(),f
    for selector,key in [('meta[property="og:image"]','content'),('meta[name="twitter:image"]','content'),('link[rel="apple-touch-icon"]','href')]:
        tag=s.select_one(selector);assert tag,(f,selector)
        local=PUBLIC/urlsplit(tag[key]).path.lstrip('/');assert local.is_file(),(f,local)
        with Image.open(local) as im:
            assert im.size==((180,180) if key=='href' else (1200,630)),local
    assert s.select_one('meta[property="og:image:width"]')['content']=='1200'
    assert s.select_one('meta[property="og:image:height"]')['content']=='630'
    assert s.select_one('meta[name="twitter:card"]')['content']=='summary_large_image'
    assert s.select_one('link[type="image/svg+xml"]')['href'].startswith('/assets/identity/favicon.svg')
    before=BeautifulSoup((args.baseline_public/f.relative_to(PUBLIC)).read_text(),'html.parser')
    assert before.body.get_text(' ',strip=True)==s.body.get_text(' ',strip=True),(f,'visible copy changed')
    attrs=lambda tree:[{k:v for k,v in el.attrs.items() if k in ['href','target','rel'] or k.startswith('data-analytics')} for el in tree.body.select('a,button,input,details')]
    assert attrs(before)==attrs(s),(f,'navigation or analytics changed')
    report['routes'].append(route)
for f in args.baseline_public.rglob('*'):
    if not f.is_file():continue
    rel=f.relative_to(args.baseline_public);current=PUBLIC/rel
    if f.suffix in ['.js','.css']:
        if str(rel) in ['styles.css','docs/docs.css']:
            assert f.read_text().replace('filter:brightness(0) invert(1)','filter:none')==current.read_text(),rel
        else:assert f.read_bytes()==current.read_bytes(),rel
        report['preserved'].append(str(rel))
    if rel.parts[0]=='assets':assert f.read_bytes()==current.read_bytes(),('existing illustration changed',rel)
for mode in ['light','dark']:
    file=PUBLIC/f'assets/identity/yourmove-wordmark-navigation-{mode}.png'
    with Image.open(file) as im:
        assert im.size==(768,268) and im.mode=='RGBA'
        assert im.getpixel((0,0))[3]==0
        assert im.getchannel('A').getextrema()[0]==0
with Image.open(PUBLIC/'favicon.ico') as ico:
    assert ico.ico.sizes()=={(16,16),(32,32),(48,48)}
    for size in [16,32,48]:
        expected=Image.open(PUBLIC/f'assets/identity/favicon-{size}.png').convert('RGBA')
        assert ImageChops.difference(ico.ico.getimage((size,size)).convert('RGBA'),expected).getbbox() is None
ET.parse(PUBLIC/'assets/identity/favicon.svg')
with sync_playwright() as pw:
    b=pw.chromium.launch(executable_path=args.browser)
    context=b.new_context(reduced_motion='reduce')
    context.route('**/analytics-config.js',lambda r:r.fulfill(body='window.YOURMOVE_POSTHOG={projectToken:""};',content_type='application/javascript'))
    page=context.new_page()
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    for route,width,label in [('/',1440,'home-desktop'),('/',390,'home-mobile'),('/docs/',1440,'docs-desktop'),('/docs/',390,'docs-mobile'),('/blog/',1440,'blog-desktop'),('/get-started/',390,'start-mobile'),('/support/',1440,'support-desktop')]:
        page.set_viewport_size({'width':width,'height':1000})
        page.goto(args.url+route,wait_until='networkidle');page.evaluate('document.fonts.ready')
        imgs=page.locator('header .site-logo img, footer img')
        assert imgs.count()==2
        for i,img in enumerate(imgs.all()):
            info=img.evaluate('''e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,naturalWidth:e.naturalWidth,filter:getComputedStyle(e).filter,complete:e.complete,src:e.getAttribute('src')})''')
            assert info['complete'] and info['naturalWidth']==768 and info['filter']=='none',info
            report['placements'].append({'route':route,'viewport':width,**info})
        page.locator('header.header').screenshot(path=str(args.output/f'{label}-header.png'))
        page.locator('footer').screenshot(path=str(args.output/f'{label}-footer.png'))
    for theme in ['light','dark']:
        page.emulate_media(color_scheme=theme)
        page.set_viewport_size({'width':32,'height':32})
        page.goto(args.url+'/assets/identity/favicon.svg',wait_until='load')
        assert page.locator('rect').evaluate('e=>getComputedStyle(e).fill')==('rgb(245, 244, 241)' if theme=='light' else 'rgb(25, 28, 34)')
        page.screenshot(path=str(args.output/f'favicon-{theme}-32.png'),omit_background=True)
    assert not errors,errors
    b.close()
report.update(result='PASS',sourceRasterUnchanged=True,copyAndAnalytics='unchanged',icoFrames='16/32/48 exact separately rendered PNGs',adaptiveSvg='light and dark verified',errors=[])
(args.output/'checks.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'result':'PASS','routes':len(report['routes']),'placements':len(report['placements']),'sourceCopyAndAnalytics':'preserved','iconFrames':'PASS','adaptiveSvg':'PASS'},indent=2))
