"""Repeatable static and browser checks, without network access.

python3 site_checks.py

The browser pages are loaded from embedded local files because loopback navigation is
blocked in some sandboxes. This does not prove deployed routing, Safari behavior, or
end-to-end navigation from the marketing site into the application.
"""
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import base64, mimetypes, re, json
R=Path(__file__).resolve().parents[1] / "public"
ROUTES=['','how-it-works','evidence','get-started','manifesto','review']
WIDTHS=[320,375,390,768,1024,1440]

def source(route):
    html=(R/route/'index.html' if route else R/'index.html').read_text()
    html=re.sub(r'<link[^>]*>', '', html)
    html=re.sub(r'<script[^>]*></script>', '', html)
    def embed(m):
        src=m.group(1)
        path=R/src.removeprefix('/')
        mime=mimetypes.guess_type(path.name)[0] or 'image/png'
        return 'src="data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode()+'"'
    return re.sub(r'src="(/assets/[^\"]+)"',embed,html)

# All local targets resolve, all images have an alt attribute, every page has one H1.
for route in ROUTES:
    path=R/route/'index.html' if route else R/'index.html'
    tree=BeautifulSoup(path.read_text(),'html.parser')
    assert len(tree.select('h1'))==1, f'{path}: expected one H1'
    assert tree.select_one('main#main'), f'{path}: main missing'
    assert tree.select_one('nav[aria-label]'), f'{path}: nav missing'
    for img in tree.select('img'):
        assert img.has_attr('alt'), f'{path}: missing alt on {img}'
        assert (R/img['src'].removeprefix('/')).is_file(), f'{path}: missing {img["src"]}'
    for link in tree.select('a[href^="/"]'):
        url=link['href'];base,_,frag=url.partition('#')
        target=R/(base.lstrip('/')+'index.html') if base.endswith('/') else R/base.lstrip('/')
        assert target.exists(), f'{path}: missing route {url}'
        if frag:
            t=BeautifulSoup(target.read_text(),'html.parser')
            assert t.find(id=frag), f'{path}: missing anchor {url}'

checks=[]
with sync_playwright() as p:
    b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for width in WIDTHS:
        for route in ROUTES:
            page=b.new_page(viewport={'width':width,'height':900})
            errors=[]
            page.on('pageerror', lambda e:errors.append(str(e)))
            page.set_content(source(route),wait_until='domcontentloaded')
            page.add_style_tag(content=(R/'styles.css').read_text())
            page.add_style_tag(content=(R/'campaign.css').read_text())
            page.add_style_tag(content=(R/'focused.css').read_text())
            page.add_style_tag(content=(R/'brand-refresh.css').read_text())
            page.add_style_tag(content=(R/'hero.css').read_text())
            page.add_script_tag(content=(R/'app.js').read_text())
            scroll=page.evaluate('''() => ({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth})''')
            assert scroll['scroll']<=scroll['client']+1,(width,route,'overflow',scroll)
            assert not errors,(width,route,errors)
            checks.append({'route':route or '/','width':width,'overflow':0,'scriptErrors':0})
            if route=='':
                assert page.locator('.hero-real').count()==1
                assert page.locator('h1#hero-title').is_visible()
                assert page.locator('.hero-real__button').get_attribute('href') == '/get-started/'
                assert 'hero-background-warm.webp' in page.locator('.hero-real__scene').evaluate('(node) => getComputedStyle(node).backgroundImage')
                assert page.locator('h1#hero-title').evaluate('(el) => {const s=getComputedStyle(el);const r=el.getBoundingClientRect();return s.visibility==="visible" && s.display!=="none" && r.width>200 && r.height>35}')
                assert page.locator('.hero-real__copy').evaluate('(el) => getComputedStyle(el).position!=="absolute"')
                assert page.locator('.hero-real__scene').get_attribute('aria-hidden')=='true'
                assert page.locator('.ym2-three article').count()==3
                assert page.locator('.ym2-keeps img').is_visible()
                page.locator('[data-compare-state="blank"]').click()
                assert 'empty box' in page.locator('[data-compare-summary]').inner_text()
                assert page.locator('[data-compare-state="blank"]').get_attribute('aria-pressed')=='true'
                page.locator('[data-compare-state="saved"]').click()
                assert 'ready to review' in page.locator('[data-answer-meta]').inner_text().lower()
                assert page.locator('[data-compare-state="saved"]').get_attribute('aria-pressed')=='true'
            if route=='get-started':
                assert page.locator('a[href="https://github.com/jenksed/yourmove-go/releases"]').count()>=1
                assert page.locator('a[href$="/archive/refs/heads/main.zip"]').count()==1
                assert page.locator('.gs-console button[data-copy-text]').count()==1
                assert 'prepare.sh' in page.locator('.gs-console button').get_attribute('data-copy-text')
                assert page.locator('.gs-details details').count()==4
                page.locator('.gs-details summary').first.click()
                assert page.locator('.gs-details details').first.get_attribute('open') is not None
            if route=='evidence':
                page.locator('[data-evidence-stage="1"]').click()
                assert 'actual incident' in page.locator('.ev-transform h3').inner_text().lower()
            if width<=760:
                page.locator('.menu-button').click()
                assert page.locator('.menu-button').get_attribute('aria-expanded')=='true'
                page.keyboard.press('Escape')
                assert page.locator('.menu-button').get_attribute('aria-expanded')=='false'
                assert page.locator('.menu-button').evaluate('(el)=>el===document.activeElement')
            page.close()
    # No-JS navigation remains visible, including on narrow layouts.
    pg=b.new_page(viewport={'width':320,'height':720})
    pg.set_content(source(''),wait_until='domcontentloaded')
    pg.add_style_tag(content=(R/'styles.css').read_text())
    pg.add_style_tag(content=(R/'campaign.css').read_text())
    pg.add_style_tag(content=(R/'focused.css').read_text())
    pg.add_style_tag(content=(R/'brand-refresh.css').read_text())
    pg.add_style_tag(content=(R/'hero.css').read_text())
    assert pg.locator('.site-nav').is_visible(), 'mobile nav hidden without JS'
    pg.close()
    b.close()
print(json.dumps({'result':'PASS','viewports':WIDTHS,'pages':len(ROUTES),'renderChecks':len(checks),
                  'checked':['overflow','console exceptions','internal paths and anchor targets',
                             'image paths and alt attributes','heading structure','comparison toggle and updated answer','simplified three-step workflow',
                             'evidence tabs','installation FAQ disclosures and command block','mobile menu and Escape','no-JS mobile navigation']},indent=2))
