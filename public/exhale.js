/* Actual product screenshot selector and progressive, reduced-motion-safe reveals. */
(() => {
  'use strict';
  const home = document.querySelector('.exhale-home');
  if (!home) return;

  const controls = home.querySelector('[data-exhale-controls]');
  const buttons = [...home.querySelectorAll('[data-exhale-stage]')];
  const panels = [...home.querySelectorAll('[data-exhale-panel]')];
  const valid = ['opportunities', 'questions', 'apply'];

  if (controls && buttons.length === valid.length && panels.length === valid.length) {
    const show = (name, emit = true) => {
      if (!valid.includes(name)) return;
      for (const panel of panels) {
        const active = panel.dataset.exhalePanel === name;
        panel.hidden = !active;
        panel.classList.toggle('exhale-panel--entered', active && emit);
      }
      for (const button of buttons) {
        button.setAttribute('aria-pressed', String(button.dataset.exhaleStage === name));
      }
      if (emit) {
        document.dispatchEvent(new CustomEvent('ym:product-stage-changed', { detail: { stage: name } }));
      }
    };
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => show(button.dataset.exhaleStage));
      button.addEventListener('keydown', (event) => {
        let next = null;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = buttons.length - 1;
        if (event.key === 'ArrowLeft') next = (index + buttons.length - 1) % buttons.length;
        if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
        if (next === null) return;
        event.preventDefault();
        buttons[next].focus();
        show(buttons[next].dataset.exhaleStage);
      });
    });
    // Controls are only shown after their behavior is installed. Without JS all
    // three screenshots remain visible as ordinary sections.
    show('opportunities', false);
    controls.hidden = false;
  }

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || !('IntersectionObserver' in window)) return;
  const targets = [...home.querySelectorAll('[data-exhale-reveal]')];
  if (!targets.length) return;
  home.classList.add('exhale-animated');
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('exhale-in-view');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -18px 0px' });
  targets.forEach((target) => observer.observe(target));
})();