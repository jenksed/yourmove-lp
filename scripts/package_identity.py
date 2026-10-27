"""Finish an external Green Signature B kit: guide, contact sheet, inventory, ZIP.

Run export_identity.py first. Both --kit-dir and --zip must be outside the repo.
Requires optional local Pillow, Playwright, and Chromium authoring tools.
"""
from pathlib import Path
import argparse, hashlib, html, json, zipfile
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--kit-dir',required=True,type=Path)
parser.add_argument('--zip',required=True,type=Path)
parser.add_argument('--browser',required=True)
args=parser.parse_args()
KIT=args.kit_dir.resolve();ZIP=args.zip.resolve()
for output in [KIT,ZIP]:
    if output==ROOT or ROOT in output.parents:parser.error('Marketing exports and ZIP must be outside the repository')
if not KIT.is_dir():parser.error('Export the kit first')
GUIDE='''# YourMove: Quiet Ink brand and marketing guide

Approved identity: **Green Signature B**, October 27, 2026.

## Start here

Use `Logos/Wordmarks/yourmove-wordmark-light-717.png` on light backgrounds and `yourmove-wordmark-dark-717.png` on graphite. The integrated M and YourMove lettering form one approved unit. Do not retype, separate, rearrange, stretch, or redraw the wordmark.

The green rear plane is a deliberate part of the logo. Website links and product actions remain cobalt. Green in the identity does not make green the default action or status color.

Open `visual-contact-sheet.html` for linked previews of the files, or `visual-contact-sheet.png` for a quick visual overview. Use the finished PNGs directly. Everything needed to identify and use the assets is in this ZIP; a source checkout is not required.

## Approved logo variants

| Variant | Where to find it | Use |
| --- | --- | --- |
| Primary / light surface | `Logos/Wordmarks/*light*` | Canvas, white, or light neutral backgrounds |
| Dark surface | `Logos/Wordmarks/*dark*` | Graphite backgrounds; dedicated light lettering and lighter green |
| Compact horizontal | `Logos/Compact/` | Navigation and constrained horizontal placements; same artwork with the original framing |
| Monochrome ink | Files containing `mono-ink` | One-color dark reproduction on a light surface |
| Monochrome white | Files containing `mono-white` | One-color white reproduction on a dark surface |
| Display M | `Logos/Standalone-M/*display*` | The M cropped from the original raster wordmark, at native resolution |
| Flat M | `Logos/Standalone-M/*flat*` | Small icons, avatars, and application icon candidates; PNG and all-path SVG |

The light palette, ordered front / white plane / middle / rear, is **#242933 / #E9EEF8 / #AAC5FF / #215C43**. The dark adaptation is **#EDF0F5 / #D4E1FB / #AAC5FF / #78B696**. These are the exact approved B colors. Do not recolor the logo to match each section or social network.

## Quiet Ink palette

| Role | HEX |
| --- | --- |
| Canvas | #F5F4F1 |
| Surface | #FFFFFF |
| Muted surface | #EEEFF1 |
| Primary ink | #242933 |
| Secondary text | #606773 |
| Border | #D9DDE3 |
| Strong border | #8792A0 |
| Primary action / focus | #3459A5 |
| Action hover | #284984 |
| On action | #FFFFFF |
| Action soft | #E9EEF8 |
| Confirmed success | #2C694D |
| Success soft | #EAF2ED |
| Attention | #815719 |
| Danger | #A13736 |
| Dark surface | #191C22 |
| Secondary dark surface | #22262E |
| Text on dark | #EDF0F5 |
| Secondary text on dark | #B0B8C5 |
| Light action / focus on dark | #AAC5FF |
| Logo signature green on light | #215C43 |
| Logo signature green on dark | #78B696 |
| Logo white plane on dark | #D4E1FB |

Existing honey support imagery is a deliberate editorial exception. It does not replace Quiet Ink actions or the approved logo palette.

## Typography

Use **Jost** for marketing headlines, body copy, and supporting labels. The website uses weights 400 through 900; the supplied social graphics use Jost 700. Keep a system sans-serif fallback when authoring digital materials. The wordmark's original raster lettering is artwork, not live Jost text: do not recreate it by typing “YourMove.” Font files are not included; obtain Jost from Google Fonts when creating new materials.

## Clear space and minimum sizes

Use clear space of at least **one quarter of the layered M's total height** around the visible logo. Transparent padding in a file does not necessarily provide all required clear space; add spacing in the layout.

For ordinary digital wordmarks, keep the visible artwork at least **136px wide**. A compact image box of 145px contains about 135px of visible artwork; this is the existing mobile navigation exception. Prefer larger where space permits. Use the flat M instead of squeezing the full wordmark below this size. Standalone marks should normally be at least 24px tall; dedicated favicon exports are optically reviewed exceptions at 16px and 32px.

The primary PNG has 717 x 163 source pixels. A 1434 x 326 export is included for convenient placement, but it is an **upscaled raster, not additional original detail**. Compact files are 384 x 134 and 768 x 268. Flat M SVGs scale as paths; their shapes are the approved optical reconstruction. For large-format print that needs an exact original vector wordmark, obtain an original editable master first.

## Backgrounds and use

- Use the light wordmark on canvas or white. Use the dark wordmark on graphite.
- Keep the green rear plane and light-cobalt middle plane in the full-color identity.
- Use the dedicated monochrome files when only one ink is available.
- Keep enough quiet background around the mark; place it on a solid panel over a busy photograph.
- Never squash, crop into the artwork, change layer order, add a bevel/glow/shadow, or apply a CSS whitening filter to the color version.
- Do not use the large dimensional promotional icon as a tiny favicon. Use the flat M supplied here.
- Do not imply automatic application submission, platform certification, release availability, or new product capabilities through new marketing art. Reuse approved copy and verify future claims.

## Social and application files

| Destination | Ready-to-use files | Dimensions |
| --- | --- | --- |
| Facebook profile | `Social-Media/Facebook/*profile*` | 320 x 320 |
| Facebook cover | `Social-Media/Facebook/*cover*` | 851 x 315 |
| LinkedIn company logo | `Social-Media/LinkedIn/*company-logo*` | 400 x 400 |
| LinkedIn company banner | `Social-Media/LinkedIn/*banner*` | 1512 x 256 |
| GitHub / social avatar | `Social-Media/GitHub/` | 512 x 512 |
| Open Graph / wide sharing | `Social-Media/Open-Graph/` | 1200 x 630 |
| General square sharing | `Social-Media/General/` | 1080 x 1080 |
| Apple touch icon | `Icons/Touch-and-App/apple-touch-icon-180.png` | 180 x 180 |
| Square app icon candidates | `Icons/Touch-and-App/*app-candidate*` | 512 x 512 and 1024 x 1024 |
| Browser icons | `Icons/Favicons/` | 16, 32, 48 PNG; multi-frame ICO; adaptive SVG |

Each social destination has light and dark artwork. Avatars have opaque backgrounds and a centered, circle-safe M; banners center the identity and keep key content away from edges. Network cropping and profile-photo overlays vary across devices: preview after uploading before publishing. Choose the matching supplied size rather than stretching a different format. The application icon is a **candidate**, not a packaged macOS `.icns` or an approved application repository change.

The PNG/ICO favicons use an opaque canvas tile for reliable legacy-tab contrast. The all-path SVG favicon switches its tile and M palette for light/dark browser preferences. The monochrome logo files retain transparency. Normal logo PNGs have transparent backgrounds; social cards and app/profile tiles intentionally do not.

Size references checked October 27, 2026: [LinkedIn Pages image specifications](https://www.linkedin.com/help/linkedin/answer/a570368). Facebook cover/profile uploads use the standard 851 x 315 / 320 x 320 formats; [Meta's help page](https://www.facebook.com/help/125379114252045) required login during verification, so recheck its live uploader's crop preview before publishing.

## Artwork provenance and limitations

The available official wordmark is a 768 x 268 transparent PNG. No original editable SVG, AI, EPS, PDF, or PSD master was available. Full wordmarks preserve its lettering, spacing, integration, and geometry using the exact approved B tonal mapping; the full-color source shading is flattened as shown in the approved comparison. They are delivered honestly as PNGs, not bitmaps disguised as vector SVGs.

Standalone flat M SVGs are valid path-based artwork, drawn from the approved four-plane optical reconstruction. They are not claimed to be an exact recovered original vector master. The display M preserves the original raster geometry and retains its source edge character. The 1434px wordmarks are explicitly upscaled. No asset in this kit guarantees new detail that was absent in the original.

Existing website photography and editorial illustrations remain historical/conceptual artwork. Do not extract logos from them for future brand use. Use the assets in this package instead. No third-party platform marks, source photography, or font files are redistributed in this kit. No new licensing rights are asserted; confirm rights before third-party distribution beyond the project's marketing team.

`asset-manifest.json` lists image dimensions and SHA-256 hashes. `package-inventory.json` lists every deliverable and its hash. The website implementation and this marketing kit are separate: the ZIP and marketing-only exports are intentionally outside Git.
'''
(KIT/'Brand-Guidelines/brand-guide.md').write_text(GUIDE)
(KIT/'README.md').write_text('''# YourMove - Quiet Ink Brand and Marketing Kit

Approved identity: **Green Signature B**.

1. Open `Brand-Guidelines/visual-contact-sheet.html` to browse the actual files, or its PNG for a quick overview.
2. Read `Brand-Guidelines/brand-guide.md` for colors, correct variants, sizing, typography, and source limitations.
3. Choose the ready-to-use file from `Logos/`, `Icons/`, or `Social-Media/`.

**Primary on light:** `Logos/Wordmarks/yourmove-wordmark-light-717.png`\x20\x20
**Primary on dark:** `Logos/Wordmarks/yourmove-wordmark-dark-717.png`\x20\x20
**Small mark:** `Logos/Standalone-M/yourmove-m-flat-light.svg` or its dark equivalent.\x20\x20
**Default wide share:** `Social-Media/Open-Graph/yourmove-og-dark-1200x630.png`

Wordmark PNGs retain the original raster lettering. The 1434px versions are upscaled exports; they do not add source detail. The standalone M SVGs are approved optical reconstructions, not original vector masters. Social and app tiles intentionally have opaque backgrounds; ordinary logo PNGs are transparent.

The kit contains no source-code dependency, third-party platform logos, or font files. There is no publication or account upload step in this package.
''')
# Explicit filenames make the contact sheet useful to a team without repository context.
groups=[
 ('01 / Wordmarks',[(f'Logos/Wordmarks/yourmove-wordmark-{mode}-717.png',f'{label} / native 717 x 163') for mode,label in [('light','Primary on light'),('dark','Primary on dark'),('mono-ink','Monochrome ink'),('mono-white','Monochrome white')]]),
 ('02 / Compact and standalone',[(f'Logos/Compact/yourmove-compact-{mode}-384.png',f'Compact {mode} / 384 x 134') for mode in ['light','dark']]+[(f'Logos/Standalone-M/yourmove-m-flat-{mode}.svg',f'Flat M {mode} / path-based reconstruction') for mode in ['light','dark']]+[(f'Logos/Standalone-M/yourmove-m-display-{mode}-native.png',f'Display M {mode} / original raster geometry') for mode in ['light','dark']]),
 ('03 / Browser, touch and app',[(f'Icons/Favicons/favicon-{s}.png',f'Favicon / actual {s}px') for s in [16,32,48]]+[('Icons/Touch-and-App/apple-touch-icon-180.png','Apple touch / 180 x 180')]+[(f'Icons/Touch-and-App/yourmove-app-candidate-{mode}-1024.png',f'App candidate {mode} / 1024 x 1024') for mode in ['light','dark']]),
 ('04 / Avatars',[(f'Social-Media/{platform}/yourmove-{stem}-{mode}-{s}.png',f'{platform} {mode} / {s} x {s}') for platform,stem,s in [('Facebook','facebook-profile',320),('LinkedIn','linkedin-company-logo',400),('GitHub','github-avatar',512)] for mode in ['light','dark']]),
 ('05 / Covers and banners',[(f'Social-Media/Facebook/yourmove-facebook-cover-{mode}-851x315.png',f'Facebook cover {mode} / 851 x 315') for mode in ['light','dark']]+[(f'Social-Media/LinkedIn/yourmove-linkedin-company-banner-{mode}-1512x256.png',f'LinkedIn banner {mode} / 1512 x 256') for mode in ['light','dark']]),
 ('06 / Sharing',[(f'Social-Media/Open-Graph/yourmove-og-{mode}-1200x630.png',f'Open Graph {mode} / 1200 x 630') for mode in ['light','dark']]+[('Social-Media/Open-Graph/yourmove-hackathon-1200x630.png','Hackathon article / 1200 x 630')]+[(f'Social-Media/General/yourmove-social-square-{mode}-1080.png',f'General square {mode} / 1080 x 1080') for mode in ['light','dark']]),
]
sections=[]
for title,items in groups:
    cards=[]
    for rel,label in items:
        assert (KIT/rel).is_file(),rel
        on_dark=('dark' in rel or 'mono-white' in rel) and rel.startswith('Logos/')
        small='Favicons/' in rel
        style=f'width:{Image.open(KIT/rel).width}px;height:{Image.open(KIT/rel).height}px' if small else ''
        cards.append(f'<a class="card" href="../{rel}"><div class="stage {"dark" if on_dark else "light"}"><img src="../{rel}" style="{style}" alt="{html.escape(label)}"></div><strong>{html.escape(label)}</strong><span>{html.escape(rel)}</span></a>')
    sections.append(f'<section><h2>{html.escape(title)}</h2><div class="grid">'+''.join(cards)+'</div></section>')
contact='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>YourMove / Green Signature B asset contact sheet</title><style>*{box-sizing:border-box}body{margin:0;background:#f5f4f1;color:#242933;font:16px system-ui,sans-serif}main{padding:52px;max-width:1600px;margin:auto}header{border-bottom:1px solid #d9dde3;padding-bottom:24px}header p{color:#3459a5;font-size:12px;letter-spacing:.1em;font-weight:700}h1{font-size:44px;margin:16px 0;letter-spacing:-.04em}header span{display:block;color:#606773;line-height:1.7;max-width:1100px}section{padding-top:24px}h2{font-size:19px;margin:10px 0 20px}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.card{display:block;background:white;border:1px solid #d9dde3;padding:12px;text-decoration:none;color:inherit;min-width:0}.stage{height:150px;display:flex;align-items:center;justify-content:center;padding:18px;margin-bottom:13px}.light{background:#f5f4f1}.dark{background:#191c22}.stage img{max-width:100%;max-height:115px;object-fit:contain}.card strong{display:block;font-size:12px;margin-bottom:8px}.card span{display:block;color:#606773;overflow-wrap:anywhere;font:10px/1.6 ui-monospace,monospace}footer{font-size:12px;color:#606773;border-top:1px solid #d9dde3;margin-top:28px;padding-top:20px;line-height:1.7}@media(max-width:800px){main{padding:24px}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}h1{font-size:30px}}</style><main><header><p>YOURMOVE / QUIET INK / APPROVED IDENTITY</p><h1>Green Signature B</h1><span>Click any preview to open its file. Use the light wordmark on light surfaces and the dedicated dark wordmark on graphite. Tiny icons are shown at their actual pixel size; other previews are scaled to fit. Wordmarks are raster-based; standalone flat M SVGs are approved optical reconstructions.</span></header>'''+''.join(sections)+'''<footer>Also included: 1434px upscaled wordmarks; 768px compact files; 256px and 1024px flat M PNGs in color and monochrome; 512px app candidates; multi-frame ICO and adaptive SVG favicon. See brand-guide.md for sizing, clear space, palette, typography, provenance, and usage guidance.</footer></main></html>'''
contactfile=KIT/'Brand-Guidelines/visual-contact-sheet.html';contactfile.write_text(contact)
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=args.browser)
    page=browser.new_page(viewport={'width':1600,'height':1000},device_scale_factor=1)
    page.goto(contactfile.as_uri(),wait_until='load')
    assert page.evaluate('''async()=>{await Promise.all([...document.images].map(i=>i.decode()));return [...document.images].every(i=>i.complete&&i.naturalWidth>0)}''')
    assert page.evaluate('document.documentElement.scrollWidth')==1600
    page.screenshot(path=str(KIT/'Brand-Guidelines/visual-contact-sheet.png'),full_page=True)
    browser.close()
# Verify assets decode and the promised native dimensions, alpha, vector provenance.
assets=[]
for p in sorted(KIT.rglob('*')):
    if not p.is_file() or p.name=='package-inventory.json':continue
    if p.suffix=='.png':
        with Image.open(p) as im:
            im.load()
            if '/Logos/' in str(p):
                assert im.mode=='RGBA',p
                assert im.getchannel('A').getextrema()[0]==0,p
                assert im.getpixel((0,0))[3]==0,p
            if '/Social-Media/' in str(p) or '/Touch-and-App/' in str(p):
                assert im.mode=='RGB' or im.getchannel('A').getextrema()==(255,255),p
    if p.suffix=='.svg':
        text=p.read_text();assert '<path' in text and '<image' not in text,p
    assets.append({'file':str(p.relative_to(KIT)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(KIT/'Brand-Guidelines/package-inventory.json').write_text(json.dumps({'identity':'Green Signature B','files':assets},indent=2)+'\n')
ZIP.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(ZIP,'w',zipfile.ZIP_DEFLATED) as archive:
    for p in sorted(KIT.rglob('*')):
        if p.is_file():archive.write(p,Path(KIT.name)/p.relative_to(KIT))
with zipfile.ZipFile(ZIP) as archive:
    assert archive.testzip() is None
    assert len(archive.namelist())==len(assets)+1
    for member in archive.infolist():
        assert not member.filename.startswith('/') and '..' not in Path(member.filename).parts
        assert not any(s in member.filename for s in ['.git/','node_modules/','.DS_Store'])
    # Re-open every PNG directly from the ZIP, not just the staging directory.
    import io
    for name in archive.namelist():
        if name.endswith('.png'):
            with Image.open(io.BytesIO(archive.read(name))) as im:im.load()
    print(json.dumps({'zip':str(ZIP),'files':len(archive.namelist()),'bytes':ZIP.stat().st_size,'crc':'PASS','images':'all decode','transparency':'PASS','sha256':hashlib.sha256(ZIP.read_bytes()).hexdigest()},indent=2))
