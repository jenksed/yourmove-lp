# YourMove landing page

The static marketing website for YourMove, built with plain HTML, CSS and JavaScript, Jost typography, and official YourMove branding. The site explains the application-continuity workflow and directs visitors to the [YourMove application repository](https://github.com/jenksed/yourmove-go) for source code and release status.

## Local preview

Requires only Python 3 (or another static file server):

```bash
cd public
python3 -m http.server 8765
```

Open <http://localhost:8765>. No Node, bundler, build command, or environment variables are needed.

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

Open Graph image metadata in the HTML currently references `https://yourmove.run/assets/og-platforms.webp`, the intended custom-domain asset. That URL will not represent the new deployment until the domain is mapped. Test social previews after connecting the production domain.

## Edit the site

- `public/index.html`: homepage content.
- `public/{get-started,how-it-works,evidence,manifesto,review}/index.html`: supporting pages.
- `public/hero.css`: full-background photographic hero; headline, supporting copy and CTAs are HTML elements, **not embedded in the image**.
- `public/styles.css`, `public/campaign.css`, `public/focused.css`, `public/brand-refresh.css`: shared and section styles.
- `public/app.js`: mobile menu and interactive examples.
- `public/assets/`: only images referenced by the published site.
- `scripts/site_checks.py`: optional browser/structural QA (requires Python packages `playwright` and `beautifulsoup4`, plus a Chromium binary).

The static HTML files are the source of truth for this deployment. Do not use `build_site.py` from an older marketing archive; it can restore obsolete hero/layout content.

## Product/distribution boundaries

The landing page is separate from the [YourMove application](https://github.com/jenksed/yourmove-go). The marketing artwork illustrates a product concept; it is not a verified screenshot, and platform logos do not independently establish qualified support. Do not imply automatic application submission. The Get Started page currently links to the application's source and release page rather than distributing a standalone installer.

Content and artwork licensing are **not specified** by this repository. Do not assume the app's GPL-3.0-only license automatically covers the marketing files or third-party branding depicted in artwork.
