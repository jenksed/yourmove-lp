# Compact release announcement

The existing slim top announcement is temporarily replaced by a release bar on **all six pages**. No additional section or third-party dependency is added.

## Change or disable it

Edit **`public/release-config.js`** only:

```js
window.YOURMOVE_RELEASE = {
  enabled: true,                // change to false to restore the old announcement immediately
  title: 'INITIAL RELEASE',     // later: 'NEXT RELEASE', or a specific release name
  date: '2026-11-06',           // calendar date, YYYY-MM-DD
  dateLabel: 'NOV 6',
  timeZone: 'America/Detroit',
  campaign: 'initial_release_2026',
  linkText: 'Release details',
  linkHref: '/get-started/'
};
```

- **Turn off:** set `enabled: false`, commit, deploy. Nothing else to remove.
- **Reuse:** switch `enabled` back to `true` and update `title`, `date`, `dateLabel`, `campaign`, and the link. No HTML changes.
- **Expiration:** the bar displays `N DAYS TO GO` before its date, `TODAY` on the planned date, and reverts to the evergreen top announcement starting the next day. It does **not** claim a release actually shipped.
- **Time:** because no exact release hour is announced, it deliberately counts **calendar days**, not hours/minutes/seconds to an invented timestamp. The date is evaluated in `America/Detroit`, including DST. Counts update on a minute check and when the tab is visible again.
- **Customization:** `public/release-banner.css` contains the visual style; `public/release-banner.js` handles rendering and expiration. Keep all three files to reuse the feature.

## Tracking

The link carries `data-analytics-cta="release_details"` and `data-analytics-placement="release_banner"` for existing `ym_cta_clicked` and `ym_cta_viewed` events. While displayed, a `ym_release_announcement_viewed` event is sent with `release` (the campaign ID) and `days_remaining`. This event is emitted only when site analytics is available and enabled. No visitor text or user-entered data is captured.

## Verify

```bash
python3 scripts/release_banner_checks.py
python3 scripts/site_checks.py
python3 scripts/analytics_checks.py
```

The banner test checks 6 routes × 11 widths, including mobile containment, expected countdown text, and automatic expiration.
