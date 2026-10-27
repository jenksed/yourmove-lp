# Journal & editorial experience · Wave 6

Implemented locally on `redesign/quiet-ink`, beginning at **`856118f4344cba0e39735bdd257e9871bd4d1bbe`**, the reported Wave 5 commit. The source commit SHA is in the delivery message. No push, merge, deployment, product-repository edits, or Wave 7 work.

## Audit and direction

Reviewed the Wave 4/5 implementation and handoffs, shared shell, both published Markdown articles, Pages CMS fields, generator, article script, RSS/sitemap output, editorial destinations, featured/social assets, and actual rendered Journal, articles, and Manifesto before editing. The existing personal writing, Jost, Quiet Ink palette, and shared identity work. The presentation placed an oversized generic slogan before the writing, cropped the hackathon artwork, added a decorative paper substitute to the founder story, and repeated large sales sections. The Manifesto had a good argument and memorable satire beneath repeated labels and oversized slogans.

The new Journal starts with the writing. The founder story leads with a real quotation rather than invented artwork. The hackathon article occupies a simple illustrated row; further articles inherit the same date-ordered list. There are no invented posts, categories, schedules, statistics, or milestones. The Manifesto is a discoverable companion piece.

The single article template uses sentence-case, medium-weight Jost headlines, a 680px reading column, 21px desktop/19px mobile prose, explicit paragraph line spacing, and a larger opening paragraph. Headings, quotations, lists, code, tables, links, images, and captions share a deliberate type hierarchy. No floating interface, prose cards, shadows, or large repeated signup section remain. Author and publication date are visible; return, related-reading, and optional copy-link controls are quiet.

The founder's prose is unchanged. Existing phrases link to Career Evidence and How It Works. The hackathon article gains relevant evidence/source links and local product destinations; its experimental language and historical publication date remain intact. The full existing artwork is labeled as illustration, with descriptive alternative text. The Manifesto keeps the argument, humor, original satire, and applicant-control passage; the sales button becomes a link to the personal story.

## Publishing and metadata

Markdown → gray-matter/markdown-it → static HTML remains the architecture. Dependencies, existing slugs, required frontmatter, `published: true`, raw-HTML disabling, URL restrictions, HTML/XML escaping, JSON-LD escaping, canonical origins, RSS, sitemap, and shared-shell generation remain intact. Generated files remain outside the source commit, consistent with previous waves.

Three optional fields are supported in Markdown and the existing Pages CMS form:

- `featured`: choose one published story to lead; otherwise the newest leads. If several are selected, the newest selected story leads using the existing date/slug ordering.
- `pull_quote`: an exact excerpt, displayed when the lead has no featured image.
- `image_caption`: escaped plain text below the article image.

New writing automatically inherits the template and index list. Image-free stories receive no fabricated placeholder. Existing italic caption paragraphs following Markdown images also receive caption typography. Jost's real italic faces are requested for editorial emphasis.

The two articles retain unique titles/descriptions, author, publication data, `BlogPosting` schema, approved 1200×630 social cards, and canonical URLs. Added article publication/author metadata and the previously missing Manifesto canonical/OG URL. Clipboard enhancement is hidden without JavaScript. Shared analytics code and configuration have no changes; localhost exclusion remains effective.

## Before and after

Open the [complete visual review](artifacts/journal-wave-6/review.html) or [local Journal](http://127.0.0.1:8765/blog/).

| Page | Desktop · 1440px | Mobile · 390px |
| --- | --- | --- |
| Journal | [Before](artifacts/journal-wave-6/before/blog-1440.png) · [After](artifacts/journal-wave-6/after/blog-1440.png) | [Before](artifacts/journal-wave-6/before/blog-390.png) · [After](artifacts/journal-wave-6/after/blog-390.png) |
| Founder story | [Before](artifacts/journal-wave-6/before/blog-why-im-building-yourmove-1440.png) · [After](artifacts/journal-wave-6/after/blog-why-im-building-yourmove-1440.png) | [Before](artifacts/journal-wave-6/before/blog-why-im-building-yourmove-390.png) · [After](artifacts/journal-wave-6/after/blog-why-im-building-yourmove-390.png) |
| Hackathon article | [Before](artifacts/journal-wave-6/before/blog-meta-global-ai-developer-hackathon-yourmove-1440.png) · [After](artifacts/journal-wave-6/after/blog-meta-global-ai-developer-hackathon-yourmove-1440.png) | [Before](artifacts/journal-wave-6/before/blog-meta-global-ai-developer-hackathon-yourmove-390.png) · [After](artifacts/journal-wave-6/after/blog-meta-global-ai-developer-hackathon-yourmove-390.png) |
| Manifesto | [Before](artifacts/journal-wave-6/before/manifesto-1440.png) · [After](artifacts/journal-wave-6/after/manifesto-1440.png) | [Before](artifacts/journal-wave-6/before/manifesto-390.png) · [After](artifacts/journal-wave-6/after/manifesto-390.png) |

Before/after captures also cover 320, 768, and 1024px for all four pages. Readable viewport detail captures accompany the full pages. Review artifacts are local, outside the production site and source commit.

## Verification

- **PASS:** `npm run build`, `npm run check:blog`, JavaScript syntax, Python compilation, and `git diff --check`.
- **PASS:** `scripts/blog_checks.mjs`: actual generator in an isolated temporary tree; zero/one/many articles, explicit feature selection, images/captions, drafts, unpublishing and stale-output removal, RSS/sitemap membership, invalid filename/date rejection, raw HTML, HTML/XML/JSON escaping, and unsafe image/link handling. No test posts enter the real publication.
- **PASS:** `scripts/journal_checks.py`: 20 served renders at **320, 390, 768, 1024, and 1440px**, plus 20 no-JavaScript renders. No horizontal overflow, clipped headlines/controls, cropped images, missing local destinations/assets, console errors, JavaScript exceptions, or failed local responses. Jost loaded at every width.
- **PASS:** every visible editorial text treatment meets its contrast threshold; minimum measured contrast **5.18:1**. Normal-motion checks and reduced-motion acceptance renders work; the editorial styles require no motion.
- **PASS:** actual mobile/desktop Journal → founder → How It Works/Career Evidence → Manifesto → founder → Journal → hackathon → Career Evidence navigation. Keyboard Enter, visible focus, actual canonical clipboard payload, denial fallback, and no-JS reading/navigation work. A browser-only fixture covers quotations, lists, wide code/tables, and image captions at 320px without publishing filler.
- **PASS:** unique titles/descriptions, canonical URLs, article schema/author/publication dates, local social assets and actual dimensions, RSS XML items, and sitemap membership.
- **PASS:** existing navigation suite: **56 renders across 14 routes**, plus touch, keyboard, no-JS, menu resizing, real journeys, and mocked shared analytics.
- **PASS:** existing Quiet Ink suite: **42 renders across 14 routes**, plus product comparison, docs search/disclosures, clipboard, color semantics, and focus.
- **PASS:** existing homepage acceptance checks at five widths, including the editable saved-work comparison and photographic contrast. Homepage, product-discovery pages, release config, and shared shell have no source changes.
- **PASS:** existing mocked analytics suite and Get Started layout checks at **11 widths**. No live analytics ingestion.
- **PASS:** existing release announcement checks across **14 routes × 11 widths**, including release day, expiry, disabled/invalid fallbacks; existing isolated availability/release-switch tests.

Evidence and logs live under [artifacts/journal-wave-6/](artifacts/journal-wave-6/), including [focused results](artifacts/journal-wave-6/verification.json). Optional QA uses the existing `/private/tmp/yourmove-qa-venv`; the legacy analytics/Get Started scripts were executed with their hard-coded Linux Chromium path substituted in memory, without modifying those scripts.

Reproduce focused checks after starting the local preview:

```sh
npm run build
npm run check:blog
node scripts/blog_checks.mjs
/private/tmp/yourmove-qa-venv/bin/python scripts/journal_checks.py
```

## Changed source and limits

- `scripts/build-blog.mjs`, `public/blog.css`, `public/blog.js`: Journal index, shared article template, type/image/caption treatments, metadata, and progressive clipboard enhancement.
- `content/blog/*.md`, `.pages.yml`: optional editorial fields and contextual links; existing article prose preserved.
- `public/manifesto/index.html`, `public/manifesto.css`: companion essay presentation, founder link, canonical metadata.
- `scripts/blog_checks.mjs`, `scripts/journal_checks.py`: focused generator and browser regression checks.
- `README.md`, this report: publishing ownership, operation, and review evidence.

Chromium desktop/mobile emulation was tested; physical iOS/Safari and live social crawler caches were not. Existing featured/satirical artwork is retained, not presented as a product capture. Production social caches can only be checked after a separately authorized deployment. The pre-existing legacy offline `/review/` fallback-font overflow documented in prior waves is outside this scope; the legacy all-site offline suite was not rerun or claimed as passed.

Pre-existing `.gitignore`, `.ignore`, `.serena/`, prior artifacts, and generated blog/feed/robots/sitemap files remain outside the commit. Wave 7 is deferred for human visual review.
