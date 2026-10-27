/* YourMove release announcement — edit this file for every launch.
 * enabled: false immediately restores the evergreen announcement site-wide.
 * date: scheduled release DATE only (YYYY-MM-DD); no unannounced clock time.
 * On the scheduled date, the bar says "planned for today"; the next day it disappears.
 * To reuse it, change the title, date, label, and link. No HTML edits.
 */
window.YOURMOVE_RELEASE = {
  // Set only after the asset is published and its downloaded installation is qualified.
  // Run npm run build afterward. Null keeps the pending-release presentation.
  // See PRODUCT_DISCOVERY_WAVE_5.md for the launch transition and rollback.
  published: null,
  enabled: true,
  title: 'Initial release',
  date: '2026-11-06',
  dateLabel: 'November 6',
  timeZone: 'America/Detroit',
  campaign: 'initial_release_2026',
  linkText: 'Release details',
  linkHref: '/get-started/'
};
