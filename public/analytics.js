/* YourMove landing page analytics · intentional events only.
 * No input values, job applications, answers, commands, freeform text,
 * query strings, hashes, or external URL parameters are sent as custom properties.
 */
(() => {
  'use strict';
  const settings = window.YOURMOVE_POSTHOG || {};
  const token = String(settings.projectToken || '').trim();
  const host = String(settings.apiHost || 'https://us.i.posthog.com').replace(/\/$/, '');
  const allowedHosts = new Set(['https://us.i.posthog.com', 'https://eu.i.posthog.com']);
  const local = ['localhost', '127.0.0.1', '::1'].includes(location.hostname);
  if (!/^phc_[A-Za-z0-9_-]+$/.test(token) || !allowedHosts.has(host) || local) return;

  // Official PostHog browser snippet (script-loader and queued calls).
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split('.');2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement('script')).type='text/javascript',p.crossOrigin='anonymous',p.async=!0,p.src=s.api_host.replace('.i.posthog.com','-assets.i.posthog.com')+'/static/array.js',(r=t.getElementsByTagName('script')[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a='posthog',u.people=u.people||[],Object.defineProperty(u,'toString',{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e='posthog';return'posthog'!==a&&(e+='.'+a),t||(e+=' (stub)'),e}}),Object.defineProperty(u.people,'toString',{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+'.people (stub)'}}),o='init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug'.split(' '),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  // Do not enable identify, session replay, autocapture, error capture or people profiles here.
  // PostHog project setting required: Project Settings > Web analytics > Cookieless server hash mode.
  window.posthog.init(token, {
    api_host: host,
    defaults: '2026-08-30',
    cookieless_mode: 'always',
    person_profiles: 'never',
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    capture_exceptions: false,
    disable_surveys: true,
    // SDK metadata can contain URLs. Retain route/referrer context, not query data.
    // Preserve reserved fields such as `token` that PostHog needs for ingestion.
    before_send: (event) => {
      if (!event || !event.properties) return event;
      for (const prop of ['$current_url', '$initial_current_url', '$session_entry_url', '$referrer', '$initial_referrer']) {
        const raw = event.properties[prop];
        if (typeof raw !== 'string') continue;
        try {
          const url = new URL(raw);
          if (url.protocol !== 'http:' && url.protocol !== 'https:') continue;
          url.search = ''; url.hash = '';
          event.properties[prop] = url.toString();
        } catch (_) { /* Leave non-URLs intact. */ }
      }
      return event;
    }
  });

  const page = ({'/':'home','/get-started/':'get_started','/how-it-works/':'how_it_works',
    '/evidence/':'career_evidence','/manifesto/':'manifesto','/review/':'design_review'})[normalize(location.pathname)] || 'other';

  function normalize(path) {
    if (path === '/') return '/';
    return '/' + String(path).replace(/^\/+|\/+$/g, '') + '/';
  }
  function capture(event, props = {}) {
    window.posthog.capture(event, { page, path: normalize(location.pathname), ...props });
  }
  // Publicly useful for adding explicit events to future marketing components.
  window.YourMoveAnalytics = Object.freeze({ track: capture });

  // A single pageview per document; no query strings or full URLs in our custom payload.
  capture('$pageview', { $pathname: normalize(location.pathname), $current_url: location.origin + normalize(location.pathname) });

  // Conversion events. IDs are authored in markup; text from DOM is never collected.
  document.addEventListener('click', (ev) => {
    const anchor = ev.target.closest('a[href]');
    if (anchor) {
      const cta = anchor.dataset.analyticsCta;
      if (cta) capture('ym_cta_clicked', { cta, placement: anchor.dataset.analyticsPlacement || 'content' });
      if (anchor.closest('.site-nav') || anchor.closest('.footer-col')) {
        const h = anchor.getAttribute('href') || '';
        const destination = h.startsWith('/get-started') ? 'get_started' : h.startsWith('/#') ? 'home_section' : h === '/' ? 'home' : h.startsWith('https://github.com/') ? 'github' : 'other';
        capture('ym_navigation_clicked', { location: anchor.closest('.site-nav') ? 'header' : 'footer', destination });
      }
      try {
        const target = new URL(anchor.href);
        if (target.hostname === 'github.com' && target.pathname.startsWith('/jenksed/yourmove-go')) {
          const path = target.pathname;
          let action = 'repository';
          if (/\/releases\/?$/.test(path)) action = 'releases';
          else if (/\/archive\/refs\/heads\/.+\.zip$/.test(path)) action = 'source_zip';
          else if (/\/issues\/?$/.test(path)) action = 'report_issue';
          else if (/\/docs\/TRY_IT\.md$/.test(path)) action = 'local_run_docs';
          else if (path.includes('#build-the-macos-candidate-from-source')) action = 'mac_build_docs';
          else if (target.hash.includes('build-the-macos')) action = 'mac_build_docs';
          capture('ym_github_outbound_clicked', { action, placement: anchor.dataset.analyticsPlacement || 'content' });
        }
      } catch (_) { /* Invalid href is a site issue, not an analytics blocker. */ }
    }
    const cmp = ev.target.closest('[data-compare-state]');
    if (cmp) capture('ym_comparison_changed', { mode: cmp.dataset.compareState === 'blank' ? 'starting_over' : 'with_yourmove' });
    const workflow = ev.target.closest('[data-flow]');
    if (workflow) {
      const tabs = [...workflow.closest('[data-workflow]').querySelectorAll('[data-flow]')];
      capture('ym_workflow_step_selected', { step: tabs.indexOf(workflow) + 1 });
    }
    const evidence = ev.target.closest('[data-evidence-stage]');
    if (evidence) {
      const tabs = [...evidence.closest('[data-evidence]').querySelectorAll('[data-evidence-stage]')];
      capture('ym_evidence_stage_selected', { stage: tabs.indexOf(evidence) + 1 });
    }
    const menu = ev.target.closest('.menu-button');
    if (menu) capture('ym_mobile_menu_toggled', { state: menu.getAttribute('aria-expanded') === 'true' ? 'open' : 'closed' });
    const copy = ev.target.closest('[data-copy-text]');
    if (copy) capture('ym_install_command_copy_clicked', { command_group: copy.closest('.gs-console') ? 'mac_build' : 'browser_run' });
  });

  document.addEventListener('ym:copy-command', (ev) => {
    if (!ev.detail) return;
    capture('ym_install_command_copy_result', {
      command_group: ev.detail.group === 'mac_build' ? 'mac_build' : 'browser_run',
      result: ev.detail.result === 'success' ? 'success' : 'failure'
    });
  });

  document.addEventListener('toggle', (ev) => {
    const el = ev.target;
    if (!(el instanceof HTMLDetailsElement) || !el.open) return;
    const faq = el.closest('.gs-details, .home-faq');
    if (!faq) return;
    const questions = [...faq.querySelectorAll('details')];
    capture('ym_faq_opened', { faq: faq.classList.contains('gs-details') ? 'installation' : 'home', question: questions.indexOf(el) + 1 });
  }, true);

  if ('IntersectionObserver' in window) {
    const sections = [...document.querySelectorAll('[data-analytics-section]')];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.dataset.analyticsSection;
        if (id) capture('ym_section_viewed', { section: id });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.30 });
    sections.forEach((section) => observer.observe(section));
  }

  const milestones = new Set();
  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    const depth = Math.floor((window.scrollY / max) * 100);
    [50, 90].forEach((threshold) => {
      if (depth >= threshold && !milestones.has(threshold)) {
        milestones.add(threshold);
        capture('ym_scroll_depth_reached', { percent: threshold });
      }
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();
