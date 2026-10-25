# YourMove landing page — PostHog analytics

## Start collecting events

**Project token configured.** The provided `phc_` token is already set in `public/analytics-config.js`; no code edit is needed unless you change PostHog projects. The host is currently set to the US region.

1. Create a **PostHog project** and find its **Project token** in Project Settings. The browser-safe token begins with `phc_`.
2. In PostHog, enable **Project Settings → Web analytics → Cookieless server hash mode**. This is needed for the site's `cookieless_mode: "always"` configuration.
3. The token has already been inserted in **`public/analytics-config.js`**. The file has this structure (token redacted below):

   ```js
   window.YOURMOVE_POSTHOG = {
     projectToken: 'phc_YOUR_POSTHOG_PROJECT_TOKEN',
     apiHost: 'https://us.i.posthog.com'
   };
   ```

   If the project was created in the EU, use `https://eu.i.posthog.com` instead. No further site code edits are needed if this project uses the US host.
4. Commit/push and redeploy to Vercel.
5. Open the production site and check **PostHog → Activity / Live events** for a `$pageview`, then click **Get started** and check for `ym_cta_clicked`.

**Do not use a PostHog personal API key (`phx_...`).** A `phx_` key grants access to protected account data, while a `phc_` project token is intended to be public in browser code.

With an empty token, analytics remains disabled. To prevent test traffic from polluting analytics, the integration does not initialize on `localhost` or `127.0.0.1`. The `vercel.app` preview deployment is *not* automatically excluded: test visits there are counted once a token is set.

## Excluding your own browser from analytics

Open **https://www.yourmove.run/?ym_analytics=off** once in every browser profile/device you use to test the production site. The opt-out is saved in that origin's `localStorage` under `yourmove:analytics:disabled`. When set, `public/analytics.js` returns **before initializing PostHog or sending the first pageview**. Normal visitors remain tracked.

- Visit **https://www.yourmove.run/?ym_analytics=on** to resume tracking in that browser.
- The preference applies to `www.yourmove.run` only; a different hostname, browser profile, or device needs its own opt-out.
- Clearing website data removes the preference. If storage is blocked (for example, certain private browsing environments), the `off` URL suppresses only that page load; repeat it for each visit.
- Don't distribute the `off` URL in ads, social posts, or documentation links intended for visitors. Anyone opening it opts their own browser out.
- The preference is stored by YourMove's page code, **not by PostHog**. The existing cookieless SDK configuration remains unchanged.
- This does **not** remove previously ingested events. Cookieless server-side daily IDs cannot reliably identify historical owner visits, so do not delete or filter past users without independent attribution evidence.

## Tracking plan

| Event | Trigger | Important properties |
|---|---|---|
| `$pageview` | Once per full document navigation, on all six pages | `page`, `path`, `$pathname` |
| `ym_cta_clicked` | Explicit main CTA links | `cta`, `placement`, `page` |
| `ym_navigation_clicked` | Header and footer navigation links | `location`, `destination`, `page` |
| `ym_github_outbound_clicked` | Link to YourMove application GitHub repo | `action` (`repository`, `releases`, `source_zip`, `mac_build_docs`, `local_run_docs`, `report_issue`), `placement` |
| `ym_comparison_changed` | Homepage starting-over/with-YourMove toggle | `mode` |
| `ym_comparison_both_states_seen` | Visitor switches from the default With YourMove demo into Starting Over (once per page load) | `demo = application_handoff` |
| `ym_workflow_step_selected` | How It Works interactive tab | `step` |
| `ym_evidence_stage_selected` | Career evidence example tab | `stage` |
| `ym_section_viewed` | One-time intersection of marked homepage / Get Started sections | `section` |
| `ym_scroll_depth_reached` | First time reaching 50% or 90% | `percent` |
| `ym_faq_opened` | Installation FAQ item opened | `faq`, `question` (numeric index) |
| `ym_install_command_copy_clicked` | Visitor attempts to copy Mac build or browser command | `command_group` |
| `ym_install_command_copy_result` | Browser reports a successful/failed clipboard copy | `command_group`, `result` |
| `ym_mobile_menu_toggled` | Mobile menu opened/closed | `state` |

Event names and properties are stable, authored enums/IDs rather than text scraped from the page. `ym_install_command_copy_result: success` means the clipboard operation worked, **not** that YourMove installed or launched. GitHub/source/release events indicate a **click intent**, not a completed download or install.

## Funnels to build in PostHog

**Primary conversion — Interested visitor to distribution**

1. `$pageview` filtered to `page = home`
2. `ym_cta_clicked` filtered to `cta = get_started`
3. `$pageview` filtered to `page = get_started`
4. `ym_github_outbound_clicked` filtered to `action in [releases, source_zip, repository]`

**Source-builder conversion**

1. `$pageview` filtered to `page = get_started`
2. `ym_section_viewed` filtered to `section = mac_build`
3. `ym_install_command_copy_result` filtered to `command_group = mac_build` and `result = success`

**Landing-page engagement**

- Count/unique estimate by page via `$pageview`.
- `ym_section_viewed` by `section` to see where visitors reach.
- `ym_comparison_changed`, `ym_comparison_both_states_seen`, and `ym_scroll_depth_reached` to measure product explanation engagement.
- `ym_cta_clicked` broken down by `placement` to compare hero versus final CTA.
- `ym_github_outbound_clicked` by `action` to understand interest in releases, source downloads, and build instructions.

**Important:** PostHog cookieless mode prioritizes privacy and may reduce accuracy of sequential person-level funnels and returning-visitor measurement. Treat findings as directional and validate conversion totals using GitHub Releases download data and installation/use feedback. GitHub source-archive requests may not be reflected in GitHub Releases metrics.

## Privacy and limitations

The integration intentionally disables broad click autocapture, session replay, exception capture, surveys, and person profiles. It never invokes `identify()` and never reads or sends form-field values, copied commands, professional experience records, application questions, or response contents. The custom event properties are bounded; a `before_send` hook removes query strings and fragments from common PostHog URL metadata.

The site loads PostHog's hosted browser SDK *only after you add a valid token*, and it sends events to the configured PostHog US/EU host. Cookieless mode means it does not use PostHog cookies or browser storage, but PostHog still receives network requests and derives privacy-preserving audience information server-side. Review your public privacy notice and applicable laws before production use. No claim of blanket regulatory compliance is made.

This integration covers **the marketing website only**. It does not instrument the Go application, GitHub, a downloaded installer, or a visitor's actual installation. You cannot directly infer installs from clicks or command copies.

## Troubleshooting

- **No events:** confirm the value begins `phc_`, not `phx_`; the US/EU host matches your PostHog project; the cookieless server hash option is enabled; and you are not on localhost.
- **Ad blocker:** analytics network traffic may be blocked by browser settings or extensions.
- **Content Security Policy:** if you add a CSP to Vercel later, allow scripts and connections to `https://*.posthog.com` as required by PostHog, or use a documented reverse proxy.
- **Duplicate analytics:** avoid installing another PostHog script using Tag Manager, Vercel integrations, or pasted HTML while this instrumentation is active.
- **Test without sending events:** run `python3 scripts/analytics_checks.py` from the project root; it tests against a mocked PostHog client. `python3 scripts/site_checks.py` runs the existing page/responsive checks. These tests do **not** verify live ingestion; use the PostHog Activity screen for that.

Sources: [PostHog JavaScript Web SDK](https://posthog.com/docs/libraries/js), [cookieless tracking](https://posthog.com/tutorials/cookieless-tracking), [privacy](https://posthog.com/docs/privacy).
