/* YourMove landing page analytics · intentional events only.
 * No input values, job applications, answers, commands, freeform text,
 * query strings, hashes, or external URL parameters are sent as custom properties.
 */
(() => {
  'use strict';
  // Opt out before the PostHog SDK initializes. This is a browser-local preference;
  // PostHog's cookieless visitor identity cannot persist a per-user exclusion.
  const analyticsPreferenceKey = 'yourmove:analytics:disabled';
  const analyticsPreference = new URLSearchParams(location.search).get('ym_analytics');
  if (analyticsPreference === 'off' || analyticsPreference === 'on') {
    try {
      if (analyticsPreference === 'off') localStorage.setItem(analyticsPreferenceKey, '1');
      else localStorage.removeItem(analyticsPreferenceKey);
    } catch (_) { /* The URL switch still applies for this page if storage is blocked. */ }
  }
  if (analyticsPreference === 'off') return;
  try {
    if (localStorage.getItem(analyticsPreferenceKey) === '1') return;
  } catch (_) { /* Storage-disabled browsers need the URL switch on each visit. */ }

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
    '/evidence/':'career_evidence','/manifesto/':'manifesto','/review/':'design_review','/support/':'support'})[normalize(location.pathname)] || 'other';

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

  const comparisonSeen = new Set([document.querySelector('[data-compare]')?.dataset.mode === 'saved' ? 'with_yourmove' : 'starting_over']);
  let comparisonCompleted = false;

  // Conversion events. IDs are authored in markup; text from DOM is never collected.
  document.addEventListener('click', (ev) => {
    const anchor = ev.target.closest('a[href]');
    if (anchor) {
      const cta = anchor.dataset.analyticsCta;
      if (cta) capture('ym_cta_clicked', { cta, placement: anchor.dataset.analyticsPlacement || 'content' });
      if (anchor.closest('.site-nav') || anchor.closest('.footer-col')) {
        const h = anchor.getAttribute('href') || '';
        const destination = h.startsWith('/docs/') ? 'docs' : h.startsWith('/get-started') ? 'get_started' : h.startsWith('/#') ? 'home_section' : h === '/' ? 'home' : h.startsWith('https://github.com/') ? 'github' : 'other';
        capture('ym_navigation_clicked', { location: anchor.closest('.site-nav') ? 'header' : 'footer', destination });
      }
      try {
        const target = new URL(anchor.href);
        if (target.hostname === 'github.com' && target.pathname.startsWith('/jenksed/yourmove-go')) {
          const path = target.pathname;
          let action = 'repository';
          if (/\/releases\/download\//.test(path)) action = 'release_download';
          else if (/\/releases\/tag\//.test(path)) action = 'release_notes';
          else if (/\/releases\/?$/.test(path)) action = 'releases';
          else if (/\/archive\/refs\/heads\/.+\.zip$/.test(path)) action = 'source_zip';
          else if (/\/issues\/?$/.test(path)) action = 'report_issue';
          else if (/\/docs\/TRY_IT\.md$/.test(path)) action = 'local_run_docs';
          else if (path.includes('#build-the-macos-candidate-from-source')) action = 'mac_build_docs';
          else if (target.hash.includes('build-the-macos')) action = 'mac_build_docs';
          capture('ym_github_outbound_clicked', { action, placement: anchor.dataset.analyticsPlacement || 'content' });
        }
        if (target.hostname === 'ko-fi.com' && /^\/yourmove\/?$/.test(target.pathname)) {
          capture('ym_support_checkout_clicked', { provider: 'kofi', placement: anchor.dataset.analyticsPlacement || 'content' });
        }
      } catch (_) { /* Invalid href is a site issue, not an analytics blocker. */ }
    }

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
    const preparationPath = ev.target.closest('[data-path-choice]');
    if (preparationPath && ['supported', 'manual'].includes(preparationPath.dataset.pathChoice)) {
      capture('ym_preparation_path_selected', { path: preparationPath.dataset.pathChoice });
    }
    const menu = ev.target.closest('.menu-button');
    if (menu) capture('ym_mobile_menu_toggled', { state: menu.getAttribute('aria-expanded') === 'true' ? 'open' : 'closed' });
    const copy = ev.target.closest('[data-copy-text]');
    if (copy) capture('ym_install_command_copy_clicked', { command_group: copy.closest('.gs-console') ? 'mac_build' : 'browser_run' });
  });

  document.addEventListener('ym:comparison-changed', (ev) => {
    const mode=ev.detail?.mode;
    if(mode!=='starting_over'&&mode!=='with_yourmove')return;
    capture('ym_comparison_changed',{mode});
    comparisonSeen.add(mode);
    if(!comparisonCompleted&&comparisonSeen.size===2){
      comparisonCompleted=true;
      capture('ym_comparison_both_states_seen',{demo:'application_handoff'});
    }
  });

  document.addEventListener('ym:comparison-answer-edited', () => {
    capture('ym_comparison_answer_edited', { demo: 'application_handoff' });
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
    if (el.matches('.build-instructions')) {
      capture('ym_source_instructions_opened', { command_group: el.dataset.analyticsSection === 'mac_build' ? 'mac_build' : 'browser_run' });
    }
    if (el.matches('.actual-evidence')) capture('ym_evidence_detail_opened', { detail: 'local_build' });
    const faq = el.closest('.start-questions, .gs-details, .home-faq');
    if (!faq) return;
    const questions = [...faq.querySelectorAll('details')];
    capture('ym_faq_opened', { faq: (faq.classList.contains('gs-details') || faq.classList.contains('start-questions')) ? 'installation' : 'home', question: questions.indexOf(el) + 1 });
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

  // Marketing decision signals. All values are fixed, bounded categories; no form values.
  const version = 'marketing_v2';
  const safeCategory = (value) => /^[a-z0-9_-]{1,48}$/i.test(value || '') ? value.toLowerCase() : 'unknown';
  const getCampaign = () => {
    const params = new URLSearchParams(location.search);
    return ['utm_source','utm_medium','utm_campaign','utm_content'].reduce((out,key) => {
      const value=params.get(key);
      // Retain only authored marketing tokens, never arbitrary URL input.
      if (value && /^[a-z0-9_-]{1,64}$/i.test(value)) out[key]=value.toLowerCase();
      return out;
    },{});
  };
  const device = matchMedia('(max-width: 760px)').matches ? 'mobile' : 'desktop';
  const campaign=getCampaign();
  // Measured page visits, including repeat sessions; this is not an identity link.
  capture('ym_marketing_landing', { version, device, ...campaign });
  const activeTime={ms:0,start:document.visibilityState === 'visible' ? Date.now():null};
  const engagementMarks=new Set();
  function elapsedActive() {
    if(activeTime.start !== null){activeTime.ms += Math.max(0,Date.now()-activeTime.start); activeTime.start=null;}
    [15,45,90].forEach(t=>{if(activeTime.ms>=t*1000&&!engagementMarks.has(t)){engagementMarks.add(t);capture('ym_engagement_milestone',{seconds:t,version,device});}});
  }
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState === 'hidden') elapsedActive();
    else if(activeTime.start === null) activeTime.start=Date.now();
  });
  window.addEventListener('pagehide',elapsedActive);
  setInterval(()=>{if(document.visibilityState==='visible'){elapsedActive();activeTime.start=Date.now();}},5000);

  const exposedCtas=new WeakSet();
  const sectionTimes=new WeakMap();
  const seenFeatures=new Set();
  const featureLabels={
    experience:'less_repetition',workflow:'workflow',career_records:'career_evidence',
    control:'applicant_control',final_cta:'getting_started',
    release_availability:'release_availability',installation_paths:'installation',mac_build:'source_build',
    browser_run:'browser_setup',installation_faq:'installation_objections'
  };
  const observerSupported= 'IntersectionObserver' in window;
  if(observerSupported){
    const intentObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        const el=entry.target;
        if(el.matches('a[data-analytics-cta]')){
          if(entry.isIntersecting&&!exposedCtas.has(el)){
            exposedCtas.add(el);
            capture('ym_cta_viewed',{cta:safeCategory(el.dataset.analyticsCta),placement:safeCategory(el.dataset.analyticsPlacement||'content'),version,device});
          }
          return;
        }
        if(!el.matches('[data-analytics-section]'))return;
        if(entry.isIntersecting){
          if(!sectionTimes.has(el))sectionTimes.set(el,{since:Date.now(),spent:0,reported:false});
        } else {
          const record=sectionTimes.get(el);
          if(record&&record.since){record.spent+=Math.max(0,Date.now()-record.since);record.since=null;}
        }
      });
    },{threshold:0.5});
    document.querySelectorAll('a[data-analytics-cta], [data-analytics-section]').forEach(el=>intentObserver.observe(el));
    const featureObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        const feature=featureLabels[entry.target.dataset.analyticsSection];
        if(feature&&!seenFeatures.has(feature)){
          seenFeatures.add(feature);
          capture('ym_feature_interest',{feature,signal:'section_exposure',version,device});
        }
        featureObserver.unobserve(entry.target);
      });
    },{threshold:0.6});
    document.querySelectorAll('[data-analytics-section]').forEach(el=>featureObserver.observe(el));
  }
  function flushSectionEngagement(){
    if(document.visibilityState!=='visible')return;
    document.querySelectorAll('[data-analytics-section]').forEach(el=>{
      const record=sectionTimes.get(el);
      if(!record||record.reported)return;
      const ms=record.spent+(record.since?Date.now()-record.since:0);
      if(ms<8000)return;
      record.reported=true;
      capture('ym_content_engaged',{section:safeCategory(el.dataset.analyticsSection),threshold_seconds:8,version,device});
    });
  }
  setInterval(flushSectionEngagement,2000);
  document.addEventListener('click',ev=>{
    const target=ev.target instanceof Element?ev.target:null;
    if(!target)return;
    const button=target.closest('[data-flow],[data-evidence-stage],[data-compare-state]');
    if(button){
      const family=button.hasAttribute('data-flow')?'workflow':button.hasAttribute('data-evidence-stage')?'career_evidence':'comparison';
      const group=family==='workflow'?'[data-flow]':family==='career_evidence'?'[data-evidence-stage]':'[data-compare-state]';
      const items=[...document.querySelectorAll(group)];
      const step=items.indexOf(button)+1;
      if(step===items.length&&family!=='comparison')capture('ym_demo_completed',{demo:family,steps:items.length,version,device});
      capture('ym_feature_interest',{feature:family,signal:'interaction',version,device});
    }
    const anchor=target.closest('a[href]');
    if(anchor){
      const href=anchor.getAttribute('href')||'';
      if(href.startsWith('http')){
        try{
          const url=new URL(href,location.href);
          if(url.origin===location.origin)return;
          const category=url.hostname==='github.com'?'github':url.hostname.endsWith('posthog.com')?'posthog':'other';
          capture('ym_external_link_clicked',{destination:category,placement:safeCategory(anchor.dataset.analyticsPlacement||'content'),version,device});
        }catch(_){}
      }
    }
    const install=target.closest('[data-analytics-cta]');
    if(install&&/^(check_releases|download_release|build_on_mac|download_source)$/.test(install.dataset.analyticsCta||'')){
      capture('ym_install_path_selected',{path:install.dataset.analyticsCta,version,device});
    }
  },true);

})();
