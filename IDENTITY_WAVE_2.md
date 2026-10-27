# YourMove / Quiet Ink Wave 2

**Approved direction:** Green Signature B. **Branch:** `redesign/quiet-ink`.

The website uses the exact approved B palettes and layered construction. The production SVG filter output matches the reviewed B filter byte for byte; all four flat M paths and fills match the approved optical reconstruction. No new direction or replacement lettering was introduced.

## Website implementation

- All 14 rendered routes use dedicated light navigation and dark footer PNGs under `public/assets/identity/`. Original compact framing, intrinsic aspect ratios, CSS widths, page layouts, visible copy, links, and analytics attributes are preserved.
- Removed the two footer whitening filters so the dark logo retains its light-cobalt and green planes. No Quiet Ink UI tokens or product actions were recolored.
- Added an adaptive all-path SVG favicon, 16/32/48px PNG fallbacks, a separately rendered multi-frame ICO, and a 180px Apple touch icon. Every page includes the icon and touch metadata.
- Added 1200 × 630 default and hackathon sharing cards with existing approved text and Jost. Every page, including docs, has explicit Open Graph and Twitter image metadata, dimensions, and descriptive image text.
- Blog templates inherit the homepage identity. `social_image` frontmatter and its Pages CMS field allow a dedicated sharing card without changing the editorial featured illustration. If no card is supplied, articles use the approved default identity card. Both articles and the blog index were regenerated locally; generated blog/feed/sitemap/robots output remains build output, outside this source commit, as before.
- The website brand guide now records B as the identity authority. Existing photography and editorial illustrations remain contextual artwork. The old PNG remains the pinned raster provenance source; no live header, footer, favicon, or social metadata uses it as branding.

## Final variants and source quality

| Variant | Details |
| --- | --- |
| Full wordmark | Original raster lettering and integrated M; native 717 × 163 crop; light/dark and monochrome ink/white |
| Compact horizontal | Original 768 × 268 framing, with 384px and 768px exports; consistent visible size in navigation |
| Display M | Original raster M crop at native 138 × 166 |
| Flat M | Exact approved four-plane optical reconstruction; genuine path SVG plus 256px/1024px-tall PNGs |
| Browser / touch | SVG theme adaptation; 16/32/48px PNG and ICO; opaque 180px Apple tile |
| App / avatar | Circle-safe opaque light/dark candidates and destination-sized profiles |
| Sharing | Light/dark Facebook and LinkedIn covers; wide OG and square general sharing; dedicated hackathon card |

The wordmark source is a **768 × 268 RGBA PNG**; no original editable vector master exists in the repository. No wordmark is mislabeled as vector. The 1434px marketing wordmarks are explicitly documented as upscaled raster exports. Standalone M SVGs are valid path artwork based on the approved reconstruction, not recovered exact original masters. Transparent logo PNGs retain clean alpha; social/profile/app tiles intentionally use opaque backgrounds.

Source SHA-256: `c768d24d778a11e0f7708e515ac99e0f2d34d453bca811749a11dc2d62dc0ea9`.

Light B planes, front to rear: `#242933`, `#E9EEF8`, `#AAC5FF`, `#215C43`. Dark B: `#EDF0F5`, `#D4E1FB`, `#AAC5FF`, `#78B696`.

## Marketing handoff

Final ZIP: `/Users/jenksed/Downloads/YourMove-Quiet-Ink-Brand-and-Marketing-Kit.zip`.

The standalone ZIP has **61 files** organized into `Logos/`, `Icons/`, `Social-Media/`, and `Brand-Guidelines/`, plus a plain-language README. It includes a concise Markdown guide, a linked offline HTML contact sheet and PNG contact sheet, a dimension/hash manifest, and a complete package inventory. Font files, third-party logos, and source photographs are not redistributed.

The expanded staging kit is outside the repository at `/private/tmp/yourmove-wave2-kit/YourMove-Quiet-Ink-Brand-and-Marketing-Kit/`. Neither the ZIP nor marketing-only image exports are staged or committed. Targeted `.gitignore` entries guard against accidental inclusion.

ZIP size: 1,690,287 bytes. SHA-256: `886033a6246722362cd880ae1f8dcf276fdfe9e29708f9a9ef95a882f46619e7`.

## Reproduction

Normal website builds need no additional dependencies:

```sh
npm run build
npm run check:blog
python3 -m http.server 8765 --directory public
```

The optional local authoring scripts require Pillow, Playwright, installed Chromium, and a local Jost 700 TTF. They are not website runtime dependencies and do not run in the normal site build. Supply paths appropriate to your environment:

```sh
python scripts/export_identity.py --browser /path/to/chromium --font /path/to/Jost-700.ttf --kit-dir /path/outside/repo/YourMove-Quiet-Ink-Brand-and-Marketing-Kit
python scripts/package_identity.py --browser /path/to/chromium --kit-dir /path/outside/repo/YourMove-Quiet-Ink-Brand-and-Marketing-Kit --zip /path/outside/repo/YourMove-Quiet-Ink-Brand-and-Marketing-Kit.zip
```

The exporter pins the original PNG checksum and uses `scripts/identity/green-signature.mjs` as the approved construction. Both tools reject marketing output destinations inside the repository. Omitting `--kit-dir` from the exporter generates only website assets. Marketing PNGs and native source limitations are documented inside the kit.

## Local verification

**Story:** a visitor loads any site route, receives the matching B header/footer, uses unchanged navigation and interactions, and shares a URL whose metadata resolves to a valid branded image; marketing can unpack and use the separate kit without source-code knowledge.

- **PASS:** website build, regenerated two articles, blog check, JavaScript/Python syntax checks, and `git diff --check`.
- **PASS:** 14 routes × 1440/768/390px = **42 renders**, no introduced overflow, page JavaScript errors, console errors, or failed local HTTP responses. Existing known tablet overflow remains exactly 785px on the homepage and 786px on the blog routes at 768px.
- **PASS:** mobile menus and Escape on all routes, no-JavaScript mobile navigation, comparison mouse/keyboard states, hover/focus, real clipboard command copying, Get Started disclosure, evidence tabs, documentation state selection, search/Escape, and recovery deep links.
- **PASS:** all local links/assets resolve; every page's OG/Twitter/touch icon metadata targets real images with correct dimensions. Runtime JS, visible copy, navigation/analytics attributes, original illustration bytes, and every CSS file outside the two removed whitening filters match the saved baseline.
- **PASS:** source-correct palettes, byte-identical approved filter output, identical approved M paths, transparent logo alpha, exact separately rendered ICO 16/32/48px frames, and live SVG favicon theme switching.
- **PASS:** representative close-ups on desktop/mobile show unfiltered light/dark logos. Marketing contact-sheet previews all load; all PNGs decode after reading them directly from the final ZIP; ZIP CRC and full-file inventory/hash checks pass. The Downloads copy matches the validated ZIP byte for byte.

Evidence is local, outside the commit: `artifacts/identity-wave-2/final/checks.json`, `final/identity/checks.json`, `final/approved-design-match.json`, full-page captures under `final/after/`, and header/footer close-ups under `final/identity/`. Existing `.serena/`, `graft/`, review artifacts, and generated build output were left untracked.

Local preview: http://[::1]:8765/ (existing Python public-root server). The repository-root review server at http://127.0.0.1:8772/ can also reach production pages under `/public/` and local evidence under `/artifacts/`.

No merge, push, deployment, application-repository edits, or Wave 3 work occurred.
