/* An illustrative comparison only. No employer connection or application data. */
(() => {
  const example = document.querySelector('[data-path-example]');
  if (!example) return;
  const buttons = [...example.querySelectorAll('[data-path-choice]')];
  const select = (button) => {
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    example.querySelectorAll('[data-path-panel]').forEach(panel => {
      panel.hidden = panel.dataset.pathPanel !== button.dataset.pathChoice;
    });
  };
  buttons.forEach(button => button.addEventListener('click', () => select(button)));
  select(buttons[0]);
})();
