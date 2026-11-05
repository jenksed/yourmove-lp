/* YourMove release announcement — edit this file for every launch.
 * enabled: false immediately restores the evergreen announcement site-wide.
 * date: scheduled release DATE only (YYYY-MM-DD); no unannounced clock time.
 * On the scheduled date, the bar says "planned for today"; the next day it disappears.
 * To reuse it, change the title, date, label, and link. No HTML edits.
 */
window.YOURMOVE_RELEASE = {
  // v0.1.0 Mac technical alpha published as a GitHub prerelease; clean
  // install reported complete by the release owner on 2026-11-05.
  published: {
    qualified: true,
    version: 'v0.1.0',
    platform: 'macOS arm64',
    requirements: 'macOS 26+, Apple Silicon. Unnotarized alpha: approve in System Settings → Privacy & Security → Open Anyway. Verify SHA-256.',
    verifiedOn: '2026-11-05',
    releaseUrl: 'https://github.com/jenksed/yourmove-go/releases/tag/v0.1.0',
    downloadUrl: 'https://github.com/jenksed/yourmove-go/releases/download/v0.1.0/YourMove-0.1.0-macOS-arm64.dmg'
  },
  enabled: true,
  title: 'Initial release',
  date: '2026-11-06',
  dateLabel: 'November 6',
  timeZone: 'America/Detroit',
  campaign: 'initial_release_2026',
  linkText: 'Release details',
  linkHref: '/get-started/'
};
