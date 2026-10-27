# YourMove · Quiet Ink Wave 1

Local branch: `redesign/quiet-ink`. Baseline: `8b06613` (`main`). No push, merge, deployment, application-repository edits, or asset changes.

The implementation preserves the static HTML/CSS/JavaScript architecture, Markdown blog, Jost typography, photographic hero, official logo, layouts, marketing copy, analytics attributes, navigation, release promises, and external destinations. The only visible text edits are the technical color specimens/descriptions on `/review/`, keeping that design reference accurate.

## Effective changes

- `public/styles.css` declares the semantic Quiet Ink foundation. Existing palette names in the overlapping CSS layers now alias those roles.
- `brand-refresh.css` owns effective shared navigation, action/link, focus, footer, Get Started, Evidence, Manifesto, and homepage chapter colors. Dedicated hero, comparison, process, how-it-works, support, blog, docs, and release styles resolve their later overrides.
- Product actions use cobalt `#3459A5`, hovering to `#284984`; light text/action colors support graphite sections. The process is graphite, retained work remains one restrained cobalt chapter, agency uses warm canvas, the founder story uses action-soft, and the final CTA uses graphite surface.
- Saved/selected/available illustrative information is neutral or action-soft. Unresolved input and recovery use amber. Independent/release indicators no longer imply green success. Error marks use danger. Green remains available for confirmed positive outcomes.
- Honey donation gradients remain; support actions now use graphite and white. Donation wording, Ko-fi URLs, optionality, and disclaimers are intact.
- The hero retains its photograph and geometry. A warm backing keeps the small availability note readable over the photo; small footer copy uses primary ink. The blank comparison retains full-opacity source labels for readability.
- Browser theme-color metadata follows the canvas. The existing brand guide has a short superseding color-authority section; broader rewriting is deferred.
- Added the missing `package-lock.json` from the existing pinned dependencies so `npm ci` works. No runtime dependencies were added or upgraded.

## Local preview and evidence

```sh
npm ci
npm run build
python3 -m http.server 8765 --directory public
```

Open http://localhost:8765/ (or http://[::1]:8765/ for the Python instance running in this session). An existing IPv4 Node preview also occupied 8765 in this environment; final verification addressed the Python IPv6 server directly, avoiding that preview's injected reload WebSockets. Neither site source nor production configuration was changed to accommodate it.

[Before/after screenshot gallery](artifacts/quiet-ink/index.html) contains the homepage, Get Started, blog index, generated article, and docs at **1440 / 768 / 390px**: 30 full-page captures. All remaining routes also have captures at those widths. Original captures use a separately served snapshot of the baseline, including the original blog build. Screenshots and detailed machine logs remain local review artifacts outside the commit.

## Verification results

- **PASS:** `npm ci`, `npm run build`, `npm run check:blog`, and `git diff --check`; two published blog articles generate.
- **PASS:** actual served-site acceptance across **14 pages × 3 widths = 42 renders**, with no introduced overflow, JavaScript exceptions, browser console errors, or failed local responses. Existing local links, fragments, CSS, scripts, and image targets resolve.
- **PASS:** comparison mouse/keyboard states and records, hero hover/focus, mobile menus and Escape on every page, no-JavaScript homepage navigation, Get Started disclosures and real clipboard copying, evidence tabs, docs mouse/keyboard selection, recovery attention, search/Escape, and deep-linked troubleshooting disclosure.
- **PASS:** existing Get Started suite (11 widths) and mock analytics suite (6 routes / 12 pageview configurations plus CTA, comparison, navigation, copy, workflow and evidence events). Existing Linux Chromium paths and screenshot paths were substituted in temporary runners; repository test infrastructure was not changed.
- **PASS:** source comparison confirms original link/image/script/analytics attributes, marketing copy, runtime JavaScript, release configuration, content, and approved assets remain intact. Only `/review/` technical color descriptions/specimens change text.
- **PASS:** final computed-color inspection of all 14 pages found no remaining green product surfaces or ordinary green text; the success specimen on `/review/` is intentional. Representative solid text and button contrasts pass; gradient/image measurements are separate.

Representative minimum ratios from computed foreground colors and rendered backgrounds at the requested widths:

| Treatment | Minimum ratio |
| --- | ---: |
| White navigation CTA on cobalt | 6.73:1 |
| Hero eyebrow over photo | 5.25:1 |
| Hero headline over photo (large text) | 4.82:1 |
| Hero supporting copy over photo | 7.21:1 |
| Hero availability note | 11.79:1 |
| Hero footnote copy | 9.21:1 |
| Honey footer explanatory text | 9.59:1 |
| Honey support-card disclaimer | 8.89:1 |
| Honey closing disclaimer | 9.12:1 |

Photo measurements use background pixels under visible glyphs, with text temporarily hidden after recording computed foreground colors; honey samples conservatively include the text-range background. These are representative checks, not a full accessibility certification.

## Existing limitations and later-wave notes

- **Unchanged tablet overflow:** at 768px the homepage document is 785px wide; the blog index and both articles are 786px wide. Before and after measurements match exactly. The existing header navigation causes this; no layout/breakpoint changes were introduced in this color wave.
- Two legacy suites fail identically on the original baseline and updated site: `site_checks.py` finds the `/review/` page 325px wide at a 320px viewport; `release_banner_checks.py` finds the stripped/embedded homepage 347px wide at 320px. Those suites stop at their first failure, so their remaining cases are not claimed as passed. The real served 390/768/1440 checks supply independent coverage.
- The approved logo, hero's embedded application artwork, and blog illustrations retain their original green artwork. The existing white footer rendering/filter is also preserved. Evaluate coordinated light/dark logo variants and embedded artwork in the identity wave.
- Historical color assignments remain below the superseding section in the brand guide, explicitly marked as earlier guidance pending the final audit. Inactive legacy CSS remains intentionally untouched except for foundational aliases.

Detailed results: [served checks](artifacts/quiet-ink/checks.json), [existing suite output](artifacts/quiet-ink/existing-checks.txt), [baseline failures](artifacts/quiet-ink/baseline-existing-checks.txt), [computed colors](artifacts/quiet-ink/computed-colors.txt), [rendered contrast](artifacts/quiet-ink/rendered-contrast.json), and [final state checks](artifacts/quiet-ink/final-interactions.txt).

For repeatable served checks, use `scripts/quiet_ink_checks.py --browser /path/to/chromium`; provide `--baseline-url` to compare the known tablet overflow against a served original snapshot. Its Python browser dependencies are optional QA tooling, not website runtime dependencies.
