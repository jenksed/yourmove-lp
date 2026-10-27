# Homepage transformation · Wave 4

Implemented locally on `redesign/quiet-ink`, starting at `7cdb4a56fa9bae1e7aba466983cd68c5ca16ebe6`. No push, merge, deployment, supporting-page redesign, or product-repository changes.

## The experience

“Stop starting over” opens the existing full-bleed workspace photograph with a shorter promise, accurate availability, and two actions: get started or try the example. The universal “Any platform” headline is gone.

The example leads the explanation. Taylor’s saved contact details, chosen résumé, and previous answer remain visible beside a new application. **From scratch** starts empty. **With YourMove** carries the same information into a preparation preview. Visitors can edit the prepared answer; edits survive comparison switches for that page visit. The job-specific question remains unanswered. There is no submission action, employer connection, file upload, or generated answer.

The rest of the page follows the work: what you keep, what you must review, and where to start. Four plain record entries replace the repeated process slogans and large feature treatments. One dark passage establishes applicant authority. The availability CTA leads to `/get-started/`; source code, documentation, Career Evidence, and the developer story remain secondary paths. The developer invitation sits after the main product action.

At 1440px the full page is 3,961px tall, down from 6,627px. At 390px it is 5,263px, down from 8,002px. These measurements include the unchanged shared header and footer.

## Design decisions

- Retained Jost, Quiet Ink semantic tokens, Green Signature B logos, and the original photographic asset. Announcement, header, and footer markup match the starting commit exactly.
- Kept full-bleed photography and removed the hero’s decorative rail. An explicit caption identifies the workspace as illustrative artwork.
- Made information continuity visible by keeping the source record in place while the destination changes. Green indicates prepared information, blue remains the action/focus color, and amber identifies the question requiring applicant input.
- On mobile, put the state controls between the saved record and the destination form. The hero shortcut focuses those controls and brings the changing fields into view. Native section navigation remains available without JavaScript.
- Used an actual editable textarea for applicant review. Changes stay in memory until the page is left or reloaded. Analytics records a single edit event, never its contents.
- Removed duplicate process, keeps, and authority treatments. Preserved `#experience`, `#how-it-works`, `#what-you-keep`, and `#your-control` destinations.
- Kept the demonstration labeled as an illustration. Available historical product audit images were fixture captures, not suitable current verified product screenshots. No experimental hackathon AI, universal compatibility, or public installer claim was added.

## Review artifacts

Open [the screenshot review](artifacts/homepage-wave-4/review.html) or the [working homepage](http://127.0.0.1:8765/).

| View | Before | After | Comparison |
| --- | --- | --- | --- |
| Desktop, 1440px | [Full page](artifacts/homepage-wave-4/before/home-1440.png) | [Full page](artifacts/homepage-wave-4/after/home-1440.png) | [Side by side](artifacts/homepage-wave-4/comparison-1440.png) |
| Mobile, 390px | [Full page](artifacts/homepage-wave-4/before/home-390.png) | [Full page](artifacts/homepage-wave-4/after/home-390.png) | [Side by side](artifacts/homepage-wave-4/comparison-390.png) |

Also captured and visually reviewed the entire journey at [768px](artifacts/homepage-wave-4/after/home-768.png), [1024px](artifacts/homepage-wave-4/after/home-1024.png), and [320px](artifacts/homepage-wave-4/after/home-320.png). Before captures exist for each width. The [prepared desktop example](artifacts/homepage-wave-4/after/demo-saved-1440.png), [prepared mobile example](artifacts/homepage-wave-4/after/demo-saved-390.png), and [edited mobile example](artifacts/homepage-wave-4/after/demo-edited-390.png) show the interactive states.

Artifacts are local review outputs, consistent with prior waves; they are not published website content or included in the source commit.

## Verification

- **PASS:** actual preview at 320, 390, 768, 1024, and 1440px. No homepage horizontal overflow, JavaScript exceptions, console errors, or failed local requests. Jost loaded at every width.
- **PASS:** mouse and touch switches, editable answer, preserved edits across switches, unchanged unanswered question, accessible status updates, visible focus, Tab/Enter/Space/arrows/Home/End controls, and hero shortcut focus.
- **PASS:** normal motion settings and reduced motion. No motion is required to convey state changes.
- **PASS:** foreground contrast measured against rendered photographic pixels behind visible glyphs. Lowest observed ratio is **5.18:1**. The first pass caught a low-contrast mobile link; the final mobile veil corrects it.
- **PASS:** real local primary, Career Evidence, first-application, and developer-story CTA destinations. GitHub remains explicitly a source link. Internal homepage routes, fragments, assets, and unique IDs resolve.
- **PASS:** no-JavaScript navigation, explanatory illustration fallback, and CTA availability at 320, 390, and 768px.
- **PASS:** `navigation_checks.py`: 56 served renders across all 14 routes, plus mobile menu, keyboard/focus, no-JS, resize, navigation journeys, and mocked CTA/release analytics.
- **PASS:** `quiet_ink_checks.py`: 42 served renders across all 14 routes, including color semantics, comparison, Get Started, evidence, docs controls/search, and no-JS navigation.
- **PASS:** existing mocked analytics suite: inactive/active pageviews, CTAs, comparisons, both-states event once, edit event once, no edited text in payloads, source exits, copy, help interactions, menu, and opt-out. Localhost analytics exclusion remains effective; no live ingestion was used for QA.
- **PASS:** existing Get Started layout checks at 11 widths; release announcement checks across 14 routes × 11 widths, including date, expiry, and invalid-config fallbacks.
- **PASS:** `npm run build`, `npm run check:blog`, JavaScript syntax checks, Python compilation, and `git diff --check`.
- **KNOWN BASELINE FAILURE:** the legacy embedded/offline `site_checks.py` still stops at the unchanged `/review/` headline: 325px with a 320px viewport and fallback font. This is documented in Waves 1 and 3. Its remaining cases are not claimed as passed. Actual served homepage checks cover all five requested widths independently.

Machine-readable results and logs are under `artifacts/homepage-wave-4/`. Browser verification used Chromium with touch emulation; physical iOS/Safari was not tested.

### Reproduce

The optional QA environment already exists at `/private/tmp/yourmove-qa-venv`. With the current preview running:

```sh
npm run build
npm run check:blog
/private/tmp/yourmove-qa-venv/bin/python scripts/homepage_checks.py
/private/tmp/yourmove-qa-venv/bin/python scripts/navigation_checks.py --output artifacts/homepage-wave-4/navigation
/private/tmp/yourmove-qa-venv/bin/python scripts/quiet_ink_checks.py --url http://127.0.0.1:8765 --output artifacts/homepage-wave-4/quiet-ink
/private/tmp/yourmove-qa-venv/bin/python scripts/release_banner_checks.py
```

The older embedded site/analytics/Get Started scripts hard-code Linux Chromium. `/private/tmp/yourmove-wave4-existing.py` substitutes the installed Chromium path in memory, then runs those scripts. The original offline site failure remains visible in `existing-checks.txt`.

## Changed source

- `public/index.html`: homepage narrative, semantics, metadata, illustration, and CTA hierarchy.
- `public/homepage.css`, `public/homepage.js`: homepage-only composition and interactive behavior.
- `public/app.js`: removed the superseded homepage comparison; shared behavior stays intact.
- `public/analytics.js`, `ANALYTICS.md`: initial blank comparison accounting and the content-free edit event.
- `scripts/homepage_checks.py`: served homepage acceptance and photographic contrast checks.
- `scripts/site_checks.py`, `scripts/analytics_checks.py`, `scripts/quiet_ink_checks.py`: updated existing homepage expectations for the new experience.
- `README.md`, this report: current file ownership and local handoff.

Pre-existing `.gitignore`, `.ignore`, `.serena/`, prior artifacts, and generated blog/feed/robots/sitemap files were left outside this commit.

## Deferred

Qualified screenshots from a current verified product build should replace illustration only when they establish the capability being shown. Public installer availability and launch actions must follow actual release status. Mailing-list and conversion infrastructure remain Wave 8 work. The supporting-page fallback-font issue remains outside this homepage wave. Wave 5 has not started.
