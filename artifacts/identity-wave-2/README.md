# YourMove identity — Wave 2 visual review

Review status: **unapproved**. This directory is a standalone local comparison, outside the production `public/` root. No site-wide replacements, production pack, push, merge, or deployment were performed.

Open http://127.0.0.1:8772/artifacts/identity-wave-2/ while the repository-root preview server is running:

```sh
cd /Users/jenksed/Projects/yourmove-lp
python3 -m http.server 8772 --bind 127.0.0.1
```

The page includes the original, three full wordmark treatments on canvas and graphite, source-derived standalone M variants, navigation comparisons, actual 32px/16px flat icon studies, square social avatars, and selectable header/footer/docs/journal placements. Placement navigation labels are visual specimens. The direction buttons are interactive and keyboard accessible. No framework or runtime dependency was added. Jost matches the site's existing font loading; lettering inside the logo is always the original raster lettering.

## Recommendation

**B — Green signature.** Retain a deliberate green rear plane, introduce Quiet Ink light cobalt in the middle, and anchor the lettering/front plane in graphite. This retains recognition while connecting the identity to the site's cobalt actions. The dark adaptation uses light lettering, blue intermediate planes, and lighter green. Green here identifies the brand; it does not change Wave 1 UI semantics.

- A — Cobalt layers: the most direct palette alignment, with the established green removed from the primary signature.
- B — Green signature: strongest continuity with the approved identity and a clear connection to Quiet Ink.
- C — Graphite relief: useful tonal editorial treatment; less distinctive as the primary identity. This is a multitone study, not the final single-color variant.

| Direction | Light: front / white plane / middle / rear | Dark: front / white plane / middle / rear |
| --- | --- | --- |
| A | `#242933 / #DCE6FA / #8DA9DF / #3459A5` | `#EDF0F5 / #DCE6FA / #8DA9DF / #AAC5FF` |
| B | `#242933 / #E9EEF8 / #AAC5FF / #215C43` | `#EDF0F5 / #D4E1FB / #AAC5FF / #78B696` |
| C | `#242933 / #E5E8ED / #A2ABB8 / #606773` | `#EDF0F5 / #D9DDE3 / #A2ABB8 / #8792A0` |

Study-only green and intermediary shades are identity colors. No production tokens were edited. Canvas remains `#F5F4F1`, graphite `#191C22`, and product action cobalt `#3459A5` in the placements.

## Artwork provenance

Inspected `QUIET_INK_WAVE_1.md`, the superseding Quiet Ink section and full `WEBSITE_BRAND_GUIDE.md`, all current site assets, HTML and logo CSS, the blog generator, and metadata references. No supplied original image was attached to this request.

- `public/assets/logo-official.png` is a **768 × 268 RGBA PNG**, not an SVG. Its transparency, lettering, integrated M, four stepped planes, sloped shoulders, rounded corners, spacing, and aspect ratio are retained in wordmark studies.
- Full wordmarks and large standalone M treatments use **live SVG filters over that original bitmap**. Mapping source luminance bands to colors flattens the original surface shading. No text is retyped. Tighter transparent cropping improves alignment without changing internal proportions.
- The wordmark viewBox is `29 49 717 163`, measured against source pixels. The navigation study matches the existing visible artwork width rather than enlarging the proposed logo. Original 163px and 145px image boxes contain approximately 153px and 136px visible artwork respectively. The docs mobile image box is 144px.
- The small flat M uses **manual optical reconstruction** of the four planes as inline SVG paths. It follows the same silhouette, shoulders, front cutout, layer order, and stepped construction. It removes bevels, shadows, and micro-outlines for small-size separation. It is explicitly not an exact original vector master.
- No editable SVG, AI, EPS, PDF, or PSD logo master was found in the current repository file inventory. A PNG inside an SVG container is still raster artwork. No reconstructed artwork is presented as an original master.
- The source bitmap limits the resolution of the wordmark. Original outlines and any raster edge artifacts are retained; a genuine vector source would be preferable before producing high-resolution exact-master exports. The standalone reconstruction needs final optical tuning after selection, especially at 16px and across display densities.

## Current implementation audit

There are **14 rendered routes / 28 wordmark placements**, each referencing the same official PNG in header and footer:

`/`, `/get-started/`, `/how-it-works/`, `/evidence/`, `/manifesto/`, `/review/`, `/support/`, `/docs/`, `/docs/first-application/`, `/docs/availability/`, `/docs/troubleshooting/`, `/blog/`, `/blog/why-im-building-yourmove/`, `/blog/meta-global-ai-developer-hackathon-yourmove/`.

- Shared marketing/blog `.site-logo` is 163px on desktop, 145px on mobile in the final `brand-refresh.css` cascade. Documentation adds its own 144px mobile override.
- Marketing/blog `.footer-logo img` is 174px and rendered white using `brightness(0) invert(1)`. Documentation `.doc-footer img` is 175px with the same filter. The all-white treatment loses the color differentiation between M planes.
- `scripts/build-blog.mjs` extracts the homepage announcement/header/footer. Future selected identity updates must cover that source and the separately authored docs footers, then regenerate blog pages.
- Every route references `/favicon.ico?v=20261025`. The ICO binary has **16 × 16, 32 × 32, and 48 × 48 PNG frames**. These have a more dimensional promotional M treatment than the flatter wordmark source.
- No touch-icon link, web app manifest, or explicit Twitter image override was found. Docs have no OG image declaration.
- Non-doc pages use the 1200 × 630 `public/assets/og-platforms.webp` as the default OG image, except the hackathon article, which uses `public/assets/blog/yourmove-meta-hackathon-featured.webp`. These contain embedded identity/promotional artwork and need a separate approved adaptation, not an indiscriminate logo recolor.
- The photographic hero and other illustrated assets remain unchanged. No desktop or hackathon repository was modified or used as an editable source.

Source SHA-256 checksums:

```text
logo-official.png  c768d24d778a11e0f7708e515ac99e0f2d34d453bca811749a11dc2d62dc0ea9
favicon.ico        fbc50f7142ed6f8e13356c919e58feeaa7e9b170e8caf15655e870d499b53079
```

## Validation and review evidence

Rendered with installed Chromium at **1440 / 768 / 390 CSS pixels**. All three sizes have no document overflow, failed HTTP responses, or page JavaScript errors. All original raster images load. Favicon studies measure exactly 32 × 32 and 16 × 16 CSS pixels. Direction buttons A/B/C switch the complete placement group, maintain a single pressed state, and respond to keyboard Enter. JavaScript syntax and `git diff --check` pass. These are representative visual checks, not a complete accessibility certification.

- `comparison-1440.png`, `comparison-768.png`, `comparison-390.png`: full-page previews.
- `directions.png`: three treatments side by side.
- `small-marks.png`: source crops, optical marks, tiny icons, avatars.
- `placement-a.png`, `placement-b.png`, `placement-c.png`: representative website placements.
- `checks.json`: measured viewport and interaction results.
- `source-inspection.html` / `.png`: original wordmark and existing promotional asset inspection.

All work is contained in `artifacts/identity-wave-2/`. Existing tracked files have no diff. Pre-existing untracked blog/build output and other local review directories were left intact.

## Approval gate

Choose A, B, or C, or request a targeted revision. **Stop here for visual approval.** After approval, standardize the selected light/dark wordmarks, standalone M, compact navigation, monochrome variants, favicon/touch icons, avatars, OG graphics, and transparent PNG exports. Produce genuine vector files only where provenance supports them; label any optical reconstruction and raster-wrapper SVG accurately. Do not replace production logos or export that final pack before the direction is approved.
