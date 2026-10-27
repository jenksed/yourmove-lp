// The copy control is intentionally optional; reading and navigation work without JavaScript.
document.querySelectorAll('[data-copy-article]').forEach(button => {
  button.hidden = false;
  button.addEventListener('click', async () => {
    const url = button.getAttribute('data-url');
    const status = button.closest('.ym-article-end')?.querySelector('[data-copy-status]');
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      if (status) status.textContent = 'Article link copied.';
    } catch {
      if (status) status.textContent = 'Copy the address from your browser to share this article.';
    }
  });
});
