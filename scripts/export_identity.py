"""Export approved Green Signature B website assets and an optional external marketing kit.

Optional local authoring tools: Python Pillow + Playwright + an installed Chromium.
These are not website runtime dependencies. See IDENTITY_WAVE_2.md for commands.
Marketing-only exports must be outside the repository. No network access is used
unless --font points to a font you downloaded separately for branded social text.
"""
from pathlib import Path
import argparse, base64, html, json, shutil, subprocess, sys, hashlib
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--browser', required=True)
parser.add_argument('--font', required=True, help='Local Jost 700 TTF for social graphics')
parser.add_argument('--kit-dir', type=Path, help='Optional marketing export directory, strictly outside this repository')
args = parser.parse_args()
KIT = args.kit_dir.resolve() if args.kit_dir else None
if KIT and (KIT == ROOT or ROOT in KIT.parents):
    parser.error('Marketing-only exports must be outside the repository')
WEB = ROOT / 'public/assets/identity'
WEB.mkdir(parents=True, exist_ok=True)
if KIT:
    for directory in ['Logos/Wordmarks','Logos/Compact','Logos/Standalone-M','Icons/Favicons','Icons/Touch-and-App','Social-Media/Facebook','Social-Media/LinkedIn','Social-Media/GitHub','Social-Media/Open-Graph','Social-Media/General','Brand-Guidelines']:
        (KIT / directory).mkdir(parents=True, exist_ok=True)
records = []

def svg(**task):
    return subprocess.check_output(['node', str(ROOT / 'scripts/identity/green-signature.mjs')],input=json.dumps(task).encode()).decode()

font = base64.b64encode(Path(args.font).read_bytes()).decode()
styles = f'''@font-face{{font-family:Jost;src:url(data:font/ttf;base64,{font}) format("truetype");font-weight:700;font-style:normal}}*{{box-sizing:border-box}}html,body{{margin:0;background:transparent}}svg{{display:block}}'''
with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path=args.browser, headless=True)
    page = browser.new_page(device_scale_factor=1)
    def render(content, target, width, height, transparent=True, kind='raster', note=''):
        target=Path(target);target.parent.mkdir(parents=True,exist_ok=True)
        page.set_viewport_size({'width':width,'height':height})
        page.set_content(f'<!doctype html><meta charset="utf-8"><style>{styles}</style><div id="art" style="width:{width}px;height:{height}px;overflow:hidden">{content}</div>')
        page.evaluate('''async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));}''')
        page.locator('#art').screenshot(path=str(target),omit_background=transparent,animations='disabled')
        records.append({'path':str(target.relative_to(KIT)) if KIT and KIT in target.parents else str(target.relative_to(ROOT)),'width':width,'height':height,'kind':kind,'note':note})
        return target
    def export_mark(target,kind,mode,width,height):
        return render(svg(kind=kind,mode=mode,width=width,height=height),target,width,height,kind='vector-render' if kind=='m-flat' else 'raster-source',note='Approved optical reconstruction' if kind=='m-flat' else 'Original raster geometry; native wordmark detail is 717px wide')
    for mode in ['light','dark']:
        export_mark(WEB/f'yourmove-wordmark-navigation-{mode}.png','compact',mode,768,268)
    favicon_svg=svg(kind='favicon')
    (WEB/'favicon.svg').write_text(favicon_svg)
    # Constant light tiles for legacy PNG/ICO clients; SVG adapts to browser theme.
    def tile(mode,size,filename):
        background='#f5f4f1' if mode=='light' else '#191c22'
        mark=svg(kind='m-flat',mode=mode,width=round(size*.55),height=round(size*.64))
        return render(f'<div style="width:100%;height:100%;background:{background};display:flex;align-items:center;justify-content:center">{mark}</div>',filename,size,size,False,kind='opaque-icon')
    # Tiny icons get more of the square than avatar/app icons.
    for size in [16,32,48]:
        markup=svg(kind='m-flat',width=max(1,size-4),height=max(1,size-4))
        render(f'<div style="width:100%;height:100%;background:#f5f4f1;display:flex;align-items:center;justify-content:center">{markup}</div>',WEB/f'favicon-{size}.png',size,size,False,kind='opaque-icon')
    im=Image.open(WEB/'favicon-48.png')
    # Append actual individually rendered small frames, never downsample a 48px substitute.
    frames=[Image.open(WEB/f'favicon-{s}.png') for s in [16,32,48]]
    im.save(ROOT/'public/favicon.ico',sizes=[(16,16),(32,32),(48,48)],append_images=frames)
    tile('light',180,WEB/'apple-touch-icon.png')
    def brand_image(mode,width):
        # Use the cropped primary source, not compact transparent navigation padding.
        markup=svg(mode=mode,width=width,height=round(width*163/717))
        return markup
    def social(filename,width,height,mode='dark',layout='og',title=None):
        background='#191c22' if mode=='dark' else '#f5f4f1'
        ink='#edf0f5' if mode=='dark' else '#242933'
        muted='#b0b8c5' if mode=='dark' else '#606773'
        accent='#aac5ff' if mode=='dark' else '#3459a5'
        if layout=='banner':
            logo_width=440 if width<1000 else 540
            content=f'<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px">{brand_image(mode,logo_width)}<p style="margin:0;font-size:{18 if width<1000 else 23}px;color:{muted}">Your experience. Your application. Your final say.</p></div>'
        elif layout=='square':
            content=f'<div style="position:absolute;top:100px;left:90px">{brand_image(mode,650)}</div><div style="position:absolute;top:435px;left:90px;right:90px;font-size:67px;line-height:1.1;letter-spacing:-2px">Real experience<br>is enough work.</div><div style="position:absolute;top:650px;left:90px;right:90px;color:{muted};font-size:33px;line-height:1.4">Applying shouldn\'t mean<br>doing it all over.</div><div style="position:absolute;bottom:80px;left:90px;font-size:23px;color:{accent}">yourmove.run</div>'
        else:
            text=title or 'Real experience is enough work.'
            # Article card uses its existing title, with no new claims or rewritten article copy.
            content=f'<div style="position:absolute;top:80px;left:80px">{brand_image(mode,570 if title else 660)}</div><div style="position:absolute;left:80px;right:75px;top:{270 if title else 305}px;font-size:{48 if title else 44}px;line-height:1.14;letter-spacing:-1px">{html.escape(text)}</div>'
            if not title:
                content+=f'<div style="position:absolute;left:80px;top:390px;color:{muted};font-size:29px">Applying shouldn\'t mean doing it all over.</div>'
            content+=f'<div style="position:absolute;bottom:58px;left:80px;font-size:22px;color:{accent}">yourmove.run</div>'
        body=f'<div style="position:relative;width:100%;height:100%;background:{background};color:{ink};font-family:Jost,sans-serif;font-weight:700"><div style="position:absolute;inset:0 0 auto;height:7px;background:{accent}"></div>{content}</div>'
        return render(body,filename,width,height,False,kind='social-graphic')
    social(WEB/'yourmove-og-default.png',1200,630)
    article_title="I Got Into the Meta Global AI Developer Hackathon. I'm Bringing YourMove."
    social(WEB/'yourmove-og-hackathon.png',1200,630,title=article_title)
    if KIT:
        for mode in ['light','dark','mono-ink','mono-white']:
            for width in [717,1434]:
                export_mark(KIT/f'Logos/Wordmarks/yourmove-wordmark-{mode}-{width}.png','wordmark',mode,width,round(width*163/717))
            for width in [384,768]:
                export_mark(KIT/f'Logos/Compact/yourmove-compact-{mode}-{width}.png','compact',mode,width,round(width*268/768))
            # Valid all-path SVG, honestly described as the approved optical reconstruction.
            (KIT/f'Logos/Standalone-M/yourmove-m-flat-{mode}.svg').write_text(svg(kind='m-flat',mode=mode,width=150,height=174))
            for height in [256,1024]:
                export_mark(KIT/f'Logos/Standalone-M/yourmove-m-flat-{mode}-{height}.png','m-flat',mode,round(height*150/174),height)
        for mode in ['light','dark']:
            export_mark(KIT/f'Logos/Standalone-M/yourmove-m-display-{mode}-native.png','m-display',mode,138,166)
            for size in [512,1024]:
                tile(mode,size,KIT/f'Icons/Touch-and-App/yourmove-app-candidate-{mode}-{size}.png')
        for f in WEB.glob('favicon*'):
            shutil.copy2(f,KIT/'Icons/Favicons'/f.name)
        shutil.copy2(ROOT/'public/favicon.ico',KIT/'Icons/Favicons/favicon.ico')
        shutil.copy2(WEB/'apple-touch-icon.png',KIT/'Icons/Touch-and-App/apple-touch-icon-180.png')
        for mode in ['light','dark']:
            tile(mode,320,KIT/f'Social-Media/Facebook/yourmove-facebook-profile-{mode}-320.png')
            tile(mode,400,KIT/f'Social-Media/LinkedIn/yourmove-linkedin-company-logo-{mode}-400.png')
            tile(mode,512,KIT/f'Social-Media/GitHub/yourmove-github-avatar-{mode}-512.png')
            social(KIT/f'Social-Media/Facebook/yourmove-facebook-cover-{mode}-851x315.png',851,315,mode,'banner')
            social(KIT/f'Social-Media/LinkedIn/yourmove-linkedin-company-banner-{mode}-1512x256.png',1512,256,mode,'banner')
            social(KIT/f'Social-Media/General/yourmove-social-square-{mode}-1080.png',1080,1080,mode,'square')
            if mode=='dark':
                shutil.copy2(WEB/'yourmove-og-default.png',KIT/'Social-Media/Open-Graph/yourmove-og-dark-1200x630.png')
            else:
                social(KIT/'Social-Media/Open-Graph/yourmove-og-light-1200x630.png',1200,630,mode)
        shutil.copy2(WEB/'yourmove-og-hackathon.png',KIT/'Social-Media/Open-Graph/yourmove-hackathon-1200x630.png')
    browser.close()
if KIT:
    # Include copied raster/vector files in an independently inspectable manifest too.
    assets=[]
    for f in sorted(KIT.rglob('*')):
        if not f.is_file() or f.suffix.lower() not in ['.png','.ico','.svg']: continue
        row={'file':str(f.relative_to(KIT)), 'sha256':hashlib.sha256(f.read_bytes()).hexdigest(), 'bytes':f.stat().st_size}
        if f.suffix.lower() in ['.png','.ico']:
            with Image.open(f) as im: row.update(width=im.width,height=im.height,mode=im.mode)
        else: row['provenance']='Approved path-based optical reconstruction; not an original master'
        assets.append(row)
    (KIT/'Brand-Guidelines/asset-manifest.json').write_text(json.dumps({'identity':'Green Signature B','assets':assets,'renderRecords':records},indent=2)+'\n')
print(json.dumps({'website':str(WEB),'kit':str(KIT) if KIT else None,'rendered':len(records)},indent=2))
