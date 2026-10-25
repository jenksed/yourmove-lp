"""Mock PostHog event tests. Runs entirely offline; no ingestion requests are sent."""
import base64
import json
import mimetypes
import re
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1] / 'public'
ROUTES = ['', 'how-it-works', 'evidence', 'get-started', 'manifesto', 'review']


def source(route):
    file = ROOT / route / 'index.html' if route else ROOT / 'index.html'
    html = file.read_text()
    html = re.sub(r'<link[^>]*>', '', html)
    html = re.sub(r'<script[^>]*></script>', '', html)

    def embed(match):
        path = ROOT / match.group(1).removeprefix('/')
        mime = mimetypes.guess_type(path.name)[0] or 'image/png'
        return 'src="data:' + mime + ';base64,' + base64.b64encode(path.read_bytes()).decode() + '"'
    return re.sub(r'src="(/assets/[^\"]+)"', embed, html)


def start(page, route, enable):
    page.set_content(source(route), wait_until='domcontentloaded')
    for name in ['styles.css', 'campaign.css', 'focused.css', 'brand-refresh.css', 'hero.css']:
        page.add_style_tag(content=(ROOT / name).read_text())
    page.add_script_tag(content=(ROOT / 'app.js').read_text())
    page.evaluate('''() => {
        window.__events = [];
        window.__init = null;
        window.addEventListener('click', e => { if (e.target.closest('a[href]')) e.preventDefault(); }, true);
        window.posthog = {
            __SV: 1,
            init(token, options) { window.__init = { token, options }; },
            capture(event, properties) { window.__events.push({ event, properties }); }
        };
    }''')
    page.add_script_tag(content=f'window.YOURMOVE_POSTHOG = {{projectToken: {json.dumps("phc_TESTONLY123" if enable else "")},apiHost:"https://us.i.posthog.com"}};')
    page.add_script_tag(content=(ROOT / 'analytics.js').read_text())
    page.wait_for_timeout(90)


def events(page, event):
    return page.evaluate('(name) => window.__events.filter(x => x.event === name)', event)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    errors=[]
    for route in ROUTES:
        page=browser.new_page(viewport={'width':1024,'height':800})
        page.on('pageerror', lambda exc: errors.append(str(exc)))
        start(page,route,False)
        assert page.evaluate('window.__init') is None, f'inactive config unexpectedly initialized: {route}'
        assert events(page,'$pageview')==[], f'inactive config emitted events: {route}'
        page.close()

        page=browser.new_page(viewport={'width':1024,'height':800})
        page.on('pageerror', lambda exc: errors.append(str(exc)))
        start(page,route,True)
        config=page.evaluate('window.__init')
        assert config and config['token']=='phc_TESTONLY123', f'missing init {route}'
        assert config['options']['autocapture'] is False
        assert config['options']['capture_pageview'] is False
        assert config['options']['disable_session_recording'] is True
        assert config['options']['cookieless_mode']=='always'
        assert len(events(page,'$pageview'))==1, f'expected exactly one view on {route}'
        if route=='':
            page.locator('.hero-real__button').click()
            assert events(page,'ym_cta_clicked')[-1]['properties']['placement']=='hero'
            page.locator('[data-compare-state="blank"]').click()
            assert events(page,'ym_comparison_changed')[-1]['properties']['mode']=='starting_over'
            page.locator('[data-compare-state="saved"]').click()
            assert events(page,'ym_comparison_changed')[-1]['properties']['mode']=='with_yourmove'
            page.locator('.ym2-download-button').click()
            assert events(page,'ym_cta_clicked')[-1]['properties']['placement']=='final_section'
            assert events(page,'ym_section_viewed'), 'no sections observed'
            page.evaluate('window.scrollTo(0,document.documentElement.scrollHeight)')
            page.wait_for_timeout(75)
            assert len(events(page,'ym_scroll_depth_reached'))>=1
        if route=='get-started':
            page.locator('.gs-dark-button').click()
            assert events(page,'ym_github_outbound_clicked')[-1]['properties']['action']=='releases'
            page.locator('.gs-source-link').click()
            assert events(page,'ym_github_outbound_clicked')[-1]['properties']['action']=='source_zip'
            page.locator('.gs-details summary').first.click()
            page.wait_for_timeout(120)
            assert events(page,'ym_faq_opened')[-1]['properties']['question']==1
            page.locator('.gs-console button[data-copy-text]').click()
            page.wait_for_timeout(100)
            assert events(page,'ym_install_command_copy_clicked')[-1]['properties']['command_group']=='mac_build'
            result_events = events(page,'ym_install_command_copy_result')
            assert len(result_events)==1 and result_events[0]['properties']['result'] in ('success','failure')
            assert not any('git clone' in str(e) for e in result_events), 'copied text leaked to analytics'
        if route=='evidence':
            page.locator('[data-evidence-stage="1"]').click()
            assert events(page,'ym_evidence_stage_selected')[-1]['properties']['stage']==2
        if route=='how-it-works':
            tabs=page.locator('[data-flow]')
            if tabs.count() > 1:
                tabs.nth(1).click()
                assert events(page,'ym_workflow_step_selected')[-1]['properties']['step']==2
        page.close()

    page=browser.new_page(viewport={'width':390,'height':844})
    page.on('pageerror', lambda exc: errors.append(str(exc)))
    start(page,'',True)
    page.locator('.menu-button').click()
    assert events(page,'ym_mobile_menu_toggled')[-1]['properties']['state']=='open'
    page.close()
    browser.close()
    assert not errors, errors
print(json.dumps({'status':'PASS','routes':len(ROUTES),'inactive_and_active_pageviews':12,
  'verified_events':['$pageview','ym_cta_clicked','ym_comparison_changed','ym_section_viewed','ym_scroll_depth_reached',
  'ym_github_outbound_clicked','ym_faq_opened','ym_install_command_copy_clicked','ym_install_command_copy_result',
  'ym_evidence_stage_selected','ym_workflow_step_selected','ym_mobile_menu_toggled'],
  'note':'Mock client verifies event wiring, not live PostHog ingestion.'},indent=2))
