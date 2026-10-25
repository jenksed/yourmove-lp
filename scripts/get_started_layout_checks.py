"""Get Started regression: long headings and CTAs fit inside cards at real viewport widths.
Run: python3 scripts/get_started_layout_checks.py
"""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]/'public'
html=(root/'get-started/index.html').read_text()
assert '<h3>CHECK<br>RELEASES.</h3>' in html
assert 'href="/get-started.css"' in html
assert html.count('data-analytics-cta="check_releases"')==1
assert html.count('data-analytics-cta="build_on_mac"')==1
assert html.count('data-analytics-cta="download_source"')==1
# Assets and external scripts are intentionally excluded from these layout-only tests.
html=re.sub(r'<link[^>]*>', '', html)
html=re.sub(r'<script[^>]*></script>', '', html)
widths=[320,375,390,430,600,760,768,900,1024,1280,1440]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    for width in widths:
        page=browser.new_page(viewport={'width':width,'height':900})
        page.set_content(html)
        for stylesheet in ['styles.css','campaign.css','focused.css','brand-refresh.css','hero.css','get-started.css']:
            page.add_style_tag(content=(root/stylesheet).read_text())
        result=page.evaluate('''() => {
          const cards=[...document.querySelectorAll('.gs-path')];
          return {
            screen:innerWidth, page:document.documentElement.scrollWidth,
            cards:cards.map(el=>({x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y,
              right:el.getBoundingClientRect().right, cardOverflow:el.scrollWidth-el.clientWidth,
              titleOverflow:el.querySelector('h3').scrollWidth-el.querySelector('h3').clientWidth,
              buttonOverflow:[...el.querySelectorAll('a')].some(a=>a.getBoundingClientRect().right>el.getBoundingClientRect().right+1)}))
          };
        }''')
        assert result['page']<=width+1,(width,'page overflow',result)
        assert len(result['cards'])==2
        for card in result['cards']:
            assert card['cardOverflow']<=1,(width,'card overflow',card)
            assert card['titleOverflow']<=1,(width,'heading overflow',card)
            assert not card['buttonOverflow'],(width,'button overflow',card)
        a,b=result['cards']
        if width<=1000:
            assert b['y']>a['y']+20,(width,'expected stacked cards')
        else:
            assert abs(a['y']-b['y'])<2,(width,'expected two card columns')
        page.close()
    browser.close()
print(f'PASS: {len(widths)} Get Started viewport layouts, no card/heading/action overflow')
