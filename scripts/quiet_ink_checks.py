"""Check the actual served Wave 1 site, with an optional original-site comparison.

Requires the same optional playwright/beautifulsoup4 packages as site_checks.py.
Start the site with python3 -m http.server 8765 --directory public, then run:
  python3 scripts/quiet_ink_checks.py --browser /path/to/chromium
Use --baseline-url http://localhost:8766 for overflow regression comparisons.
No analytics ingestion occurs during this check; Google Fonts remain enabled.
"""
from pathlib import Path
import argparse
import json
from urllib.parse import urlsplit, unquote
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--url', default='http://localhost:8765')
parser.add_argument('--baseline-url')
parser.add_argument('--browser', help='Use an available local Chromium instead of the Playwright default')
parser.add_argument('--output', default=str(ROOT / 'artifacts/quiet-ink'))
args = parser.parse_args()
OUT = Path(args.output)
OUT.mkdir(parents=True, exist_ok=True)
WIDTHS = [1440, 768, 390]
PAGES = sorted(PUBLIC.rglob('index.html'))
CAPTURE = {'/', '/get-started/', '/blog/', '/blog/why-im-building-yourmove/', '/docs/'}
report = {'renders': [], 'interactions': [], 'contrast': [], 'baselineOverflow': []}


def route_for(file):
    return '/' + file.parent.relative_to(PUBLIC).as_posix() + '/' if file.parent != PUBLIC else '/'


# Validate every generated/static local destination, stylesheet, script, image and fragment.
for file in PAGES:
    tree = BeautifulSoup(file.read_text(), 'html.parser')
    for el in tree.select('[href], [src]'):
        value = el.get('href', el.get('src', ''))
        url = urlsplit(value)
        if url.scheme or url.netloc or not value or value.startswith('mailto:'):
            continue
        target = PUBLIC / unquote(url.path).lstrip('/') if url.path.startswith('/') else file.parent / unquote(url.path)
        if not url.path:
            target = file
        elif target.is_dir():
            target /= 'index.html'
        assert target.exists(), (file, value, 'missing local target')
        if url.fragment and target.suffix == '.html':
            assert BeautifulSoup(target.read_text(), 'html.parser').find(id=unquote(url.fragment)), (file, value, 'missing fragment')


CONTRAST_JS = """el => {
 const style=getComputedStyle(el);
 let layers=[];for(let x=el;x;x=x.parentElement)layers.unshift(x);
 let bg=layers.reduce((a,x)=>{let c=getComputedStyle(x).backgroundColor.match(/[\\d.]+/g).map(Number);let t=c.length===4?c[3]:1;return a.map((v,i)=>c[i]*t+v*(1-t))},[255,255,255]);
 const color=style.color.match(/[\\d.]+/g).map(Number);
 const lum=c=>c.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
 let a=lum(color),b=lum(bg);
 return {color:style.color,background:bg,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
}"""

with sync_playwright() as pw:
    options = {'headless': True}
    if args.browser:
        options['executable_path'] = args.browser
    browser = pw.chromium.launch(**options)
    ctx = browser.new_context(reduced_motion='reduce', device_scale_factor=1, permissions=['clipboard-read', 'clipboard-write'])
    ctx.route('**/analytics-config.js', lambda r: r.fulfill(content_type='application/javascript', body='window.YOURMOVE_POSTHOG={projectToken:""};'))
    page = ctx.new_page()
    errors, console, failures = [], [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda e: console.append(e.text) if e.type == 'error' else None)
    page.on('response', lambda r: failures.append([r.url, r.status]) if r.url.startswith(args.url) and r.status >= 400 else None)
    for file in PAGES:
        route = route_for(file)
        for width in WIDTHS:
            page.set_viewport_size({'width': width, 'height': 1000})
            response = page.goto(args.url + route, wait_until='networkidle')
            page.evaluate('document.fonts.ready')
            assert response.status == 200, route
            scroll = page.evaluate('document.documentElement.scrollWidth')
            if scroll > width + 1:
                assert args.baseline_url, (route, width, scroll, 'overflow; supply baseline to compare an existing issue')
                original = ctx.new_page()
                original.set_viewport_size({'width': width, 'height': 1000})
                original.goto(args.baseline_url + route, wait_until='networkidle')
                original.evaluate('document.fonts.ready')
                baseline_scroll = original.evaluate('document.documentElement.scrollWidth')
                original.close()
                assert scroll <= baseline_scroll, (route, width, scroll, baseline_scroll, 'introduced overflow')
                report['baselineOverflow'].append({'route': route, 'width': width, 'before': baseline_scroll, 'after': scroll})
            assert page.locator('h1').count() == 1, route
            # Primary navigation retains its white label even on the current destination.
            cta = page.locator('.site-nav>.nav-cta')
            assert cta.evaluate('(e)=>getComputedStyle(e).backgroundColor') == 'rgb(52, 89, 165)', route
            assert cta.evaluate('(e)=>getComputedStyle(e).color') == 'rgb(255, 255, 255)', route
            if width == 390:
                page.locator('.menu-button').click()
                assert page.locator('.menu-button').get_attribute('aria-expanded') == 'true'
                assert page.locator('.site-nav').is_visible()
                page.keyboard.press('Escape')
                assert page.locator('.menu-button').get_attribute('aria-expanded') == 'false'
                assert page.locator('.menu-button').evaluate('(e)=>e===document.activeElement')
            if route in CAPTURE:
                filename = (route.strip('/').replace('/', '-') or 'home') + f'-{width}.png'
                (OUT / 'after').mkdir(exist_ok=True)
                page.screenshot(path=str(OUT / 'after' / filename), full_page=True)
            else:
                (OUT / 'other-pages').mkdir(exist_ok=True)
                page.screenshot(path=str(OUT / 'other-pages' / (route.strip('/').replace('/', '-') + f'-{width}.png')), full_page=True)
            report['renders'].append({'route': route, 'width': width, 'scrollWidth': scroll})
            # Solid computed surfaces only; photographic/gradient sampling is separate.
            for selector in ['.nav-cta', '.home-next .home-button', '.gs-path-foot', '.doc-solid-link', '.ym-prose', '.ym-journal-end .ym-primary']:
                for el in page.locator(selector).all():
                    if el.is_visible():
                        value = el.evaluate(CONTRAST_JS)
                        assert value['ratio'] >= 4.5, (route, width, selector, value)
                        report['contrast'].append({'route': route, 'width': width, 'selector': selector, **value})
        print('PASS', route, flush=True)

    page.goto(args.url + '/', wait_until='networkidle')
    page.locator('[data-compare-state="blank"]').click()
    assert page.locator('[data-demo-name]').inner_text() == 'Enter your name'
    assert page.locator('[data-demo-answer]').input_value() == ''
    page.locator('[data-compare-state="blank"]').focus()
    page.keyboard.press('ArrowRight')
    assert page.locator('[data-compare-state="saved"]').get_attribute('aria-pressed') == 'true'
    assert page.locator('[data-demo-name]').inner_text() == 'Taylor Kim'
    assert 'ready for your review' in page.locator('[data-demo-status]').inner_text().lower()
    assert page.locator('[data-demo-answer]').evaluate('(e)=>getComputedStyle(e).backgroundColor') == 'rgb(234, 242, 237)'
    page.locator('.home-hero .home-button').hover()
    page.wait_for_timeout(220)
    assert page.locator('.home-hero .home-button').evaluate('(e)=>getComputedStyle(e).backgroundColor') == 'rgb(40, 73, 132)'
    page.locator('.home-hero .home-button').focus()
    assert page.locator('.home-hero .home-button').evaluate('(e)=>getComputedStyle(e).outlineStyle') == 'solid'
    report['interactions'] += ['comparison mouse and keyboard states', 'hero hover and keyboard focus']

    page.goto(args.url + '/get-started/', wait_until='networkidle')
    page.locator('.start-questions summary').first.click()
    assert page.locator('.start-questions details').first.get_attribute('open') is not None
    page.locator('.build-instructions summary').first.click()
    copy = page.locator('.gs-console button[data-copy-text]')
    expected = copy.get_attribute('data-copy-text')
    copy.click()
    assert page.evaluate('navigator.clipboard.readText()') == expected
    report['interactions'] += ['Get Started disclosure and real command clipboard']
    page.goto(args.url + '/evidence/', wait_until='networkidle')
    page.locator('.actual-evidence summary').click()
    assert page.locator('.actual-evidence img').is_visible()
    report['interactions'] += ['authentic evidence disclosure']
    page.goto(args.url + '/docs/', wait_until='networkidle')
    page.locator('[data-doc-state="applying"]').click()
    assert 'READY TO REVIEW' in page.locator('[data-doc-stage-visual-pill]').inner_text()
    page.locator('[data-doc-state="stuck"]').click()
    assert 'NEEDS ATTENTION' in page.locator('[data-doc-stage-visual-pill]').inner_text()
    assert page.locator('[data-doc-stage-visual-pill]').evaluate('(e)=>getComputedStyle(e).color') == 'rgb(129, 87, 25)'
    page.locator('[data-doc-state="stuck"]').focus()
    page.keyboard.press('Home')
    assert page.locator('[data-doc-state="new"]').get_attribute('aria-pressed') == 'true'
    search = page.locator('input[type="search"]')
    search.fill('resume attach')
    assert page.locator('[data-doc-search-results] a').first.get_attribute('href') == '/docs/troubleshooting/#resume'
    search.press('Escape')
    assert page.locator('[data-doc-search-panel]').is_hidden()
    page.goto(args.url + '/docs/troubleshooting/#resume', wait_until='networkidle')
    assert page.locator('details#resume').get_attribute('open') is not None
    report['interactions'] += ['docs selection mouse and keyboard', 'docs attention semantics', 'docs search and Escape', 'troubleshooting deep-link disclosure']
    nojs = browser.new_context(java_script_enabled=False, viewport={'width': 390, 'height': 900})
    pg = nojs.new_page()
    pg.goto(args.url + '/')
    assert pg.locator('.site-nav').is_visible()
    nojs.close()
    report['interactions'] += ['mobile navigation on all 14 pages; no-JS homepage navigation']
    assert not errors, errors
    assert not console, console
    assert not failures, failures
    report.update(result='PASS', scriptErrors=errors, consoleErrors=console, failedLocalResponses=failures)
    browser.close()
(OUT / 'checks.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({'result': 'PASS', 'renderChecks': len(report['renders']), 'existingOverflowCases': report['baselineOverflow'], 'interactions': report['interactions']}, indent=2))
