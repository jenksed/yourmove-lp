/* Small site-wide announcement. All editable content lives in release-config.js. */
(() => {
  'use strict';
  const config = window.YOURMOVE_RELEASE;
  if (!config || config.enabled !== true) return;

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
  const title = safeLabel(config.title || 'UPCOMING RELEASE');
  const dateLabel = safeLabel(config.dateLabel || new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC', month: 'short', day: 'numeric'
  }).format(validDate)).toUpperCase();
  const linkText = safeLabel(config.linkText || 'Release details');
  const href = String(config.linkHref || '/get-started/');
  // Only allow same-site paths: this banner is not a configurable redirect.
  if (!href.startsWith('/') || href.startsWith('//') || href.includes('\\')) return;

  const shell = document.createElement('div');
  shell.className = 'shell';
  const left = document.createElement('div');
  left.className = 'ym-release-left';
  const dot = document.createElement('span');
  dot.className = 'ym-release-dot';
  dot.setAttribute('aria-hidden', 'true');
  const kicker = document.createElement('span');
  kicker.className = 'ym-release-kicker';
  kicker.textContent = 'COMING UP';
  const heading = document.createElement('strong');
  heading.className = 'ym-release-title';
  heading.textContent = title;
  const date = document.createElement('span');
  date.className = 'ym-release-date';
  date.textContent = dateLabel;
  left.append(dot, kicker, heading, date);

  const right = document.createElement('div');
  right.className = 'ym-release-right';
  const countdown = document.createElement('span');
  countdown.className = 'ym-release-countdown';
  countdown.setAttribute('role', 'status');
  const link = document.createElement('a');
  link.className = 'ym-release-link';
  link.href = href;
  link.textContent = linkText + ' ↗';
  link.dataset.analyticsCta = 'release_details';
  link.dataset.analyticsPlacement = 'release_banner';
  right.append(countdown, link);
  shell.append(left, right);

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
    countdown.textContent = remaining === 0 ? 'TODAY' : remaining === 1 ? '1 DAY TO GO' : `${remaining} DAYS TO GO`;
    countdown.setAttribute('aria-label', remaining === 0
      ? `${title} planned for today, ${dateLabel}`
      : `${remaining} days until ${title} on ${dateLabel}`);
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
