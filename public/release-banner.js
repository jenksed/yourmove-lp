/* Small site-wide announcement. All editable content lives in release-config.js. */
(() => {
  'use strict';
  const config = window.YOURMOVE_RELEASE;
  // A qualified release uses the build-generated evergreen availability notice.
  if (!config || config.published?.qualified === true || config.enabled !== true) return;

  // Validate a DATE, rather than inventing a release hour or timezone conversion.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(config.date || ''));
  if (!match) return;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const releaseUtcDay = Date.UTC(year, month - 1, day);
  const validDate = new Date(releaseUtcDay);
  if (validDate.getUTCFullYear() !== year || validDate.getUTCMonth() !== month - 1 || validDate.getUTCDate() !== day) return;

  const timeZone = String(config.timeZone || 'America/Detroit');
  let dateFormatter;
  try {
    dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit'
    });
  } catch (_) { return; }

  function daysRemaining() {
    const values = Object.fromEntries(dateFormatter.formatToParts(new Date())
      .filter(part => ['year', 'month', 'day'].includes(part.type))
      .map(part => [part.type, Number(part.value)]));
    const todayUtcDay = Date.UTC(values.year, values.month - 1, values.day);
    return Math.round((releaseUtcDay - todayUtcDay) / 86400000);
  }

  const strip = document.querySelector('.announcement');
  if (!strip) return;
  const original = strip.innerHTML;
  const safeLabel = value => String(value || '').slice(0, 70);
  const campaign = String(config.campaign || 'release').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 60);
  const title = safeLabel(config.title || 'Release');
  const dateLabel = safeLabel(config.dateLabel || new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC', month: 'short', day: 'numeric'
  }).format(validDate));
  const linkText = safeLabel(config.linkText || 'Release details');
  const href = String(config.linkHref || '/get-started/');
  // Only allow same-site paths: this banner is not a configurable redirect.
  if (!href.startsWith('/') || href.startsWith('//') || href.includes('\\')) return;

  const shell = document.createElement('div');
  shell.className = 'shell';
  const message = document.createElement('span');
  const link = document.createElement('a');
  link.className = 'ym-release-link';
  link.href = href;
  link.textContent = linkText;
  link.dataset.analyticsCta = 'release_details';
  link.dataset.analyticsPlacement = 'release_banner';
  shell.append(message, link);

  let displayed = false;
  function update() {
    const remaining = daysRemaining();
    if (remaining < 0) {
      // An old release date should never imply that a release shipped.
      if (displayed) {
        strip.classList.remove('ym-release-announcement');
        strip.innerHTML = original;
        displayed = false;
      }
      return;
    }
    message.textContent = `${title} planned for ${remaining === 0 ? 'today, ' : ''}${dateLabel}.`;
    if (!displayed) {
      strip.replaceChildren(shell);
      strip.classList.add('ym-release-announcement');
      displayed = true;
    }
  }
  update();
  if (!displayed) return;

  // Re-evaluate across midnight and when a suspended browser tab comes back.
  window.setInterval(update, 60 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') update();
  });
  // Existing PostHog click/visibility analytics pick up the data-analytics-cta.
  document.addEventListener('DOMContentLoaded', () => {
    if (window.YourMoveAnalytics?.track && displayed) {
      window.YourMoveAnalytics.track('ym_release_announcement_viewed', {
        release: campaign,
        days_remaining: daysRemaining()
      });
    }
  }, { once: true });
})();
