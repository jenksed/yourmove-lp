(()=>{
  document.documentElement.classList.add('js');
  const menu=document.querySelector('.menu-button');
  const nav=document.querySelector('.site-nav');
  if(menu&&nav){
    const setOpen=(open)=>{
      menu.setAttribute('aria-expanded',String(open));
      nav.classList.toggle('is-open',open);
      menu.querySelector('.menu-icon').textContent=open?'−':'+';
      const label=menu.querySelector('[data-menu-label]');
      if(label)label.textContent=open?'Close':'Menu';
    };
    menu.addEventListener('click',()=>setOpen(menu.getAttribute('aria-expanded')!=='true'));
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      if(window.matchMedia('(max-width:900px)').matches)menu.focus();
      setOpen(false);
    }));
    const header=menu.closest('.header');
    header.addEventListener('focusout',e=>{if(e.relatedTarget&&!header.contains(e.relatedTarget))setOpen(false)});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){setOpen(false);menu.focus()}});
    document.addEventListener('pointerdown',e=>{if(!menu.contains(e.target)&&!nav.contains(e.target))setOpen(false)});
    window.matchMedia('(min-width:901px)').addEventListener('change',e=>{if(e.matches)setOpen(false)});
  }
  const path='/' + window.location.pathname.split('/').filter(Boolean).filter(p=>p!=='index.html').join('/') + '/';
  document.querySelectorAll('.site-nav [data-path]').forEach(a=>{
    if(a.dataset.path===path)a.setAttribute('aria-current','page');
    else if(path.startsWith(a.dataset.path))a.setAttribute('aria-current','location');
  });
  const stages=[
    {kicker:'OPPORTUNITY / 01',title:'One job. One place to begin.',body:'Start with a supported employer posting and its application requirements.',rows:[['Opportunity','Support Engineer'],['Source','Employer posting'],['Next','Prepare application']]},
    {kicker:'YOUR RECORDS / 02',title:'Your work comes with you.',body:'Choose the information, answers, and documents that belong in this application.',rows:[['Candidate profile','Saved information'],['Documents','Selected resume'],['Previous writing','Answer Library']]},
    {kicker:'APPLICATION / 03',title:'Less starting from zero.',body:'Prepare supported employer fields using information you can inspect and correct.',rows:[['Employer form','Supported fields'],['Prior answer','Available to review'],['Unresolved items','Still yours to finish']]},
    {kicker:'REVIEW / 04',title:'Your application. Your call.',body:'Review the employer form, submit it yourself, and confirm the application in your records.',rows:[['Review','Applicant controlled'],['Final submission','On employer site'],['Application record','Confirmed by you']]}
  ];
  function tabs(container, tabSelector, render, keys=['ArrowRight','ArrowLeft']) {
    const controls=[...container.querySelectorAll(tabSelector)];
    controls.forEach((button,i)=>{
      button.addEventListener('click',()=>render(i));
      button.addEventListener('keydown',e=>{
        let next=null;
        if(e.key==='Home')next=0;
        if(e.key==='End')next=controls.length-1;
        if(keys.includes(e.key)){
          const delta=(e.key==='ArrowDown'||e.key==='ArrowRight')?1:-1;
          next=(i+delta+controls.length)%controls.length;
        }
        if(next!==null){e.preventDefault();render(next);controls[next].focus()}
      });
    });
    return controls;
  }
  const flow=document.querySelector('[data-workflow]');
  if(flow){
    const content=flow.querySelector('[data-flow-content]');
    const panel=flow.querySelector('#flow-stage');
    const controls=[...flow.querySelectorAll('[data-flow]')];
    function render(i){
      const s=stages[i];
      controls.forEach((b,j)=>{b.setAttribute('aria-selected',String(i===j));b.tabIndex=i===j?0:-1});
      panel.setAttribute('aria-labelledby',`flow-tab-${i}`);const num=flow.querySelector('.ym-screen-step');if(num)num.textContent=String(i+1);
      content.replaceChildren();
      const kicker=document.createElement('div');kicker.className='mock-kicker';kicker.textContent=s.kicker;
      const title=document.createElement('h3');title.textContent=s.title;
      const desc=document.createElement('p');desc.textContent=s.body;
      const rows=document.createElement('div');rows.className='mini-rows';
      s.rows.forEach(([key,val])=>{const row=document.createElement('div');const a=document.createElement('span');const b=document.createElement('strong');a.textContent=key;b.textContent=val;row.append(a,b);rows.append(row)});
      content.append(kicker,title,desc,rows);
    }
    tabs(flow,'[data-flow]',render,['ArrowRight','ArrowLeft','ArrowDown','ArrowUp']);render(0);
  }
  const evidence=document.querySelector('[data-evidence]');
  if(evidence){
    const controls=[...evidence.querySelectorAll('[data-evidence-stage]')];
    const panel=evidence.querySelector('[data-evidence-body]');
    const parts=[
      {meta:'EXAMPLE / EMPLOYER QUESTION',title:'Tell us about a difficult technical problem you solved.',text:'A familiar question. The answer you write now shouldn’t be buried in yesterday’s application.',footer:'ILLUSTRATIVE SCENARIO'},
      {meta:'EXAMPLE / APPLICANT-CURATED RECORD',title:'Keep the actual incident, not just the polished answer.',text:'Situation: production service issue. Actions: investigated logs and coordinated recovery. Outcome: not recorded. Applicant review is not external verification.',footer:'SELF-REVIEWED ≠ INDEPENDENTLY VERIFIED'},
      {meta:'EXAMPLE / A LATER APPLICATION',title:'Now you have a real place to start.',text:'Your past writing and evidence records can inform a new answer. You decide what is relevant, adjust the language, and verify every claim.',footer:'APPLICANT MAKES THE FINAL EDIT'}
    ];
    function render(i){
      controls.forEach((t,j)=>{t.setAttribute('aria-selected',String(i===j));t.tabIndex=j===i?0:-1});
      const p=parts[i];panel.replaceChildren();
      const meta=document.createElement('div');meta.className='ev-stage-meta';meta.textContent=p.meta;
      const h=document.createElement('h3');h.textContent=p.title;
      const body=document.createElement('p');body.textContent=p.text;
      const footer=document.createElement('span');footer.className='ev-stage-bottom';footer.textContent=p.footer;
      panel.append(meta,h,body,footer);
    }
    tabs(evidence,'[data-evidence-stage]',render,['ArrowLeft','ArrowRight']);render(0);
  }
  document.querySelectorAll('[data-copy-text]').forEach(btn=>btn.addEventListener('click',async()=>{
    const original=btn.textContent;const value=btn.dataset.copyText;
    try{
      if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(value)}
      else{
        const t=document.createElement('textarea');t.value=value;t.style.position='fixed';t.style.left='-9999px';document.body.appendChild(t);t.select();const success=document.execCommand('copy');t.remove();if(!success)throw Error('Copy denied');
      }
      btn.textContent='Copied ✓';
      document.dispatchEvent(new CustomEvent('ym:copy-command',{detail:{group:btn.closest('.gs-console')?'mac_build':'browser_run',result:'success'}}));
    }catch(_){btn.textContent='Select text manually';
      document.dispatchEvent(new CustomEvent('ym:copy-command',{detail:{group:btn.closest('.gs-console')?'mac_build':'browser_run',result:'failure'}}));}
    setTimeout(()=>btn.textContent=original,1800);
  }));

  // A direct Kit form post keeps subscription handling and email delivery outside
  // this static site. Paste the exact action URL from Kit's HTML form embed.
  // Leave blank until the form and confirmation email have been tested.
  const kitFormAction = '';
  const kitFormURL = (() => {
    try {
      const url = new URL(kitFormAction);
      return url.protocol === 'https:' &&
        ['app.kit.com', 'app.convertkit.com'].includes(url.hostname) &&
        /^\/forms\/[0-9]+\/subscriptions\/?$/.test(url.pathname) &&
        !url.search && !url.hash ? url.href : '';
    } catch { return ''; }
  })();
  if (kitFormURL) {
    const placements = [
      {selector:'.home-next', mode:'beforebegin', name:'home',
        kicker:'FIELD NOTES / YOURMOVE', title:'The application is more than a form.',
        copy:'Short, useful notes on ATS systems, application questions, and what really happens when you hit Submit.'},
      {selector:'.ym-journal-companion', mode:'beforebegin', name:'journal',
        kicker:'FROM THE JOURNAL', title:'Keep the useful stuff coming.',
        copy:'Practical explanations of applying, hiring technology, and the parts that deserve a closer look.'},
      {selector:'.ym-article-end', mode:'beforebegin', name:'article',
        kicker:'YOURMOVE FIELD NOTES', title:'One less job-search mystery.',
        copy:'Get occasional notes on application forms, automation, and how to stay in control of what you submit.'},
      {selector:'.doc-last', mode:'beforebegin', name:'docs',
        kicker:'BEYOND THE HELP CENTER', title:'Understand the process behind the form.',
        copy:'Field Notes covers application systems and practical job-search questions beyond the YourMove product guides.'},
      {selector:'.doc-article', mode:'beforeend', name:'docs-article',
        kicker:'YOURMOVE FIELD NOTES', title:'There is more to the application.',
        copy:'Useful explanations of employer forms, ATS systems, and applying without handing over the final decision.'},
      {selector:'.start-help', mode:'beforebegin', name:'get-started',
        kicker:'FOLLOW THE WORK', title:'New explanations. Occasional product updates.',
        copy:'Receive Field Notes about job applications and YourMove. Downloading the app never requires an email address.'}
    ];
    const placement = placements.find(item => document.querySelector(item.selector));
    if (placement) {
      const make = (tag, className, value) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (value) node.textContent = value;
        return node;
      };
      const section = make('section', 'ym-notes ym-notes--' + placement.name);
      section.id = 'field-notes';
      section.setAttribute('aria-labelledby', 'field-notes-title');
      const frame = make('div', 'ym-notes__frame');
      const words = make('div', 'ym-notes__words');
      const kicker = make('p', 'ym-notes__kicker', placement.kicker);
      const title = make('h2', 'ym-notes__title', placement.title);
      title.id = 'field-notes-title';
      const description = make('p', 'ym-notes__description', placement.copy);
      words.append(kicker, title, description);
      const action = make('div', 'ym-notes__action');
      const form = make('form', 'ym-notes__form');
      form.method = 'post';
      form.action = kitFormURL;
      form.target = '_blank';
      form.setAttribute('rel', 'noopener');
      const label = make('label', 'ym-notes__label', 'Email address');
      label.htmlFor = 'field-notes-email';
      const fields = make('div', 'ym-notes__fields');
      const email = make('input', 'ym-notes__input');
      email.id = 'field-notes-email';
      email.name = 'email_address';
      email.type = 'email';
      email.required = true;
      email.autocomplete = 'email';
      email.placeholder = 'you@example.com';
      email.setAttribute('aria-describedby', 'field-notes-details');
      const submit = make('button', 'ym-notes__submit', 'Get Field Notes');
      submit.type = 'submit';
      fields.append(email, submit);
      const details = make('p', 'ym-notes__details',
        'Confirm by email. Occasional product updates; unsubscribe anytime. Delivered through Kit.');
      details.id = 'field-notes-details';
      const disclosure = make('p', 'ym-notes__disclosure',
        'Your email is used for Field Notes and YourMove updates, not to access the app.');
      form.append(label, fields, details);
      action.append(form, disclosure);
      frame.append(words, action);
      section.append(frame);
      document.querySelector(placement.selector).insertAdjacentElement(placement.mode, section);
      // Footer link is available only when the subscription endpoint is configured.
      const journalLink = document.querySelector('.footer-col[aria-label="Product"] a[href="/blog/"]');
      if (journalLink) {
        const link = make('a', '', 'Field Notes');
        link.href = '/blog/#field-notes';
        journalLink.insertAdjacentElement('afterend', link);
      }
    }
  }

})();
