/* Synthetic application example. No employer connection or submission action. */
(() => {
  const demo = document.querySelector('[data-compare]');
  if (!demo) return;
  const choices = [...demo.querySelectorAll('[data-compare-state]')];
  const answer = demo.querySelector('[data-demo-answer]');
  const originalAnswer = 'I traced a slow service to a database query, worked with the team on a fix, and checked the logs after rollout.';
  let preparedAnswer = originalAnswer;
  let editTracked = false;
  const setText = (selector, text) => { demo.querySelector(selector).textContent = text; };

  function show(mode, emit = true) {
    const saved = mode === 'saved';
    const previous = demo.dataset.mode;
    demo.dataset.mode = mode;
    choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.compareState === mode)));
    setText('[data-demo-name]', saved ? 'Taylor Kim' : 'Enter your name');
    setText('[data-demo-email]', saved ? 'taylor@example.com' : 'Enter your email');
    setText('[data-demo-resume]', saved ? 'Taylor_Kim_Support.pdf' : 'Choose a document');
    setText('[data-demo-continuity]', saved ? 'Carried forward. Ready for review.' : 'Same person. Separate form.');
    answer.readOnly = !saved;
    answer.value = saved ? preparedAnswer : '';
    setText('[data-demo-answer-help]', saved
      ? 'From Taylor’s saved work. Try editing it to fit this role; edits stay in this example.'
      : 'Switch to “With YourMove” to reuse Taylor’s answer.');
    setText('[data-demo-status]', saved
      ? 'A starting point, ready for your review. The job-specific answer still needs you.'
      : 'Nothing carried over. The same information needs entering again.');
    if (emit && previous !== mode) {
      document.dispatchEvent(new CustomEvent('ym:comparison-changed', {detail: {mode: saved ? 'with_yourmove' : 'starting_over'}}));
    }
  }

  choices.forEach((button, index) => {
    button.addEventListener('click', () => show(button.dataset.compareState));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = choices.length - 1;
      if (event.key === 'ArrowLeft') next = (index + choices.length - 1) % choices.length;
      if (event.key === 'ArrowRight') next = (index + 1) % choices.length;
      if (next !== undefined) {
        event.preventDefault();
        choices[next].focus();
        show(choices[next].dataset.compareState);
      }
    });
  });
  answer.addEventListener('input', () => {
    preparedAnswer = answer.value;
    if (!editTracked) {
      editTracked = true;
      // Only the interaction is measured. Never include the visitor's text.
      document.dispatchEvent(new CustomEvent('ym:comparison-answer-edited'));
    }
  });
  // Put the comparison controls and changing fields in view on the demo shortcut.
  // The ordinary section link remains useful without JavaScript.
  document.querySelector('.home-hero a[href="#experience"]').addEventListener('click', event => {
    event.preventDefault();
    demo.querySelector('.application-demo__toolbar').scrollIntoView({block: 'start'});
    choices[0].focus({preventScroll: true});
  });
  show('blank', false);
})();
