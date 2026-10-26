"""Release banner browser checks: layout, site-wide coverage, and expiration."""
from pathlib import Path
import re, base64, mimetypes
from datetime import datetime, timezone
from playwright.sync_api import sync_playwright

PUBLIC = Path(__file__).resolve().parents[1] / 'public'
PAGES = ['index.html','get-started/index.html','how-it-works/index.html','evidence/index.html','manifesto/index.html','review/index.html']
WIDTHS = [320, 360, 375, 390, 430, 490, 560, 768, 1024, 1280, 1440]

def local_html(page_name):
    html = (PUBLIC / page_name).read_text()
    html = re.sub(r'<script[^>]+></script>', '', html)
    css_files = ['styles.css','campaign.css','focused.css','brand-refresh.css','hero.css','get-started.css','release-banner.css']
    css = '\n'.join((PUBLIC / path).read_text() for path in css_files)
    html = re.sub(r'<link[^>]+>', '', html)
    html = html.replace('</head>', '<style>' + css + '</style></head>')
    def image_src(match):
        name = match.group(1)
        path = PUBLIC/name.removeprefix('/')
        typ = mimetypes.guess_type(str(path))[0] or 'image/png'
        return 'src="data:' + typ + ';base64,' + base64.b64encode(path.read_bytes()).decode() + '"'
    html = re.sub(r'src="(/assets/[^" ]+)"', image_src, html)
    scripts = '<script>' + (PUBLIC/'release-config.js').read_text() + '</script>' + '<script>' + (PUBLIC/'release-banner.js').read_text() + '</script>'
    return html.replace('</body>', scripts + '</body>')

def setup_context(browser, when):
    context = browser.new_context(viewport={'width': 1440, 'height': 900}, timezone_id='America/Detroit')
    context.route('https://**/*', lambda route: route.abort())
    context.clock.install(time=when)
    return context

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    context = setup_context(browser, datetime(2026, 10, 25, 16, 0, tzinfo=timezone.utc))
    for page_name in PAGES:
        for width in WIDTHS:
            page = context.new_page()
            page.set_viewport_size({'width': width, 'height': 900})
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.set_content(local_html(page_name), wait_until='load')
            announcement = page.locator('.announcement.ym-release-announcement')
            assert announcement.count() == 1, (page_name, width, 'no release announcement')
            assert page.locator('.ym-release-title').inner_text() == 'INITIAL RELEASE', (page_name, width)
            assert page.locator('.ym-release-date').inner_text() == 'NOV 6', (page_name, width)
            assert page.locator('.ym-release-countdown').inner_text() == '12 DAYS TO GO', (page_name, width)
            d=page.evaluate('''() => ({
                doc: document.documentElement.scrollWidth,
                viewport: window.innerWidth,
                banner: document.querySelector('.announcement').getBoundingClientRect().toJSON(),
                title: document.querySelector('.ym-release-title').getBoundingClientRect().toJSON(),
                date: document.querySelector('.ym-release-date').getBoundingClientRect().toJSON(),
                countdown: document.querySelector('.ym-release-countdown').getBoundingClientRect().toJSON(),
                link: document.querySelector('.ym-release-link').getBoundingClientRect().toJSON(),
                inner: document.querySelector('.announcement .shell').getBoundingClientRect().toJSON()
            })''')
            assert d['doc'] <= width + 1, (page_name, width, 'horizontal overflow', d['doc'])
            for el in ['title','date','countdown','link']:
                assert d[el]['left'] >= d['inner']['left'] - 2 and d[el]['right'] <= d['inner']['right'] + 2, (page_name,width,el,d[el],d['inner'])
            assert d['link']['left'] >= d['countdown']['right'] - 2, (page_name,width,'link overlaps countdown')
            assert not errors, (page_name,width,errors)
            if page_name == 'get-started/index.html' and width in (390,768,1440):
                page.screenshot(path=f'/mnt/data/release-compact-{width}.png', full_page=False)
            page.close()
    context.close()
    print('PASS release displayed on six pages at eleven viewport widths (66 cases).')
    for when, expect in [(datetime(2026,11,5,18,tzinfo=timezone.utc),'1 DAY TO GO'),(datetime(2026,11,6,18,tzinfo=timezone.utc),'TODAY')]:
        context = setup_context(browser, when)
        page=context.new_page()
        page.set_content(local_html('index.html'), wait_until='load')
        assert page.locator('.ym-release-countdown').inner_text() == expect, (when,expect)
        context.close()
    context = setup_context(browser, datetime(2026,11,7,18,tzinfo=timezone.utc))
    page=context.new_page()
    page.set_content(local_html('index.html'), wait_until='load')
    assert page.locator('.announcement.ym-release-announcement').count() == 0
    assert 'OPEN SOURCE · BUILT FOR JOB SEEKERS' in page.locator('.announcement').inner_text()
    context.close()
    print('PASS Nov 5, release day and automatic expiry Nov 7.')
    context = setup_context(browser, datetime(2026, 10, 25, 16, 0, tzinfo=timezone.utc))
    page = context.new_page()
    disabled = local_html('index.html').replace('enabled: true,', 'enabled: false,')
    page.set_content(disabled, wait_until='load')
    assert page.locator('.announcement.ym-release-announcement').count() == 0
    assert 'OPEN SOURCE · BUILT FOR JOB SEEKERS' in page.locator('.announcement').inner_text()
    context.close()
    print('PASS disabling release config restores the original announcement.')
    browser.close()
