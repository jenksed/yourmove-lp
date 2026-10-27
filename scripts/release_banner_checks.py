"""Offline release date, fallback, layout, and expiry checks for every built route."""
from pathlib import Path
import argparse, re, base64, mimetypes
from datetime import datetime, timezone
from playwright.sync_api import sync_playwright

PUBLIC = Path(__file__).resolve().parents[1] / 'public'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--browser', help='Path to an installed Chromium, or use Playwright default')
args = parser.parse_args()
PAGES = sorted(PUBLIC.rglob('index.html'))
WIDTHS = [320, 360, 375, 390, 430, 540, 768, 900, 901, 1024, 1440]

def local_html(file, config=None):
    html = file.read_text()
    css = '\n'.join((PUBLIC/name.lstrip('/')).read_text() for name in re.findall(r'<link rel="stylesheet" href="([^"]+)"', html))
    html = re.sub(r'<script[^>]+></script>|<link[^>]+>', '', html)
    html = html.replace('</head>', '<style>' + css + '</style></head>')
    def embed(match):
        path = PUBLIC / match.group(1).lstrip('/')
        mime = mimetypes.guess_type(str(path))[0] or 'image/png'
        return 'src="data:' + mime + ';base64,' + base64.b64encode(path.read_bytes()).decode() + '"'
    html = re.sub(r'src="(/assets/[^" ]+)"', embed, html)
    config = config if config is not None else (PUBLIC/'release-config.js').read_text()
    return html.replace('</body>', '<script>' + config + '</script><script>' + (PUBLIC/'release-banner.js').read_text() + '</script></body>')

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path=args.browser)
    context = browser.new_context(timezone_id='America/Detroit')
    context.route('https://**/*', lambda route: route.abort())
    page = context.new_page()
    page.clock.install(time=datetime(2026,10,27,16,tzinfo=timezone.utc))
    for file in PAGES:
        for width in WIDTHS:
            page.set_viewport_size({'width':width,'height':900})
            page.set_content(local_html(file), wait_until='load')
            banner = page.locator('.announcement.ym-release-announcement')
            assert banner.count() == 1, file
            assert banner.locator('.shell>span').inner_text() == 'Initial release planned for November 6.'
            assert banner.locator('a').inner_text() == 'Release details'
            assert banner.locator('a').get_attribute('data-analytics-placement') == 'release_banner'
            assert banner.locator('a').get_attribute('data-analytics-cta') == 'release_details'
            assert not banner.locator('[role="status"],.ym-release-countdown,.ym-release-dot').count()
            assert banner.evaluate('(el)=>el.scrollWidth') <= width+1, (file,width)
            assert banner.evaluate('(el)=>[...el.querySelectorAll(".shell>*")].every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth})'), (file,width)
    context.close()
    # Both fresh loads and an already-open tab must return to truthful availability.
    for when in [datetime(2026,11,6,18,tzinfo=timezone.utc), datetime(2026,11,7,18,tzinfo=timezone.utc)]:
        context=browser.new_context();page=context.new_page();page.clock.install(time=when)
        page.set_content(local_html(PUBLIC/'index.html'))
        if when.day==6:
            assert 'planned for today, November 6.' in page.locator('.announcement').inner_text()
            page.clock.fast_forward(24*60*60*1000)
        assert page.locator('.ym-release-announcement').count()==0
        assert 'Official installer not yet published.' in page.locator('.announcement').inner_text()
        context.close()
    config=(PUBLIC/'release-config.js').read_text()
    for changed in [config.replace('enabled: true','enabled: false'), config.replace('2026-11-06','2026-02-30'),config.replace('America/Detroit','Invalid/Zone'),config.replace("linkHref: '/get-started/'", "linkHref: '//example.com'")]:
        context=browser.new_context();page=context.new_page();page.clock.install(time=datetime(2026,10,27,16,tzinfo=timezone.utc));page.set_content(local_html(PUBLIC/'index.html',changed))
        assert not page.locator('.ym-release-announcement').count()
        assert 'Official installer not yet published.' in page.locator('.announcement').inner_text()
        context.close()
    browser.close()
print(f'PASS: {len(PAGES)} routes × {len(WIDTHS)} widths; planned date, no countdown, release day, live midnight expiry, fresh expiry, disabled/invalid config fallbacks.')
