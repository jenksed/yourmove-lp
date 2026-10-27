"""Get Started: current release state, source disclosures and controls fit at 11 served widths."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
widths=[320,375,390,430,600,760,768,900,1024,1280,1440]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    for width in widths:
        page=browser.new_page(viewport={'width':width,'height':900})
        page.goto('http://127.0.0.1:8765/get-started/',wait_until='networkidle')
        page.evaluate('document.fonts.ready')
        if page.locator('[data-analytics-cta=download_release]').count():
            assert 'is available' in page.locator('#availability-title').inner_text()
        else:
            assert 'official app download' in page.locator('#availability-title').inner_text()
        assert page.locator('.availability-section [data-analytics-cta=check_releases]').count()==1
        assert page.locator('[data-analytics-cta=download_source]').count()==1
        for disclosure in page.locator('.build-instructions').all():
            disclosure.locator('summary').click()
            assert disclosure.get_attribute('open') is not None
        assert page.evaluate('document.documentElement.scrollWidth')<=width+1,(width,'document overflow')
        for selector in ['h1','h2','.availability-section .discovery-button','.source-heading','.source-requirements','summary']:
            for el in page.locator(selector).all():
                assert el.evaluate('(el)=>el.scrollWidth<=el.clientWidth+1'),(width,selector,'clipping')
        page.close()
    browser.close()
print(f'PASS: {len(widths)} Get Started layouts with build disclosures open; no heading/action/document overflow')
