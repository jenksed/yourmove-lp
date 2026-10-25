/* Progressive support-story sharing; no visitor text or personal data collected. */
(() => {
  'use strict';
  const link = document.querySelector('[data-support-share]');
  if (!link) return;
  const status = document.querySelector('[data-share-status]');
  const url = 'https://www.yourmove.run/support/';
  const title = 'Why I’m building YourMove';
  const message = 'An independent developer building an open-source answer to repetitive job applications.';
  const record = (method) => window.YourMoveAnalytics?.track('ym_support_share_completed', { method });
  link.addEventListener('click', async (event) => {
    if (navigator.share) {
      event.preventDefault();
      try {
        await navigator.share({ title, text: message, url });
        record('native');
      } catch (_) { /* A dismissed share sheet is not a successful share. */ }
      return;
    }
    if (navigator.clipboard && window.isSecureContext) {
      event.preventDefault();
      try {
        await navigator.clipboard.writeText(url);
        if (status) status.textContent = 'Link copied. Thanks for sharing.';
        record('clipboard');
      } catch (_) {
        window.location.href = link.href;
      }
      return;
    }
    record('email');
    /* Without share or clipboard support, the anchor's mailto: fallback remains usable. */
  });
})();
