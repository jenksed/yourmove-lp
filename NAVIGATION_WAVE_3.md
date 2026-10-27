# YourMove · Wave 3 review

Starting commit: `f4471b040a65ccb1bd2f87c2f99e0dd03e427f33` on `redesign/quiet-ink`. The existing preview serves this checkout at http://127.0.0.1:8765/.

## Decisions

- One header across all 14 routes: How it works, Help & guides, Blog, Get started. Product explanation now has a real page destination; existing users can reach help directly. Source and official releases remain distinct footer destinations and retain the existing Get Started choices.
- At 900px and below, a text-labeled disclosure replaces the full menu. It expands in document flow, with 48px link rows, rather than covering the page. Enter/Space, Tab, Escape, outside click, focus exit, and breakpoint changes work. All links remain available without JavaScript.
- The footer names the independent developer and provides Product, Help, and Open source groups. Optional support is a quiet text link. GPL attribution, public-issue privacy guidance, and documentation support/release qualifications remain.
- Release messaging states a planned date without countdown pressure. It is now consistent on docs and generated articles too. After the date it restores the source/installer availability message, without claiming a release shipped.
- Homepage markup remains the shared layout authority. A small build-time sync keeps static routes and generated blog pages aligned; no runtime templating or new framework.

Removed the repeated support billboard, `COMING UP`, glowing status dot, countdown badge, shared CTA arrow ornaments, homepage `ONE WORKFLOW. YOUR FINAL SAY.` visual marker, workflow arrow symbols and trailing `YOUR EXPERIENCE / ON HAND`-style captions, and the founder label that repeated the adjacent story. Meaningful sequence numbers, demo controls, illustration disclosures, and product limitations remain.

The composition keeps the recognizable layered M, Jost typography, plain navigation links, and one cobalt action. The header gives the photography room; the footer no longer adds another promotional section. This is quieter and more useful, but the homepage body still has substantial repeated campaign furniture. It needs its own composition work.

## Local evidence

Local, uncommitted review artifacts: `artifacts/navigation-wave-3/`.

- `review.html`: screenshot gallery, before/after header and footer comparisons at 1440/768/390px, and open-menu screenshots.
- `before/` and `after/`: all 14 full pages at 390/768/1024/1440px, with render records. Before: four 768px overflow cases (785–786px). After: none at any required width.
- `navigation-checks.json`: 56 rendered navigation cases, all-route keyboard/touch/focus behavior, no-JS mobile/tablet, real audience journeys, resize behavior, and mock analytics checks. No live analytics ingestion.
- `quiet-ink/checks.json`: existing served-site checks pass across 42 renders, including local links/fragments/assets, contrast, clipboard, demo states, evidence tabs, docs search/recovery, console errors, and failed local responses.
- `release-checks.txt`: 14 routes × 11 widths, release-day wording, fresh/live midnight expiry, and disabled/invalid config fallbacks pass.
- `existing-checks.txt`: existing analytics and 11-width Get Started layout checks pass. The older offline site check still stops at its pre-existing 320px review headline overflow (325px with the fallback font). The saved before version reproduces it exactly; the real Jost-rendered preview is 320px wide. This is outside the required four widths and was left unchanged.

`npm run build`, `npm run check:blog`, JavaScript/Python syntax checks, and `git diff --check` pass. All 13 non-home main bodies, all existing asset bytes, and analytics/docs/blog runtime files remain unchanged. Generated blog/feed/sitemap/robots output stays outside the commit, as in previous waves.

## Deferred

Wave 4 should revisit homepage section rails, stacked slogans, dense mock-interface metadata, alternating light/dark sections, and repetition between the process and agency sections. The generic Get Started hero headline and repeated supporting-page schematic labels merit a later copy/layout pass. The internal review page still reflects older campaign naming and the fallback-font edge case described above. No homepage or article-body redesign was attempted.

No push, merge, or deployment. Stop for human review before Wave 4.
