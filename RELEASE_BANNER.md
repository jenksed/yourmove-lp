# Compact release announcement

The existing slim top announcement is temporarily replaced by a release bar on **all 14 routes**, including generated blog pages and documentation. No additional section or third-party dependency is added.

## Change or disable it

Edit **`public/release-config.js`** only:

```js
window.YOURMOVE_RELEASE = {
  enabled: true,                // change to false to restore the availability announcement immediately
  title: 'Initial release',     // later: 'NEXT RELEASE', or a specific release name
  date: '2026-11-06',           // calendar date, YYYY-MM-DD
  dateLabel: 'November 6',
  timeZone: 'America/Detroit',
  campaign: 'initial_release_2026',
  linkText: 'Release details',
  linkHref: '/get-started/'
};
```

- **Turn off:** set `enabled: false`, commit, deploy. Nothing else to remove.
- **Reuse:** switch `enabled` back to `true` and update `title`, `date`, `dateLabel`, `campaign`, and the link. No HTML changes.
- **Expiration:** before the planned date the bar says “Initial release planned for November 6.” On that date it says “planned for today, November 6.” Starting the next day it restores the source/installer availability message. It never claims the release shipped.
- **Time:** the calendar date is evaluated in `America/Detroit`, including DST. The message updates on a minute check and when a suspended tab becomes visible. There is no visible countdown.
- **Customization:** `public/release-banner.css` contains the visual style; `public/release-banner.js` handles rendering and expiration. Keep all three files to reuse the feature.

## Tracking

The link carries `data-analytics-cta="release_details"` and `data-analytics-placement="release_banner"` for existing `ym_cta_clicked` and `ym_cta_viewed` events. While displayed, a `ym_release_announcement_viewed` event is sent with `release` (the campaign ID) and `days_remaining`. This event is emitted only when site analytics is available and enabled. No visitor text or user-entered data is captured.

## Verify

```bash
python3 scripts/release_banner_checks.py
python3 scripts/site_checks.py
python3 scripts/analytics_checks.py
```

The banner test checks 14 routes × 11 widths, including mobile containment, planned-date text, live midnight expiration, and invalid/disabled configuration fallbacks. Pass `--browser /path/to/chromium` if needed.
