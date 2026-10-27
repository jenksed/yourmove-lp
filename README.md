# YourMove landing page

The static marketing website for YourMove, built with plain HTML, CSS and JavaScript, Jost typography, and official YourMove branding. The site explains the application-continuity workflow and directs visitors to the [YourMove application repository](https://github.com/jenksed/yourmove-go) for source code and release status.

## Local preview

Requires only Python 3 (or another static file server):

```bash
cd public
python3 -m http.server 8765
```

Open <http://localhost:8765>. No Node, bundler, build command, or environment variables are needed. PostHog analytics is disabled until you add your public project token to `public/analytics-config.js`.

## PostHog analytics (optional)

All pageviews, meaningful calls to action, GitHub/download exits, workflow interactions, FAQs, copy-command outcomes and engagement milestones are instrumented. To enable analytics, edit just `public/analytics-config.js` with your `phc_` project token and PostHog US/EU host, then enable the PostHog cookieless server hash project setting. See [ANALYTICS.md](ANALYTICS.md) for the full setup, privacy boundaries, event dictionary and suggested funnels. With the key blank, no PostHog SDK is loaded.

## Create the GitHub repository

From this unzipped folder on a Mac with [GitHub CLI](https://cli.github.com/) installed and authenticated (`gh auth login`):

```bash
cd yourmove-lp
git init -b main
git add .
git commit -m "Initial YourMove landing page"
gh repo create jenksed/yourmove-lp --public --source=. --remote=origin --push
```

`gh repo create` creates the remote repository and pushes the local commit. If you already created `jenksed/yourmove-lp` on GitHub, skip the `gh repo create` line and run `git remote add origin https://github.com/jenksed/yourmove-lp.git && git push -u origin main` instead.

The `jenksed/yourmove-lp` remote has **not** been created by this archive; these steps require authorization in your own GitHub session. You can use `--private` instead of `--public` if you want the website's source private.

## Deploy to Vercel

1. Push this folder to the `yourmove-lp` GitHub repository.
2. In Vercel, choose **Add New → Project → Import Git Repository**, then select `yourmove-lp`.
3. Use **Framework Preset: Other**; **Root Directory: `./`**; **Output Directory: `public`**. Leave the build and install commands unset.
4. Click **Deploy**. Once available, verify `/`, `/get-started/`, `/how-it-works/`, `/evidence/`, `/manifesto/`, and `/review/` plus images and CTA links.
5. After verifying the deployment, add `yourmove.run` in Vercel Project → Settings → Domains and update DNS as instructed. Keep the domain pointing at the existing site until the new deployment is verified.

The committed `vercel.json` declares the output directory, explicit page rewrites and asset caching. Vercel will deploy new commits from the connected branch automatically after project integration is enabled. No broad `/(.*) → /index.html` SPA catch-all is used; this is a multi-page site.

### Preview URL and production metadata

Open Graph and Twitter image metadata use the approved Green Signature B cards under `https://www.yourmove.run/assets/identity/`. The default is `yourmove-og-default.png`; the hackathon article selects its dedicated card with `social_image` frontmatter. These URLs reference committed local assets, but production preview caches will reflect the change only after a separately authorized deployment. Test social previews after deployment.

## Edit the site

- `public/index.html`: homepage content.
- `public/{get-started,how-it-works,evidence,manifesto,review}/index.html`: supporting pages.
- `public/homepage.css`, `public/homepage.js`: Wave 4 photographic hero, saved-work comparison, and homepage narrative. The illustration is synthetic; editing stays in memory and never submits an application.
- `public/hero.css`, `public/application-handoff.css`, `public/process-journey.css`: retained legacy section styles used by existing supporting-page checks.
- `public/styles.css`, `public/campaign.css`, `public/focused.css`, `public/brand-refresh.css`: shared and section styles.
- `public/app.js`: shared mobile menu, supporting-page examples, and command-copy outcome events.
- `public/analytics-config.js`: **only file you edit to enable PostHog**.
- `public/analytics.js`: explicit, cookieless PostHog instrumentation (no build tool).
- `ANALYTICS.md`: setup steps, tracked events, funnels, privacy/validation notes.
- `public/assets/identity/`: approved Green Signature B navigation logos, icons, and social cards. The original `logo-official.png` remains the raster provenance source, not live site branding.
- `IDENTITY_WAVE_2.md`: approved identity, source limitations, optional export commands, and verification.
- `HOMEPAGE_WAVE_4.md`: homepage decisions, screenshot links, verification, and deferred work.
- `PRODUCT_DISCOVERY_WAVE_5.md`: three-page visitor journey, authentic capture provenance, responsive review, verification, and the November 6 release switch.
- `public/product-discovery.css`, `public/product-discovery.js`: scoped supporting-page reading rhythm and illustrative supported/manual form comparison.
- `public/evidence.css`, `public/how-it-works.css`, `public/get-started.css`: page-owned Wave 5 compositions.
- `scripts/sync-availability.mjs`: generates Get Started release status and existing homepage/shared availability notices from `public/release-config.js`; runs before the normal blog/shared-layout build.
- `scripts/site_checks.py`: optional browser/structural QA (requires Python packages `playwright` and `beautifulsoup4`, plus a Chromium binary).

The static HTML files are the source of truth for this deployment. Do not use `build_site.py` from an older marketing archive; it can restore obsolete hero/layout content.

## Shared layout

The homepage owns the header, footer, and evergreen announcement. After editing them, run `npm run build`: `scripts/shared-layout.mjs` copies those elements into static routes and the blog build uses the same source. `npm run check:blog` rejects stale static layouts. `public/site-layout.css` holds the scoped responsive styles and loads after page styles. All pages retain usable navigation without JavaScript.

Run `python scripts/navigation_checks.py --url http://127.0.0.1:8765` against the preview for keyboard, touch, breakpoint, no-JavaScript and mock analytics checks. Optional QA dependencies are Playwright and BeautifulSoup; use `--browser /path/to/chromium` if needed. See [NAVIGATION_WAVE_3.md](NAVIGATION_WAVE_3.md) for the local review.

## Product/distribution boundaries

The landing page is separate from the [YourMove application](https://github.com/jenksed/yourmove-go). The marketing artwork illustrates a product concept; it is not a verified screenshot, and platform logos do not independently establish qualified support. Do not imply automatic application submission. The Get Started page currently links to the application's source and release page rather than distributing a standalone installer.

Content and artwork licensing are **not specified** by this repository. Do not assume the app's GPL-3.0-only license automatically covers the marketing files or third-party branding depicted in artwork.

## Release announcement

A reusable release announcement is configured in **`public/release-config.js`**. Set `enabled: false` to restore the normal announcement everywhere, or change the date and copy to describe a planned release. See [RELEASE_BANNER.md](RELEASE_BANNER.md) for details and browser checks. For the verified official-release transition, fill `published` in that same configuration and run `npm run build`; see [Wave 5 launch instructions](PRODUCT_DISCOVERY_WAVE_5.md#november-6-launch-transition). A planned date never enables a download.
