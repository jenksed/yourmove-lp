# Product discovery & getting started · Wave 5

Implemented locally on `redesign/quiet-ink`, starting at `de2be1e5730627f76b1ab6d27e433b2ce0ad0639`. The source commit SHA is reported in the delivery message. No push, merge, deployment, app-repository edits, or Wave 6 work.

## Visitor journey

The unchanged homepage establishes why carrying application work forward helps. [How It Works](http://127.0.0.1:8765/how-it-works/) follows one job through four grouped activities: save and review the posting; select an existing résumé and use saved material; authorize supported preparation and inspect unresolved work; personally submit on the employer site, then record completion locally.

[Career Evidence](http://127.0.0.1:8765/evidence/) explains what makes that saved material useful. A fictional candidate’s short résumé bullet opens into its situation, actions, and honestly limited outcome. Two later questions use different parts of the same experience. Applicant-approved facts, reviewed experiences, and optional AI proposals have distinct meanings.

[Get Started](http://127.0.0.1:8765/get-started/) answers availability first. An ordinary visitor can understand the release state without knowing GitHub or Terminal. Learning links precede the technical source route. Native candidate-build and local-browser commands remain available in separate native disclosures.

## Composition and copy

- How It Works replaces a repeated sales introduction and oversized step treatments with one continuous task. Large sentence-case typography, a quiet posting review, a graphite materials passage, an interactive support comparison, and the separate employer/local completion sequence establish changes in task and state. Existing `#save`, `#prepare`, `#handoff`, and `#decide` destinations remain usable.
- Genuine interface captures carry concrete details. Narrow-screen sources are actual responsive captures, not desktop images shrunk until illegible. Every capture has an explanatory caption and full-size link. The interactive employer comparison is explicitly illustrative and makes no live connection.
- Successful posting retrieval does not imply automated employer-form support. The manual path explains how the selected résumé and saved writing remain useful. Prepared, transferred, personally submitted, and locally recorded remain different states.
- Career Evidence uses one worked example instead of taxonomy cards. No measured improvement percentage is invented. “Reviewed” is applicant confirmation, never employment verification or automatic fact-checking. Résumés are prepared externally. AI proposals are not approved evidence.
- Get Started removes the source-code-first hero and equal-weight “two ways in” cards. The public release state is prominent; source code, source ZIP, local builds, and learning links have different actions. No mailing-list form or integration was added.
- Quiet Ink tokens, Jost, Green Signature B identity, shared navigation/footer, and the static architecture remain intact. The homepage HTML/CSS/JS and shared app behavior have no current diff. Its availability text can change through the launch configuration described below; its design and interaction do not change.

## Authentic evidence and release facts

Product captures come from committed `jenksed/yourmove-go` source **a14e7fb17fff1bc551ef2af7b351271554fa26e3**, exported into a temporary directory and compiled independently of the app checkout’s uncommitted work. `go build` and `go test ./...` passed. The build ran in browser mode with a fresh isolated workspace and fictional records. The screenshots establish job-description review, explicit document selection, the completion confirmation control, and Career Evidence review. They do not establish automatic posting retrieval, live employer coverage, native desktop behavior, or submission.

See [capture provenance](public/assets/product-wave-5/README.md) and the [actual evidence editor capture](public/assets/product-wave-5/career-evidence.png). No employer form was filled, no AI provider was used, and no application was submitted or falsely marked complete.

On **October 27, 2026**, the connected GitHub API returned an empty [official release collection](https://github.com/jenksed/yourmove-go/releases). The [official README](https://github.com/jenksed/yourmove-go#downloads-and-macos-status) confirmed no published/notarized public download and specified Apple Silicon, macOS 26+, Git, Go 1.27.2, Python 3, and Xcode Command Line Tools for the Mac candidate build. Those are the current page’s claims. November 6 remains a planned launch date, not proof of availability.

## November 6 launch transition

Only one source file needs release information: **[public/release-config.js](public/release-config.js)**. `published: null` keeps the truthful pending state. Once the actual official installer is published and its downloaded installation is qualified, replace `null` with the following object, filling every placeholder from the verified release:

```js
published: {
  qualified: true,
  version: 'EXACT_RELEASE_TAG',
  platform: 'QUALIFIED_PLATFORM_NAME',
  requirements: 'VERIFIED_OS_AND_HARDWARE_REQUIREMENTS',
  verifiedOn: 'YYYY-MM-DD',
  releaseUrl: 'https://github.com/jenksed/yourmove-go/releases/tag/EXACT_RELEASE_TAG',
  downloadUrl: 'https://github.com/jenksed/yourmove-go/releases/download/EXACT_RELEASE_TAG/EXACT_APPLICATION_ASSET'
},
```

The placeholders intentionally fail validation. Use the real version/tag, application asset (not the source archive), platform, and requirements. Qualification is an explicit release-owner assertion; the website does not discover or qualify installers automatically.

Then run:

```sh
npm run build
npm run check:blog
node scripts/availability_checks.mjs
```

The build generates the official download action, version, platform, requirements, and release-notes link as **static HTML**. It also updates the existing homepage availability sentences and shared evergreen announcement. Shared layout generation propagates that announcement to every route. The planned-date banner yields to the published state. No runtime GitHub API call, date-triggered download, or JavaScript-only availability content is required.

Recheck the real asset and browser layouts before a separately authorized publication. Review release-specific help content at launch as well. To roll back the website presentation, restore `published: null` and rebuild. This restores the pending presentation and availability notices without changing the planned date.

The switch was rehearsed in an isolated temporary tree, including static output, tag/asset matching, invalid configs, banner behavior, five viewport widths, and rollback. Its screenshot fixture uses fictional **v0.0.0-qa**, is clearly labeled QA, and was never linked from the public site or downloaded. See [desktop fixture](artifacts/product-discovery-wave-5/after/release-fixture-1440.png) and [mobile fixture](artifacts/product-discovery-wave-5/after/release-fixture-390.png).

## Before and after

Open the [screenshot review](artifacts/product-discovery-wave-5/review.html) for all three pages, desktop/mobile comparisons, intermediate widths, and interaction states.

| Page | Desktop, 1440px | Mobile, 390px |
| --- | --- | --- |
| How It Works | [Before](artifacts/product-discovery-wave-5/before/how-it-works-1440.png) · [After](artifacts/product-discovery-wave-5/after/how-it-works-1440.png) | [Before](artifacts/product-discovery-wave-5/before/how-it-works-390.png) · [After](artifacts/product-discovery-wave-5/after/how-it-works-390.png) |
| Career Evidence | [Before](artifacts/product-discovery-wave-5/before/evidence-1440.png) · [After](artifacts/product-discovery-wave-5/after/evidence-1440.png) | [Before](artifacts/product-discovery-wave-5/before/evidence-390.png) · [After](artifacts/product-discovery-wave-5/after/evidence-390.png) |
| Get Started | [Before](artifacts/product-discovery-wave-5/before/get-started-1440.png) · [After](artifacts/product-discovery-wave-5/after/get-started-1440.png) | [Before](artifacts/product-discovery-wave-5/before/get-started-390.png) · [After](artifacts/product-discovery-wave-5/after/get-started-390.png) |

Before/after captures also exist at 320, 768, and 1024px. The final How It Works page is about 4,700px tall at desktop and 6,350px at mobile, compared with about 8,540px and 10,225px before. Evidence devotes more mobile space to a readable complete example rather than hiding it behind tabs. Get Started places the practical availability answer near the top and collapses technical commands until requested.

## Verification

- **PASS:** all three served pages at 320, 390, 768, 1024, and 1440px; no horizontal overflow or heading/control clipping. Jost loaded. Final screenshots were visually inspected, including responsive product details.
- **PASS:** actual homepage → How It Works → Career Evidence → Get Started navigation; retained stage fragments, return links, first-application guide, official release destination, and source paths.
- **PASS:** supported/manual comparison with pointer, touch, Enter and Space; Tab order and visible focus; evidence and technical disclosures; both actual clipboard payloads; normal/reduced motion; all three pages usable without JavaScript at all five widths.
- **PASS:** authored text on the new flat surfaces meets contrast thresholds; lowest measured ratio **4.95:1**. Visual review caught and corrected a dark-section source-link contrast issue during implementation.
- **PASS:** no JavaScript exceptions, browser-console errors, or failed local responses during the focused acceptance run. No live analytics ingestion. Localhost exclusion remains effective.
- **PASS:** mocked PostHog tests cover the updated workflow/evidence/source disclosure events, FAQ/copy outcomes, source exits, release notes, and official asset click intents. Properties contain authored categories, not application content or copied commands.
- **PASS:** existing navigation suite, **56 renders across 14 routes**, plus shared layout, keyboard/touch, no-JS, menu resizing, and mocked analytics.
- **PASS:** existing Quiet Ink suite, **42 renders across 14 routes**, including the updated disclosures and clipboard behavior.
- **PASS:** existing Get Started layout checks at **11 widths**, with both technical disclosures open; planned-release banner checks at **14 routes × 11 widths**, including release day, expiry, disabled and invalid config fallbacks.
- **PASS:** unchanged Wave 4 homepage acceptance checks at all five widths, including its editable comparison, touch, keyboard, no-JS and photographic contrast checks.
- **PASS:** `npm run build`, `npm run check:blog`, `node scripts/availability_checks.mjs`, changed JavaScript syntax checks, changed Python compilation, and `git diff --check`.
- **KNOWN BASELINE FAILURE:** the legacy embedded/offline `site_checks.py` still stops at unchanged `/review/`, 325px scroll width with a 320px viewport and fallback font. This is the same issue documented in Waves 1, 3, and 4. Remaining legacy cases are not claimed passed; actual served Wave 5 renders pass separately.

Browser verification used local Chromium with touch emulation. Physical devices and Safari were not tested. Installer qualification and live employer-form qualification are outside this website wave.

Machine-readable evidence: [focused acceptance](artifacts/product-discovery-wave-5/verification.json), [navigation](artifacts/product-discovery-wave-5/navigation/navigation-checks.json), [Quiet Ink](artifacts/product-discovery-wave-5/quiet-ink/checks.json), [homepage regression](artifacts/product-discovery-wave-5/homepage/homepage-checks.json), and [legacy/analytics output](artifacts/product-discovery-wave-5/existing-checks.txt). Screenshots and local QA outputs stay outside the source commit, consistent with earlier waves.

### Reproduce

The preview remains at `http://127.0.0.1:8765/`. The existing optional QA environment is `/private/tmp/yourmove-qa-venv`.

```sh
npm run build
npm run check:blog
node scripts/availability_checks.mjs
/private/tmp/yourmove-qa-venv/bin/python scripts/product_discovery_checks.py
/private/tmp/yourmove-qa-venv/bin/python scripts/get_started_layout_checks.py
/private/tmp/yourmove-qa-venv/bin/python scripts/navigation_checks.py --output artifacts/product-discovery-wave-5/navigation
/private/tmp/yourmove-qa-venv/bin/python scripts/quiet_ink_checks.py --url http://127.0.0.1:8765 --output artifacts/product-discovery-wave-5/quiet-ink
/private/tmp/yourmove-qa-venv/bin/python scripts/release_banner_checks.py
```

The legacy embedded scripts hard-code a Linux Chromium path; `/private/tmp/wave5-existing.py` substitutes the installed browser in memory and preserves their failures in the output. It does not alter website behavior.

## Changed source and deferred work

- Three page HTML files; page-owned How It Works, Career Evidence, and Get Started styles; a small scoped reading-rhythm stylesheet and support-path comparison script.
- Seven authentic desktop/responsive product captures with provenance.
- Release configuration, the existing banner’s published-state guard, and a narrow build-time availability generator wired into the existing build/check scripts.
- Content-free analytics events and their documentation; focused acceptance/release tests; existing QA expectations updated for replaced components.
- README and this handoff.

Pre-existing `.gitignore`, `.ignore`, `.serena/`, prior artifacts, and generated blog/feed/robots/sitemap files are not included. The application repositories remain untouched.

Deferred: official installer publication and downloaded-install qualification; release-specific help-content review; real employer-page screenshots when individually qualified; mailing-list/conversion work in Wave 8; Safari/physical-device QA; the existing offline `/review/` fallback-font issue. No Wave 6 redesign was started.
