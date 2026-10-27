"""Wave 4 acceptance checks against the real local homepage. No analytics ingestion.

Requires optional Playwright, BeautifulSoup and Pillow QA dependencies.
Run: python scripts/homepage_checks.py --url http://127.0.0.1:8765
"""
from pathlib import Path
from io import BytesIO
from urllib.parse import urlsplit
import argparse, json, math, re
from PIL import Image
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--url', default='http://127.0.0.1:8765')
parser.add_argument('--browser')
parser.add_argument('--output', type=Path, default=ROOT/'artifacts/homepage-wave-4')
args = parser.parse_args()
(args.output/'after').mkdir(parents=True, exist_ok=True)
report = {'renders': [], 'interactions': [], 'photoContrast': [], 'errors': []}
home = BeautifulSoup((ROOT/'public/index.html').read_text(), 'html.parser')
assert len(home.select('h1')) == 1
assert len({el['id'] for el in home.select('[id]')}) == len(home.select('[id]'))
# Every current local asset, route and fragment resolves.
for el in home.select('[href], [src]'):
    url = el.get('href', el.get('src', ''))
    if not url.startswith(('/', '#')) or url.startswith('//'): continue
    path, fragment = urlsplit(url).path, urlsplit(url).fragment
    target = ROOT/'public'/path.lstrip('/') if path else ROOT/'public/index.html'
    if target.is_dir(): target /= 'index.html'
    assert target.exists(), url
    if fragment: assert BeautifulSoup(target.read_text(), 'html.parser').find(id=fragment), url
# Approved site furniture is unchanged and remains shared by every static route.
for file in (ROOT/'public').rglob('index.html'):
    other = BeautifulSoup(file.read_text(), 'html.parser')
    for selector in ['body>header', 'body>footer', '.announcement']:
        assert str(other.select_one(selector)) == str(home.select_one(selector)), (file, selector)


def luminance(rgb):
    return sum((v/255/12.92 if v/255 <= .04045 else ((v/255+.055)/1.055)**2.4)*k for v, k in zip(rgb[:3], [.2126, .7152, .0722]))


def contrast(fg, bg):
    x, y = luminance(fg), luminance(bg)
    return (max(x, y)+.05)/(min(x, y)+.05)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=args.browser)
    ctx = browser.new_context(reduced_motion='reduce', device_scale_factor=1)
    for width in [1440, 1024, 768, 390, 320]:
        page = ctx.new_page()
        page.set_viewport_size({'width':width, 'height':900 if width > 768 else 844})
        page.on('pageerror', lambda e: report['errors'].append(str(e)))
        page.on('console', lambda e: report['errors'].append(e.text) if e.type == 'error' else None)
        page.on('response', lambda r: report['errors'].append(f'{r.status} {r.url}') if r.url.startswith(args.url) and r.status >= 400 else None)
        assert page.goto(args.url+'/', wait_until='networkidle').status == 200
        page.evaluate('document.fonts.ready')
        assert page.evaluate('document.fonts.check("600 20px Jost")')
        assert page.evaluate('document.documentElement.scrollWidth') == width
        # Local preview exclusion must win over the configured PostHog token.
        assert page.evaluate('typeof window.YourMoveAnalytics') == 'undefined'
        original = Image.open(BytesIO(page.screenshot(path=str(args.output/f'after/home-{width}.png'), full_page=True))).convert('RGB')
        page.screenshot(path=str(args.output/f'after/opening-{width}.png'))
        # Sample the actual photographed background behind visible glyphs, not a solid-color approximation.
        records = []
        for selector in ['.home-hero h1', '.home-hero__content>p', '.home-hero a', '.home-hero__caption']:
            for el in page.locator(selector).all():
                records.extend(el.evaluate('''(el,selector)=>{
                  const out=[],walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
                  while(walk.nextNode()){
                    const node=walk.currentNode;if(!node.textContent.trim())continue;
                    const range=document.createRange();range.selectNodeContents(node);
                    const s=getComputedStyle(node.parentElement);
                    for(const r of range.getClientRects())out.push({selector,x:r.x,y:r.y+scrollY,w:r.width,h:r.height,color:s.color,size:parseFloat(s.fontSize),weight:parseInt(s.fontWeight)});
                  }return out;
                }''', selector))
        style = page.add_style_tag(content='body *{-webkit-text-fill-color:transparent!important;text-shadow:none!important}')
        background = Image.open(BytesIO(page.screenshot(full_page=True))).convert('RGB')
        for r in records:
            box = (max(0, math.ceil(r['x'])), max(0, math.ceil(r['y'])), min(width, int(r['x']+r['w'])), min(background.height, int(r['y']+r['h'])))
            fg = tuple(map(int, re.findall(r'\d+', r['color'])[:3]))
            visible = [bg for a, bg in zip(original.crop(box).get_flattened_data(), background.crop(box).get_flattened_data()) if max(abs(x-y) for x,y in zip(a,bg)) > 10]
            if not visible: continue
            worst = min(contrast(fg, bg) for bg in set(visible))
            required = 3 if r['size'] >= 24 or (r['size'] >= 18.67 and r['weight'] >= 700) else 4.5
            report['photoContrast'].append({'width':width, 'selector':r['selector'], 'worst':round(worst,2), 'required':required})
            assert worst >= required, (width, r['selector'], worst, required)
        style.evaluate('(el)=>el.remove()')
        # The product shortcut lands on controls with the changing form immediately following.
        page.locator('.home-hero a[href="#experience"]').click()
        blank = page.locator('[data-compare-state="blank"]')
        saved = page.locator('[data-compare-state="saved"]')
        answer = page.locator('[data-demo-answer]')
        assert blank.evaluate('(e)=>e===document.activeElement')
        assert blank.bounding_box()['y'] >= 0
        assert blank.get_attribute('aria-pressed') == 'true'
        assert answer.input_value() == '' and answer.get_attribute('readonly') is not None
        page.keyboard.press('ArrowRight')
        assert saved.get_attribute('aria-pressed') == 'true'
        assert saved.evaluate('(e)=>e===document.activeElement')
        assert saved.evaluate('(e)=>getComputedStyle(e).outlineStyle') == 'solid'
        assert page.locator('[data-demo-name]').inner_text() == 'Taylor Kim'
        assert page.locator('[data-demo-resume]').inner_text() == 'Taylor_Kim_Support.pdf'
        assert answer.get_attribute('readonly') is None
        original_answer = answer.input_value()
        assert 'database query' in original_answer
        assert 'Still yours to write' in page.locator('.application-preview__unfinished').inner_text()
        page.locator('[data-compare]').screenshot(path=str(args.output/f'after/demo-saved-{width}.png'))
        answer.fill('An edited answer for this particular job.')
        if width in [390,1440]:
            page.locator('[data-compare]').screenshot(path=str(args.output/f'after/demo-edited-{width}.png'))
        saved.focus();page.keyboard.press('Home')
        assert answer.input_value() == ''
        page.keyboard.press('End')
        assert answer.input_value() == 'An edited answer for this particular job.'
        page.keyboard.press('ArrowLeft');page.keyboard.press('Tab');page.keyboard.press('Space')
        assert saved.get_attribute('aria-pressed') == 'true'
        blank.focus();page.keyboard.press('Enter')
        assert blank.get_attribute('aria-pressed') == 'true'
        assert page.locator('[data-demo-status]').get_attribute('role') == 'status'
        assert page.locator('[data-compare] button').count() == 2  # No fake submit control.
        assert page.locator('[data-compare]').evaluate('(e)=>getComputedStyle(e).animationName') == 'none'
        assert page.locator('.home-button').first.evaluate('(e)=>getComputedStyle(e).transitionDuration') == '0s'
        report['renders'].append({'width':width, 'scrollWidth':width, 'height':original.height, 'font':'Jost', 'keyboard':'PASS', 'photoContrast':'PASS'})
        page.close()
    report['interactions'] += ['mouse shortcut and both states', 'keyboard arrows, Home, End, Enter, Space, Tab, focus ring', 'saved-answer editing survives comparison toggles', 'unanswered job-specific field and no submission action', 'reduced motion', 'rendered photographic text contrast', 'localhost analytics excluded']
    # Follow real local CTA destinations. Inspect external-source links without opening third-party pages.
    page = ctx.new_page()
    for selector, destination in [('.home-hero .home-button', '/get-started/'), ('.home-next .home-button', '/get-started/'), ('.home-records a', '/evidence/'), ('.home-control a', '/docs/first-application/'), ('.home-founder a', '/support/')]:
        page.goto(args.url+'/')
        page.locator(selector).click();page.wait_for_url(args.url+destination)
    page.goto(args.url+'/')
    assert page.locator('.home-next__action a[target="_blank"]').get_attribute('href') == 'https://github.com/jenksed/yourmove-go'
    report['interactions'].append('real primary, evidence, first-application and founder destinations; GitHub remains source')
    # Actual touch events at the mobile breakpoint, including the demo shortcut.
    touch = browser.new_context(has_touch=True, is_mobile=True, viewport={'width':390, 'height':844})
    pg = touch.new_page();pg.goto(args.url+'/')
    pg.locator('.menu-button').tap();assert pg.locator('.site-nav').is_visible()
    pg.locator('.menu-button').tap();assert not pg.locator('.site-nav').is_visible()
    pg.locator('.home-hero a[href="#experience"]').tap()
    pg.locator('[data-compare-state="saved"]').tap()
    assert pg.locator('[data-demo-answer]').input_value()
    pg.locator('[data-demo-answer]').tap();pg.keyboard.type(' Touch edit.')
    pg.locator('[data-compare-state="blank"]').tap();assert pg.locator('[data-demo-answer]').input_value() == ''
    touch.close();report['interactions'].append('touch menu, demo shortcut, both states, textarea editing')
    # Motion is not required for state changes, even with default OS settings.
    motion = browser.new_context(reduced_motion='no-preference')
    pg = motion.new_page();pg.goto(args.url+'/');pg.locator('[data-compare-state="saved"]').click()
    assert pg.locator('[data-demo-name]').inner_text() == 'Taylor Kim'
    assert pg.locator('[data-compare]').evaluate('(e)=>getComputedStyle(e).animationName') == 'none'
    motion.close()
    for width in [320, 390, 768]:
        nojs = browser.new_context(java_script_enabled=False, viewport={'width':width, 'height':844})
        pg = nojs.new_page();pg.goto(args.url+'/')
        assert pg.locator('.site-nav').is_visible()
        assert not pg.locator('.application-demo__toolbar').is_visible()
        assert pg.locator('.application-demo__nojs').is_visible()
        assert pg.evaluate('document.documentElement.scrollWidth') == width
        nojs.close()
    report['interactions'].append('no-JS navigation, illustration explanation and CTAs at 320/390/768')
    assert not report['errors'], report['errors']
    browser.close()
report['result'] = 'PASS'
(args.output/'homepage-checks.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report, indent=2))
