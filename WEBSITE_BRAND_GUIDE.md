# YourMove Website Brand Guide

**Version:** 1.1 — October 27, 2026
**Status:** Quiet Ink colors and Green Signature B identity approved
**Website:** https://www.yourmove.run/  
**Repository:** `jenksed/yourmove-lp`  
**Scope:** Marketing homepage, support page, product/explainer pages, getting started, evidence, manifesto, review, and documentation (11 HTML pages inspected).

> YourMove is a practical, independently built, local-first, open-source job-application project. The website should feel credible and human, not like a generic SaaS funnel. The product helps people prepare; the applicant decides what is true and submits their own application.

## Wave 2 identity authority — Green Signature B (October 27, 2026)

**Green Signature B is the approved identity.** This section supersedes earlier logo guidance. Preserve the integrated layered M, four planes, original wordmark lettering, proportions, and spacing. The logo signature green is intentional identity color; product actions and links remain Quiet Ink cobalt.

| Plane | On light surfaces | On dark surfaces |
| --- | --- | --- |
| Lettering / front | `#242933` | `#EDF0F5` |
| White plane | `#E9EEF8` | `#D4E1FB` |
| Middle | `#AAC5FF` | `#AAC5FF` |
| Green rear | `#215C43` | `#78B696` |

- Header: `public/assets/identity/yourmove-wordmark-navigation-light.png`. Footer: the dedicated `yourmove-wordmark-navigation-dark.png`; do not whiten it with a CSS filter. Compact image framing preserves the existing navigation and footer dimensions.
- Browser icons: adaptive path-based `favicon.svg`, 16/32px PNG fallbacks, and `/favicon.ico` with 16/32/48px frames. Apple touch: `apple-touch-icon.png`, 180px.
- Default sharing: `yourmove-og-default.png`, 1200 × 630. The hackathon article has a dedicated branded social card selected by `social_image` frontmatter. Documentation now has explicit image metadata too.
- The available original wordmark is a 768 × 268 raster PNG, retained as the provenance source at `public/assets/logo-official.png`. There is no original editable vector master. Wordmarks preserve its lettering and geometry using the exact approved color mapping; do not claim their resampled exports contain new source detail.
- The flat standalone M and favicon SVGs are the approved path-based optical reconstruction. They are valid vectors, explicitly not recovered original masters. Use this simplified mark at small sizes; retain dimensional promotional artwork for illustration.
- Clear space: at least one quarter of the M's total height around visible artwork. Normal minimum visible wordmark width: 136px; the existing 145px compact mobile image box is the navigation exception. Use the flat M below this scale. Ordinary standalone marks: 24px minimum; supplied 16/32px favicon exports are dedicated exceptions.
- Marketing typography remains Jost, with the original raster logo lettering treated as artwork. Never retype the wordmark in Jost.

The standalone marketing ZIP and marketing-only exports remain outside the repository. [Wave 2 implementation and verification](IDENTITY_WAVE_2.md) records provenance, reproduction commands, and local checks. Existing photography and editorial illustrations are retained as contextual artwork, not sources for new logo extraction.

## Wave 1 color authority — Quiet Ink (October 27, 2026)

This section supersedes the older color assignments and source-color contrast table below. The remaining guide records the earlier editorial direction; its comprehensive rewrite belongs to the final redesign audit. Typography, composition, copy, and photography remain unchanged. Wave 2 above now governs approved logo adaptations.

The application's `static/styles.css` and `docs/design/DESIGN_SYSTEM.md` in `jenksed/yourmove-hackathon` establish Quiet Ink. The website uses the same semantic foundation in `public/styles.css`; `brand-refresh.css` and the existing page styles apply it to the marketing compositions.

| Role / CSS token | Value |
| --- | --- |
| Canvas / `--color-bg` | `#F5F4F1` |
| Surface / `--color-surface` | `#FFFFFF` |
| Muted surface / `--color-surface-muted` | `#EEEFF1` |
| Primary ink / `--color-text` | `#242933` |
| Secondary text / `--color-muted` | `#606773` |
| Border / `--color-border` | `#D9DDE3` |
| Strong border / `--color-border-strong` | `#8792A0` |
| Primary action / `--color-action` | `#3459A5` |
| Action hover / `--color-action-hover` | `#284984` |
| On action / `--color-on-action` | `#FFFFFF` |
| Action soft / `--color-action-soft` | `#E9EEF8` |
| Success / `--color-success` | `#2C694D` |
| Success soft / `--color-success-soft` | `#EAF2ED` |
| Attention / `--color-attention` | `#815719` |
| Danger / `--color-danger` | `#A13736` |
| Focus / `--color-focus` | `#3459A5` |

- Product CTAs and ordinary links use cobalt. Hover uses the action-hover token; keyboard focus remains explicit.
- Graphite `#191C22` and `#22262E`, light ink `#EDF0F5`, secondary text `#B0B8C5`, and light action/focus `#AAC5FF` support dark editorial sections. This is not a dark-mode switch.
- Selection, saved work, available information, and attempted actions do not imply success. Use neutral or action-soft treatments; green means a confirmed positive outcome. Amber means attention; red means error or destruction.
- Honey support gradients remain a deliberate editorial exception. Support buttons use graphite and white; preserve the voluntary donation language and destinations.
- Legacy names such as `--green`, `--ym-forest`, and `--journal-green` are compatibility aliases to semantic tokens, not green action authority. Do not copy historical hex values from the sections below into new work.
- Current logo artwork and photography retain their colors. Color-only browser checks and before/after captures are recorded in `artifacts/quiet-ink/`; this is not a full accessibility certification.

---

## 1. Visual strategy

The existing visual identity is **warm editorial minimalism with strong technical structure**:

- Light, warm backgrounds and dark text make the site readable and approachable.
- Forest green expresses the product, action, agency, and forward movement.
- Cobalt blue supports evidence, provenance, and inspectable technical information.
- Honey-gold invites voluntary support for the independent project.
- Charcoal anchors strong headlines, section changes, and contrast.
- A restrained fresh sage is a supporting accent, especially against dark green.

**Do not recolor every section to match.** Consistency comes from consistent *meaning*, not one flat hue across every page. A support ask should feel different from a product-install action.

## 2. Core palette

| Role | Hex | Usage | Existing implementation / note |
| --- | --- | --- | --- |
| Editorial paper | `#F9F8F3` | Default light section background | `--paper` (effective value from `brand-refresh.css`) |
| Primary ink | `#101715` | Large headings and body text on paper | `--ink` (effective value) |
| Brand forest | `#075B40` | Main product CTA, navigation CTA, product accents | `--green` (effective value) |
| Deep forest | `#143B2B` | Dark product/process sections | Used on the homepage process section |
| Evidence cobalt | `#2456BD` | Evidence, document references, technical links | `--cobalt`; support local `--ys-blue` |
| Evidence wash | `#E9EDF6` | Pale background around provenance/evidence | Existing editorial section surface |
| Fresh sage | `#B5E4B8` | Highlight on dark forest and progress details | Section accent, not a default button |
| Honey light | `#FFE7B9` | First stop of support gradient | `--ym-support-honey-light` |
| Honey core | `#F8D49B` | Main support panel color | `--ym-support-honey` |
| Honey deep | `#F1BF7B` | Last stop of support gradient | `--ym-support-honey-deep` |
| Honey border | `#E6B674` | Support panel divider/border | `--ym-support-honey-line` |
| Support forest | `#174734` | Filled donation/support action on honey | `--ym-support-forest` |
| Support forest hover | `#245D43` | Support-action hover | `--ym-support-forest-hover` |
| Support ink | `#162D21` | Support-panel title | `--ym-support-ink` |
| Support muted | `#3D4B3E` | Small support-panel explanation/disclaimer | `--ym-support-muted` |

### Color decision rules

1. **Applying, preparing, trying, installing, continuing:** forest green.
2. **Source, proof, technical evidence, documentation references:** cobalt blue or restrained dark-blue links.
3. **Voluntary financial support:** honey-gold **surface** plus forest-green **action**. Honey is not an all-purpose button color.
4. **Body copy / thoughtful explanations:** warm paper plus near-black ink.
5. **Warnings/errors/validation:** use an explicit state treatment, not the honey used for supporting development. Never communicate state with hue alone.
6. **Secondary navigation:** text, underline, or outline first; do not make every link a filled button.
7. **Marketing images:** support the actual work of applying, avoiding decorative generic AI/robot visuals.

## 3. Homepage usage

- **Hero:** use its existing photographic/editorial treatment, legible dark copy, and green “Get started” action. The product is the primary request.
- **Employer-form demonstration:** green status and active controls; any unfilled or unresolved field should be understandable from text and labels, not just color.
- **Process:** deep forest surface; pale sage text accents. This is a product workflow, not a donation message.
- **Career records and evidence:** cobalt can distinguish details that are inspectable or preserved.
- **Agency:** warm neutral background; keep the candidate in control as the message.
- **Founder story:** an editorial handoff to the support page; blue references can remain where they introduce the founder's record. Do not flood the section with gold.
- **Final product CTA:** keep strong green differentiation.
- **Footer support invitation:** honey gradient, deep ink, and a filled forest-green button. This is the *separate* voluntary support request.

## 4. Support-page usage

The fundraising page should feel like a human, inspectable request, not a checkout trap.

- **Hero:** charcoal background and readable, restrained copy. The prominent support card uses the **same honey gradient** as the homepage footer invitation.
- **Hero support card:** dark text and a forest-green “Support on Ko-fi” button. Keep the clear independent-project statement, payment destination, and voluntary/non-charitable disclaimer.
- **Personal story:** warm paper. The repetitive form example and comparison link retain their blue/evidence treatment.
- **Receipts:** pale blue background, cobalt accent, and inspectable source/roadmap/availability references. **Do not recolor technical proof gold.**
- **What support helps:** dark green and plain, verifiable descriptions of development work.
- **Closing ask:** honey panel with forest-green support button. The alternative actions (view code, share story) remain visible and subordinate.
- **No pressure:** do not imply funding is required for access, suggest fake deadlines, invent supporter counts, or imply a charitable tax deduction. A job seeker short on money should feel welcome without paying.

The purpose of this design is to create recognizable contrast between **“use the tool”** and **“support the developer.”** Color psychology is a design hypothesis, not evidence of higher donation conversion.

## 5. CTA hierarchy and interaction

| Action type | Visual default | Examples |
| --- | --- | --- |
| Primary product action | Brand forest fill, white text | Get started, use the application |
| Direct voluntary supporter action | Forest fill on honey surface, white text | Support on Ko-fi |
| Source / evidence link | Cobalt on light background; high-contrast light text on dark | Inspect code, read roadmap, evidence |
| Secondary action | Underline or simple outline | See how it works, share the story |
| State indication | Semantic label plus color | Selected, requires review, success |

Links must remain distinguishable on hover, keyboard focus, and touch. Existing analytics attributes should stay attached to the intended action. When experimenting with the support ask, record the CTA's placement, destination, and wording so results can be compared accurately.

## 6. Typography and composition

- **Typeface:** Jost, already loaded with weights 400–900. Keep a system fallback. Avoid introducing competing fonts.
- **Headlines:** bold, direct, compressed in *line count* rather than artificially squeezed letter spacing. The existing oversized editorial headings and short all-caps rails are part of the identity.
- **Body:** normal case, comfortable line height, restrained paragraph width; distinguish evidence from promises in copy as well as color.
- **Microcopy:** do not make labels tiny or pale simply to get them out of the way. Small disclaimers need at least AA text contrast.
- **Composition:** bold full-width section transitions, repeatable content gutters, modular rules/dividers, and generous whitespace.
- **Buttons:** visible label, touch-friendly height, no icon-only primary action, no misleading urgency.
- **Logo:** follow the approved Green Signature B variants in the Wave 2 identity authority above. Preserve geometry and lettering; use the dedicated light/dark artwork rather than section-specific recoloring.

## 7. Accessibility requirements

Targets: WCAG AA **4.5:1** for regular text, **3:1** for large text and relevant non-text UI boundaries. Test text against the **least favorable point** of a gradient, not only its midpoint.

Representative checked contrast ratios (October 25, 2026; source-color calculations, not an automated full-page audit):

| Foreground / background | Ratio | Result |
| --- | ---: | --- |
| Ink `#101715` on paper `#F9F8F3` | 17.09:1 | Pass |
| White on product green `#075B40` | 8.14:1 | Pass |
| White on support forest `#174734` | 10.57:1 | Pass |
| Support muted `#3D4B3E` on deep honey `#F1BF7B` | 5.49:1 | Pass |
| Support green `#174734` on deep honey `#F1BF7B` | 6.28:1 | Pass |
| Cobalt `#2456BD` on evidence wash `#E9EDF6` | 5.70:1 | Pass |
| Illustrative form text `#5B6470` on `#F7F8FA` | 5.64:1 | Pass |

Checks still needed before calling the entire website accessible: browser-computed styles across all pages, interactive hover/focus states, mobile zoom, browser rendering, and automated checks followed by manual review. A palette guide is not a WCAG certification.

## 8. Audit findings (source review)

**Reviewed:** all eleven HTML pages and eleven CSS files present in the website repository on October 25, 2026. This is a **source-level consistency and representative contrast audit**; it is not a complete visual or accessibility certification.

| Finding | Assessment | Action |
| --- | --- | --- |
| Core paper/ink/forest identity | Coherent across the marketing site | Keep |
| Blue evidence areas and inspectable links | Purposeful use of cobalt | Keep |
| Homepage honey support invitation | Strong contrast with the dark footer | Keep |
| Support-page donation action previously blue | Did not use the same visual language as the homepage ask | Updated: honey support surfaces + forest buttons |
| Small support labels on the new gradient | Prior muted colors would have fallen below 4.5:1 on the darkest gradient stop | Updated: darker index, status, and disclaimer text |
| Support-page illustrative form text | Previous color measured about 3.03:1 | Updated to about 5.64:1 |
| Several CSS generations define similar palette tokens | Maintenance/cascade drift risk, not by itself a visible failure | Defer broad consolidation; use the shared semantic tokens when touching relevant styles |
| Some supporting pages use different green/sage shades | Often appropriate to section contrast; not automatically defects | Review only if a concrete mismatch appears |
| Various pages use a fixed light browser theme-color | Does not exactly match the latest warm paper token | Low priority; align on next related touch |
| Full visual / mobile rendered audit | Not established by source inspection | Separate follow-up if layout or browser screenshots justify it |

Specific CSS maintenance note: `styles.css` defines initial `--paper`, `--ink`, and `--green`; `brand-refresh.css` intentionally overrides them later. `campaign.css` and `focused.css` introduce older `--ym-*` and `--ym2-*` families. This is real layering. Do **not** replace hundreds of hex literals in one PR without demonstrated breakage. Prefer consolidating shared variables only when an affected component is next edited.

## 9. Practical implementation rules

1. Look up the **semantic purpose** of the component before choosing a color.
2. Reuse `--ym-support-*` tokens on both the homepage support invitation and `support.css`.
3. Scope special treatment using `body[data-page="..."]` or a component class; avoid global rules that unintentionally recolor ordinary product CTAs.
4. Preserve the current layout and copy for color-only refinements unless an observed usability issue requires otherwise.
5. Validate CSS parsing/selector reachability and at least one desktop and one mobile rendering where a visual runtime is available.
6. Check normal, hover, focus-visible, and reduced-motion behavior; test contrast on all gradient endpoints.
7. Preserve Ko-fi destination and existing `data-analytics-cta` / `data-analytics-placement` attributes.
8. For changes with uncertain impact, watch support CTA click-through relative to page views. Do not claim lift from a tiny sample or equate outbound Ko-fi clicks with completed payments.

## 10. Next decisions

**Do now:** Apply the shared honey/support palette to the support-page hero and closing invitation; repair the small-text contrast impacted by that change.

**Later, if justified:** Consolidate duplicated foundational color variables in a narrow PR; align minor theme-color metadata; visually compare the main templates at desktop and mobile sizes.

**Do not do:** Repaint every page gold, turn every link into a CTA, or add persuasive gimmicks without evidence they help visitors and preserve trust.

---

**Maintenance default:** When a new section is designed, start with the five core roles (paper, ink, forest, cobalt, honey), pick a semantic role, and reuse the existing closest token. Create a new shade only for a measurable contrast, state, or composition requirement.
